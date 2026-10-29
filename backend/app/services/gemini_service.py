import os
import json
import re
import asyncio
import logging
from typing import Dict, Any, Tuple, Optional, List
from pathlib import Path

logger = logging.getLogger(__name__)

# Ensure backend/.env is loaded for standalone service runs and testing
_env_path = Path(__file__).resolve().parent.parent.parent / ".env"
if _env_path.is_file():
    for _line in _env_path.read_text(encoding="utf-8").splitlines():
        _line = _line.strip()
        if _line and not _line.startswith("#") and "=" in _line:
            _k, _v = _line.split("=", 1)
            os.environ.setdefault(_k.strip(), _v.strip().strip("\"'"))


class GeminiUnavailableError(RuntimeError):
    """A safe, user-displayable error for unavailable or unconfigured Gemini operations."""
    pass


_client = None
_cached_key = None


def is_gemini_configured() -> bool:
    """Check if a valid Gemini API key is configured in the environment."""
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return False
    key_str = api_key.strip()
    return bool(key_str and key_str not in {"", "MY_GEMINI_API_KEY", "your_gemini_api_key_here"})


def get_gemini_client():
    """
    Create or retrieve a server-only Gemini client from backend environment.
    Never caches a failed/None client so subsequent config changes take effect.
    """
    global _client, _cached_key
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key or api_key.strip() in {"", "MY_GEMINI_API_KEY", "your_gemini_api_key_here"}:
        _client = None
        _cached_key = None
        return None

    clean_key = api_key.strip()
    if _client is not None and _cached_key == clean_key:
        return _client

    try:
        from google import genai
        # 60-second request timeout for AI generation
        _client = genai.Client(api_key=clean_key, http_options={"timeout": 60000})
        _cached_key = clean_key
        return _client
    except Exception as exc:
        logger.warning("Gemini client initialization failed: %s", type(exc).__name__)
        _client = None
        _cached_key = None
        return None


def require_gemini_client():
    """Returns the active Gemini client or raises a user-safe GeminiUnavailableError."""
    client = get_gemini_client()
    if client is None:
        raise GeminiUnavailableError(
            "Gemini is not configured. Set GEMINI_API_KEY in backend/.env, then restart the backend."
        )
    return client


def _clean_json_text(raw_text: str) -> str:
    """Clean markdown code fences from JSON output if present."""
    text = (raw_text or "").strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
        text = re.sub(r"\s*```$", "", text)
    return text.strip()


async def call_gemini_structured(
    prompt: str,
    schema: Dict[str, Any],
    system_instruction: Optional[str] = None
) -> Dict[str, Any]:
    """
    Execute a structured JSON prompt against Gemini with bounded retries,
    fallback model support, and schema validation.
    """
    from google.genai import types

    client = require_gemini_client()

    configured_model = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite").strip()
    candidate_models: List[str] = [configured_model]
    for fallback in [
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite",
        "gemini-flash-latest",
        "gemini-3.5-flash-lite",
        "gemini-3.5-flash",
        "gemini-3.7-flash",
        "gemini-3.8-flash"
    ]:
        if fallback not in candidate_models:
            candidate_models.append(fallback)

    last_error: Optional[Exception] = None

    for attempt in range(3):
        for model_name in candidate_models:
            try:
                config = types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=schema,
                    system_instruction=system_instruction,
                    temperature=0.4,
                )

                result = await asyncio.wait_for(
                    asyncio.to_thread(
                        client.models.generate_content,
                        model=model_name,
                        contents=prompt,
                        config=config,
                    ),
                    timeout=50.0,
                )

                cleaned = _clean_json_text(result.text or "")
                if not cleaned:
                    raise ValueError("Gemini returned empty response text.")

                data = json.loads(cleaned)
                if not isinstance(data, dict):
                    raise ValueError(f"Expected JSON object, got {type(data).__name__}")

                return data

            except Exception as exc:
                last_error = exc
                if isinstance(exc, GeminiUnavailableError):
                    raise

                msg = str(exc).lower()
                status = getattr(exc, "status_code", None) or getattr(exc, "code", None)

                # Check for quota exhaustion
                if "quota" in msg or "resource_exhausted" in msg or (status == 429 and "quota" in msg):
                    raise GeminiUnavailableError(
                        "Gemini quota is exhausted. Check your Google AI Studio project quota and retry later."
                    ) from None

                # Check for invalid credentials
                if status in (401, 403) or "invalid api key" in msg or "unauthorized" in msg or "api_key_invalid" in msg:
                    raise GeminiUnavailableError(
                        "Gemini credentials are invalid or lack access. Check GEMINI_API_KEY in backend/.env."
                    ) from None

                # For 404, 503, 504 (deadline exceeded), TimeoutError, or 500, log and failover immediately to next model in candidate list
                logger.warning(
                    "Gemini model %s failed (%s: %s), trying fallback model in chain...",
                    model_name,
                    type(exc).__name__,
                    exc
                )
                continue

        # Bounded retry backoff across all models
        if attempt < 2:
            await asyncio.sleep(0.5 * (attempt + 1))

    logger.warning("All Gemini attempts failed: %s", last_error)
    raise GeminiUnavailableError(
        "Gemini could not complete this operation. Please retry; your answer is retained."
    )


def generate_local_advisor_reply(user_message: str, context: Dict[str, Any]) -> str:
    q = user_message.lower()
    target_role = context.get("targetRole", "Software Developer")
    readiness = context.get("readinessScore", 70)
    missing = ", ".join(context.get("missingSkills", [])[:3]) or "Database Modeling, Unit Testing"
    user_skills = ", ".join(context.get("userSkills", [])[:4]) or "Core Programming"

    if any(k in q for k in ["skill", "gap", "learn", "study"]):
        return (
            f"Based on your benchmark for **{target_role}**, your top prioritized skill gaps are in **{missing}**.\n\n"
            f"**Recommended Action Plan:**\n"
            f"1. Explore the verified resources in the **Learning Hub** (/learning) targeting {missing}.\n"
            f"2. Follow the milestones outlined in Phase 2 of your **Personalized Roadmap** (/roadmap).\n"
            f"3. Cement your learning by implementing a project featuring persistent data storage and automated tests."
        )

    if any(k in q for k in ["resume", "cv", "ats"]):
        return (
            f"To optimize your resume for **{target_role}**:\n\n"
            f"1. Ensure keywords for {target_role} are clearly listed in your Skills section ({missing}).\n"
            f"2. Lead each bullet point with strong action verbs (e.g. *Architected, Implemented, Streamlined*).\n"
            f"3. Quantify impact with concrete metrics (e.g. *improved API latency by 28%*, *handled 5k requests/day*).\n\n"
            f"Use the **Resume Analysis** tool (/resume) to get an instant ATS keyword breakdown."
        )

    if any(k in q for k in ["interview", "mock", "arena", "prep"]):
        return (
            f"For your upcoming **{target_role}** technical interviews:\n\n"
            f"1. Practice standard algorithmic problems focusing on hash maps, two pointers, and trees.\n"
            f"2. Prepare 3 behavioral stories using the STAR method (Situation, Task, Action, Result).\n"
            f"3. Run a 5-question simulation in the **Interview Arena** (/interview) to test your verbal deconstruction."
        )

    if any(k in q for k in ["project", "portfolio", "github"]):
        return (
            f"For a strong **{target_role}** portfolio:\n\n"
            f"1. Build an end-to-end full-stack or microservice application addressing a genuine real-world problem.\n"
            f"2. Include automated unit test suites and a CI/CD GitHub Action workflow.\n"
            f"3. Submit your repository in the **Proof of Skills** tracker (/evidence) to increase your readiness score."
        )

    return (
        f"Hello! I am your AI Career Advisor. I have context on your target career as **{target_role}** "
        f"with an internal employability readiness of **{readiness}%**.\n\n"
        f"You can ask me about:\n"
        f"- How to bridge your specific skill gaps ({missing})\n"
        f"- Tailoring your resume and passing ATS filters\n"
        f"- Recommended portfolio projects and learning resources\n"
        f"- Technical and behavioral interview strategies\n\n"
        f"How can I assist your career progression today?"
    )


async def chat_with_advisor(user_message: str, context: Dict[str, Any], history: list = []) -> Tuple[str, str]:
    """
    Genuine multi-turn conversation with Gemini AI Advisor.
    Preserves context, profile awareness, and conversational history across turns.
    """
    from google.genai import types

    client = require_gemini_client()

    target_role = context.get("targetRole", "Software Developer")
    readiness = context.get("readinessScore", 70)
    dominant = context.get("dominantArchetype", "Practical Builder")
    user_skills = ", ".join(context.get("userSkills", [])[:6]) or "Core Programming"
    missing = ", ".join(context.get("missingSkills", [])[:4]) or "Cloud Deployment, Testing"

    system_instruction = (
        f"You are an expert, empathetic, highly knowledgeable AI Career Guidance Advisor for software professionals.\n"
        f"Candidate Context:\n"
        f"- Name: {context.get('userName', 'Candidate')}\n"
        f"- Target Career: {target_role}\n"
        f"- Readiness Benchmark: {readiness}%\n"
        f"- Assessment Archetype: {dominant}\n"
        f"- Demonstrated Skills: {user_skills}\n"
        f"- Skills to Bridge: {missing}\n\n"
        f"Guidelines:\n"
        f"1. Provide actionable, concise, practical advice tailored to {target_role}.\n"
        f"2. Reference candidate's missing skills ({missing}) where relevant to their questions.\n"
        f"3. Guide them on portfolio building, resume impact, DSA, system design, and interview strategies.\n"
        f"4. Direct them to platform modules (/roadmap, /skills, /learning, /evidence, /interview, /resume) when appropriate.\n"
        f"5. Maintain conversation continuity by honoring previous messages in the chat history.\n"
        f"6. Never invent fake scores, false certificates, or synthetic job offers. Keep a supportive, professional tone."
    )

    # Format multi-turn conversation history
    contents = []
    for h in (history or []):
        r = "model" if h.get("role") in ["assistant", "model", "advisor"] else "user"
        txt = (h.get("content") or "").strip()
        if txt:
            contents.append(types.Content(role=r, parts=[types.Part.from_text(text=txt)]))

    # Append the current turn
    contents.append(types.Content(role="user", parts=[types.Part.from_text(text=user_message)]))

    configured_model = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite").strip()
    candidate_models: List[str] = [configured_model]
    for fallback in [
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite",
        "gemini-flash-latest",
        "gemini-3.5-flash-lite",
        "gemini-3.5-flash",
        "gemini-3.7-flash",
        "gemini-3.8-flash"
    ]:
        if fallback not in candidate_models:
            candidate_models.append(fallback)

    last_error: Optional[Exception] = None

    for attempt in range(2):
        for model_name in candidate_models:
            try:
                config = types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.6,
                )

                response = await asyncio.wait_for(
                    asyncio.to_thread(
                        client.models.generate_content,
                        model=model_name,
                        contents=contents,
                        config=config,
                    ),
                    timeout=30.0,
                )

                if response and response.text:
                    return response.text.strip(), "gemini"

            except Exception as exc:
                last_error = exc
                if isinstance(exc, GeminiUnavailableError):
                    raise

                msg = str(exc).lower()
                status = getattr(exc, "status_code", None) or getattr(exc, "code", None)

                if "quota" in msg or "resource_exhausted" in msg or (status == 429 and "quota" in msg):
                    raise GeminiUnavailableError("Gemini quota is exhausted. Please try again in a few moments.")

                if status in (401, 403) or "invalid api key" in msg or "unauthorized" in msg:
                    raise GeminiUnavailableError("Gemini API key is invalid or lacks access. Check backend/.env.")

                logger.warning("Gemini advisor model %s failed (%s: %s), trying next candidate...", model_name, type(exc).__name__, exc)
                continue

        if attempt < 1:
            await asyncio.sleep(0.5)

    logger.warning("All Gemini advisor models failed: %s", last_error)
    raise GeminiUnavailableError("Gemini AI Career Advisor is temporarily unavailable. Please retry your message.")
