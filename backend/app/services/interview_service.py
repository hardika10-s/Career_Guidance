import re
import json
import uuid
from difflib import SequenceMatcher
from typing import Dict, Any, List, Optional, Tuple
from backend.app.services.gemini_service import (
    get_gemini_client,
    require_gemini_client,
    call_gemini_structured,
    GeminiUnavailableError
)

# Comprehensive Role-Specific Question Repository covering all 8 roles and all 5 formats
INTERVIEW_QUESTION_BANKS: Dict[str, Dict[str, Dict[str, List[Dict[str, Any]]]]] = {
    # -------------------------------------------------------------
    # 1. SOFTWARE DEVELOPER
    # -------------------------------------------------------------
    "software-developer": {
        "technical": {
            "beginner": [
                {
                    "id": "sd_t_b1",
                    "topic": "Programming Fundamentals & Memory",
                    "question": "Could you explain the difference between pass-by-value and pass-by-reference in modern programming languages? How does memory allocation differ between stack and heap memory?",
                    "expectedKeyPoints": ["Stack holds primitive values and execution frames", "Heap stores dynamic objects", "Pass-by-value copies variable contents", "Pass-by-reference passes memory address"],
                    "difficulty": "Beginner"
                },
                {
                    "id": "sd_t_b2",
                    "topic": "Data Structures & Big-O",
                    "question": "When would you prefer using an Array / List versus a Hash Map / Dictionary? Can you describe their average and worst-case time complexities for lookup and insertion?",
                    "expectedKeyPoints": ["Array lookup by index is O(1), search is O(N)", "Hash map key lookup is O(1) average, O(N) worst case on collision", "Memory overhead considerations"],
                    "difficulty": "Beginner"
                },
                {
                    "id": "sd_t_b3",
                    "topic": "Debugging & Testing",
                    "question": "Walk me through how you isolate and debug a runtime NullPointer or undefined reference error when it occurs in a production environment.",
                    "expectedKeyPoints": ["Inspect stack trace and logs", "Reproduce locally with test case", "Defensive null checks or optional chaining", "Unit regression test"],
                    "difficulty": "Beginner"
                }
            ],
            "intermediate": [
                {
                    "id": "sd_t_i1",
                    "topic": "REST APIs & Concurrency",
                    "question": "How do you design an idempotent RESTful endpoint for a payment or order placement transaction? What headers, status codes, and database constraints do you utilize?",
                    "expectedKeyPoints": ["Idempotency keys (UUID) stored in Redis or DB", "Unique constraint to prevent double-charging", "HTTP 200 vs 201 vs 409 Conflict", "Atomic transaction blocks"],
                    "difficulty": "Intermediate"
                },
                {
                    "id": "sd_t_i2",
                    "topic": "Database Query Optimization",
                    "question": "Suppose a critical database query has slowed down from 30ms to 4.5 seconds under high load. What tools and steps do you use to diagnose, index, and optimize it?",
                    "expectedKeyPoints": ["EXPLAIN ANALYZE execution plan", "Check for missing indexes or sequential scans", "Examine composite index column order", "N+1 query detection", "Connection pool saturation"],
                    "difficulty": "Intermediate"
                },
                {
                    "id": "sd_t_i3",
                    "topic": "Caching Strategy & Invalidation",
                    "question": "Explain the trade-offs between cache-aside, write-through, and write-behind caching strategies. How do you prevent cache stampede when high-traffic keys expire?",
                    "expectedKeyPoints": ["Cache-aside application reads cache first then DB", "Write-through updates both synchronously", "Mutex locks or probabilistic early expiration for cache stampede"],
                    "difficulty": "Intermediate"
                }
            ],
            "advanced": [
                {
                    "id": "sd_t_a1",
                    "topic": "Distributed Consensus & Transactions",
                    "question": "How do you maintain data consistency across decoupled microservices without relying on distributed two-phase commit (2PC) locks? Explain the Saga pattern with compensating transactions.",
                    "expectedKeyPoints": ["2PC creates blocking bottlenecks", "Saga pattern with choreographed or orchestrated events", "Compensating transactions on failure", "Eventual consistency"],
                    "difficulty": "Advanced"
                },
                {
                    "id": "sd_t_a2",
                    "topic": "Fault Tolerance & Resilience",
                    "question": "How do you implement the Circuit Breaker pattern and bulkhead isolation in distributed systems to prevent cascading failure during downstream dependency outages?",
                    "expectedKeyPoints": ["States: Closed, Open, Half-Open", "Failure threshold and cooldown period", "Bulkheads limit resource pools (threads/connections)", "Graceful fallback responses"],
                    "difficulty": "Advanced"
                }
            ]
        },
        "coding": {
            "beginner": [
                {
                    "id": "sd_c_b1",
                    "topic": "Two Pointers & Array Processing",
                    "question": "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. Explain your approach and outline the solution.",
                    "codeContext": "Input: nums = [2, 7, 11, 15], target = 9\nOutput: [0, 1]\nConstraints: Exactly one valid answer exists. Target O(N) time complexity.",
                    "starterCode": "def two_sum(nums: list[int], target: int) -> list[int]:\n    # Write an O(N) solution using a hash map\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []",
                    "expectedKeyPoints": ["Hash map to store {value: index}", "Check if complement (target - num) exists in map", "Single pass O(N) time and O(N) space"],
                    "difficulty": "Beginner"
                },
                {
                    "id": "sd_c_b2",
                    "topic": "String Manipulation & Palindrome",
                    "question": "Given a string `s`, determine if it is a palindrome, considering only alphanumeric characters and ignoring cases.",
                    "codeContext": "Input: s = \"A man, a plan, a canal: Panama\"\nOutput: True\nExplanation: \"amanaplanacanalpanama\" is a palindrome.",
                    "starterCode": "def is_palindrome(s: str) -> bool:\n    # Implement two pointer approach ignoring non-alphanumeric chars\n    pass",
                    "expectedKeyPoints": ["Two pointers moving inward", "Skip non-alphanumeric characters", "Case-insensitive character comparison", "O(N) time, O(1) space"],
                    "difficulty": "Beginner"
                }
            ],
            "intermediate": [
                {
                    "id": "sd_c_i1",
                    "topic": "Sliding Window Optimization",
                    "question": "Longest Substring Without Repeating Characters: Given a string `s`, find the length of the longest substring without duplicate characters.",
                    "codeContext": "Input: s = \"abcabcbb\"\nOutput: 3 (\"abc\")\nConstraints: 0 <= s.length <= 5 * 10^4. Target O(N) time complexity.",
                    "starterCode": "def length_of_longest_substring(s: str) -> int:\n    # Implement sliding window with character index hash map\n    char_map = {}\n    left = 0\n    max_len = 0\n    # Complete implementation\n    return max_len",
                    "expectedKeyPoints": ["Sliding window with left and right pointers", "Hash map of character to last seen index", "Update left pointer when duplicate encountered", "O(N) time and O(min(N, M)) space"],
                    "difficulty": "Intermediate"
                },
                {
                    "id": "sd_c_i2",
                    "topic": "Interval Scheduling & Merging",
                    "question": "Merge Overlapping Intervals: Given an array of meeting intervals `intervals[i] = [start_i, end_i]`, merge all overlapping intervals and return an array of non-overlapping intervals.",
                    "codeContext": "Input: intervals = [[1,3],[2,6],[8,10],[15,18]]\nOutput: [[1,6],[8,10],[15,18]]\nExplanation: [1,3] and [2,6] overlap into [1,6].",
                    "starterCode": "def merge_intervals(intervals: list[list[int]]) -> list[list[int]]:\n    # Sort intervals by start time and merge overlaps\n    pass",
                    "expectedKeyPoints": ["Sort intervals by start time", "Iterate and compare current start with previous end", "Extend previous interval end if overlap exists", "O(N log N) time due to sorting"],
                    "difficulty": "Intermediate"
                }
            ],
            "advanced": [
                {
                    "id": "sd_c_a1",
                    "topic": "LRU Cache Data Structure",
                    "question": "Design an LRU (Least Recently Used) Cache with `get(key)` and `put(key, value)` operations, both executing in O(1) average time complexity.",
                    "codeContext": "Operations: LRUCache(capacity), get(key), put(key, value)\nConstraint: When capacity is reached, evict the least recently accessed item before inserting.",
                    "starterCode": "class Node:\n    def __init__(self, key: int, val: int):\n        self.key, self.val = key, val\n        self.prev = self.next = None\n\nclass LRUCache:\n    def __init__(self, capacity: int):\n        self.cap = capacity\n        self.cache = {}\n        # Doubly linked list dummy head and tail\n    def get(self, key: int) -> int:\n        pass\n    def put(self, key: int, value: int) -> None:\n        pass",
                    "expectedKeyPoints": ["Combine Hash Map and Doubly Linked List", "Hash map maps key to doubly linked list node", "Doubly linked list allows O(1) removal and head insertion", "Evict tail node on overflow"],
                    "difficulty": "Advanced"
                }
            ]
        },
        "system_design": {
            "beginner": [
                {
                    "id": "sd_sd_b1",
                    "topic": "URL Shortener Architecture",
                    "question": "Design a basic URL Shortening service like TinyURL. Walk me through the API design, hash/ID generation strategy, database schema, and how you redirect users to the original URL.",
                    "expectedKeyPoints": ["REST endpoints: POST /api/shorten and GET /{shortCode}", "Base62 encoding of auto-incrementing ID or hash", "Relational schema: id, original_url, short_code, created_at", "HTTP 301 vs 302 redirect difference"],
                    "difficulty": "Beginner"
                }
            ],
            "intermediate": [
                {
                    "id": "sd_sd_i1",
                    "topic": "Distributed Rate Limiter",
                    "question": "Design a distributed Rate Limiter service that protects an API from abuse (e.g., maximum 100 requests per minute per IP address). Explain your algorithm choice, storage layer, and concurrency handling.",
                    "expectedKeyPoints": ["Token Bucket or Sliding Window Log algorithm", "Redis storage with atomic Lua scripts or INCR + EXPIRE", "Handling clock drift and race conditions", "Returning HTTP 429 Too Many Requests with Retry-After header"],
                    "difficulty": "Intermediate"
                }
            ],
            "advanced": [
                {
                    "id": "sd_sd_a1",
                    "topic": "Real-Time Collaborative Document Canvas",
                    "question": "Design a real-time collaborative document editor like Google Docs supporting concurrent typing from 50 active users on the same document. How do you resolve conflicts, manage state, and maintain low latency?",
                    "expectedKeyPoints": ["WebSockets for bi-directional live updates", "Operational Transformation (OT) or CRDTs for conflict resolution", "In-memory document snapshot in Redis", "Periodic asynchronous flush to persistent storage"],
                    "difficulty": "Advanced"
                }
            ]
        },
        "behavioral": {
            "beginner": [
                {
                    "id": "sd_b_b1",
                    "topic": "Overcoming Technical Roadblocks",
                    "question": "Tell me about a time you encountered a software bug or obstacle that you could not solve right away. How did you structure your investigation, who did you consult, and what was the outcome?",
                    "expectedKeyPoints": ["Situation and Task definition", "Systematic debugging actions taken", "Consulting documentation/mentors thoughtfully", "Measurable resolution and learning"],
                    "difficulty": "Beginner"
                }
            ],
            "intermediate": [
                {
                    "id": "sd_b_i1",
                    "topic": "Prioritization Under Shifting Deadlines",
                    "question": "Describe a scenario where project requirements or priorities changed significantly midway through development. How did you realign your tasks, communicate trade-offs, and ensure timely delivery?",
                    "expectedKeyPoints": ["Situation context and shifting business need", "Deconstructing scope into MVP deliverables", "Proactive stakeholder communication", "Successful delivery with minimal tech debt"],
                    "difficulty": "Intermediate"
                }
            ],
            "advanced": [
                {
                    "id": "sd_b_a1",
                    "topic": "Managing Production Outages & Post-Mortems",
                    "question": "Walk me through the most severe production incident or outage you were involved with. How did you participate in triage, communicate with non-technical stakeholders, and lead the blameless post-mortem?",
                    "expectedKeyPoints": ["Immediate containment and rollback", "Clear status updates to stakeholders", "Root cause analysis (5 Whys)", "Actionable prevention items in blameless post-mortem"],
                    "difficulty": "Advanced"
                }
            ]
        },
        "hr": {
            "beginner": [
                {
                    "id": "sd_hr_b1",
                    "topic": "Career Motivation & Fit",
                    "question": "Why are you interested in pursuing a career as a Software Developer? What specific technical challenges or product domains motivate you most when you write code?",
                    "expectedKeyPoints": ["Intrinsic motivation for problem solving", "Passion for building real-world software", "Continuous learning appetite"],
                    "difficulty": "Beginner"
                }
            ],
            "intermediate": [
                {
                    "id": "sd_hr_i1",
                    "topic": "Growth & Engineering Impact",
                    "question": "Where do you see yourself evolving as an engineer over the next 2 to 3 years? What competencies or leadership traits are you actively trying to develop right now?",
                    "expectedKeyPoints": ["Clear trajectory towards architecture or leadership", "Concrete current learning habits", "Desire to mentor junior peers"],
                    "difficulty": "Intermediate"
                }
            ],
            "advanced": [
                {
                    "id": "sd_hr_a1",
                    "topic": "Mentorship & Culture Building",
                    "question": "How do you help foster engineering excellence, code quality standards, and psychological safety in an engineering organization as you gain seniority?",
                    "expectedKeyPoints": ["Thoughtful code reviews and knowledge sharing", "Establishing sound practices without dogmatism", "Encouraging experimentation"],
                    "difficulty": "Advanced"
                }
            ]
        }
    },

    # -------------------------------------------------------------
    # 2. FRONTEND DEVELOPER
    # -------------------------------------------------------------
    "frontend-developer": {
        "technical": {
            "beginner": [
                {
                    "id": "fe_t_b1",
                    "topic": "DOM & Event Propagation",
                    "question": "Explain how event delegation works in the browser DOM. What is the difference between event bubbling and event capturing?",
                    "expectedKeyPoints": ["Event phases: capture, target, bubbling", "Delegation attaches single listener to parent", "Improves memory and handles dynamic elements"],
                    "difficulty": "Beginner"
                },
                {
                    "id": "fe_t_b2",
                    "topic": "CSS Layouts & Box Model",
                    "question": "Walk me through the CSS box model (content, padding, border, margin). When do you choose CSS Grid over Flexbox?",
                    "expectedKeyPoints": ["box-sizing: border-box vs content-box", "Flexbox is 1D (rows or columns)", "Grid is 2D (rows and columns simultaneously)"],
                    "difficulty": "Beginner"
                }
            ],
            "intermediate": [
                {
                    "id": "fe_t_i1",
                    "topic": "React Rendering & Reconciliation",
                    "question": "How does React's Virtual DOM and Fiber reconciliation engine work? What causes unnecessary re-renders, and how do you optimize them using memoization and state colocation?",
                    "expectedKeyPoints": ["Virtual DOM diffing algorithm", "Fiber scheduler enables interruptible rendering", "React.memo, useMemo, useCallback usage", "State colocation avoids lifting state too high"],
                    "difficulty": "Intermediate"
                },
                {
                    "id": "fe_t_i2",
                    "topic": "Web Performance & Core Web Vitals",
                    "question": "How do you optimize Core Web Vitals (LCP, INP, and CLS) in a modern single-page application? What techniques do you use for code-splitting and asset loading?",
                    "expectedKeyPoints": ["LCP optimization with priority hints and image preloading", "INP reduction by yielding main thread", "CLS prevention with explicit layout dimensions", "Dynamic imports (React.lazy) and route-level splitting"],
                    "difficulty": "Intermediate"
                }
            ],
            "advanced": [
                {
                    "id": "fe_t_a1",
                    "topic": "Micro-Frontends & Architecture",
                    "question": "How would you architect a large-scale enterprise web application using Module Federation or Micro-Frontends? How do you manage shared state, design systems, and routing across independent deployables?",
                    "expectedKeyPoints": ["Webpack / Vite Module Federation", "Cross-app communication via custom events or light state bridge", "Independent CI/CD pipelines", "Version isolation of design components"],
                    "difficulty": "Advanced"
                }
            ]
        },
        "coding": {
            "beginner": [
                {
                    "id": "fe_c_b1",
                    "topic": "Debounce Function Implementation",
                    "question": "Implement a `debounce` higher-order utility function in JavaScript that delays executing the passed callback until after `delay` milliseconds have elapsed since the last invocation.",
                    "codeContext": "Signature: debounce(fn, delay)\nUsage: window.addEventListener('resize', debounce(onResize, 250))\nRequirement: Must support arguments and correct `this` context binding.",
                    "starterCode": "function debounce(fn, delay) {\n  let timerId = null;\n  return function(...args) {\n    const context = this;\n    if (timerId) clearTimeout(timerId);\n    timerId = setTimeout(() => {\n      fn.apply(context, args);\n    }, delay);\n  };\n}",
                    "expectedKeyPoints": ["Closure capturing `timerId`", "Clear previous timeout on new invocation", "Preserve context (`this`) and arguments with apply/spread"],
                    "difficulty": "Beginner"
                },
                {
                    "id": "fe_c_b2",
                    "topic": "Array Flattening Polyfill",
                    "question": "Implement a custom `flatten(array, depth)` function without using built-in `Array.prototype.flat()`. It should recursively flatten nested arrays up to the specified depth.",
                    "codeContext": "Input: flatten([1, [2, [3, [4]], 5]], 2)\nOutput: [1, 2, 3, [4], 5]\nEdge case: depth = 0 or negative should return original array shallow copy.",
                    "starterCode": "function flatten(arr, depth = 1) {\n  // Implement recursive or iterative flattening\n  if (depth <= 0) return arr.slice();\n  const result = [];\n  // Complete implementation\n  return result;\n}",
                    "expectedKeyPoints": ["Recursion with depth decrement", "Check Array.isArray(item)", "Spread or push items into result array", "Base case when depth reaches 0"],
                    "difficulty": "Beginner"
                }
            ],
            "intermediate": [
                {
                    "id": "fe_c_i1",
                    "topic": "DOM Node Tree Traversal",
                    "question": "Write a function `findDomNodesByClassName(root, className)` that traverses a DOM tree (or nested object model) and returns an array of all matching nodes without using built-in `querySelectorAll`.",
                    "codeContext": "Input: root element and string className\nOutput: Array of matching HTMLElement nodes.\nTarget: BFS or DFS traversal with O(N) node visitation.",
                    "starterCode": "function findDomNodesByClassName(root, className) {\n  const matches = [];\n  function traverse(node) {\n    if (!node) return;\n    if (node.classList && node.classList.contains(className)) {\n      matches.push(node);\n    }\n    for (const child of node.children || []) {\n      traverse(child);\n    }\n  }\n  traverse(root);\n  return matches;\n}",
                    "expectedKeyPoints": ["Depth-first or breadth-first tree traversal", "Check element class list safely", "Handle arbitrary nesting and leaf nodes"],
                    "difficulty": "Intermediate"
                }
            ],
            "advanced": [
                {
                    "id": "fe_c_a1",
                    "topic": "Concurrent Promise Pool (p-limit)",
                    "question": "Implement a `promisePool(functions, concurrencyLimit)` executor that runs an array of asynchronous task functions with at most `concurrencyLimit` promises executing simultaneously.",
                    "codeContext": "Input: functions = [() => fetch(url1), () => fetch(url2), ...], limit = 3\nOutput: Promise resolving to array of resolved results in original order.",
                    "starterCode": "async function promisePool(functions, limit) {\n  // Implement concurrent task pool resolving all results in order\n  const results = new Array(functions.length);\n  let executingIndex = 0;\n  // Complete concurrency scheduler\n  return results;\n}",
                    "expectedKeyPoints": ["Track current index pointer across async workers", "Spawn `limit` simultaneous worker chains", "Store results by original index for ordering", "Handle rejection gracefully"],
                    "difficulty": "Advanced"
                }
            ]
        },
        "system_design": {
            "beginner": [
                {
                    "id": "fe_sd_b1",
                    "topic": "Design System Component Library",
                    "question": "How would you design a scalable Design System component library (Buttons, Modals, Form inputs) supporting dynamic dark/light themes, WCAG AA accessibility, and tree-shaking?",
                    "expectedKeyPoints": ["CSS Custom Properties / design tokens for theme variables", "Accessible ARIA attributes and keyboard focus management", "Compound component or hook-based architecture", "Tree-shakable ES modules with TypeScript definitions"],
                    "difficulty": "Beginner"
                }
            ],
            "intermediate": [
                {
                    "id": "fe_sd_i1",
                    "topic": "Virtualized Infinite Feed Architecture",
                    "question": "Design an infinite scrolling media feed (like Instagram or Twitter) with thousands of multimedia items. How do you implement window virtualization, image prefetching, and scroll restoration?",
                    "expectedKeyPoints": ["DOM node recycling / window virtualization (only render visible viewport +/- overscan)", "IntersectionObserver for image lazy loading and trigger fetches", "Session storage scroll offset preservation", "Layout shift prevention with aspect-ratio boxes"],
                    "difficulty": "Intermediate"
                }
            ],
            "advanced": [
                {
                    "id": "fe_sd_a1",
                    "topic": "Offline-First Progressive Web App",
                    "question": "Architect an offline-first task management web app. How do you manage Service Worker caching strategies, IndexedDB local synchronization, background sync, and conflict resolution during re-connection?",
                    "expectedKeyPoints": ["Service worker Workbox cache strategies (Stale-While-Revalidate)", "Client-side IndexedDB with Dexie/idb", "Background Sync API for deferred POST mutations", "CRDTs or Last-Write-Wins with revision timestamps for conflict resolution"],
                    "difficulty": "Advanced"
                }
            ]
        },
        "behavioral": {
            "beginner": [
                {
                    "id": "fe_b_b1",
                    "topic": "Debugging Cross-Browser Rendering Glitches",
                    "question": "Tell me about a tricky frontend UI rendering bug or cross-browser quirk (Safari vs Chrome) you faced. How did you identify the root cause and solve it?",
                    "expectedKeyPoints": ["Clear situation and browser difference", "Systematic use of devtools, computed styles, or layout inspector", "Clean standard-compliant solution without hacky overrides"],
                    "difficulty": "Beginner"
                }
            ],
            "intermediate": [
                {
                    "id": "fe_b_i1",
                    "topic": "Collaborating with UX Designers on Feasibility",
                    "question": "Describe a situation where a design proposal was visually impressive but posed major performance or engineering hurdles. How did you collaborate with the designer to reach a great compromise?",
                    "expectedKeyPoints": ["Respectful framing of performance or accessibility trade-offs", "Prototyping interactive alternatives", "Outcome that preserved user delight while maintaining 60fps performance"],
                    "difficulty": "Intermediate"
                }
            ],
            "advanced": [
                {
                    "id": "fe_b_a1",
                    "topic": "Leading Frontend Stack Modernization",
                    "question": "Have you ever led or participated in a large frontend migration (e.g., from legacy JavaScript/jQuery to modern React, or from REST to GraphQL)? How did you ensure zero regressions?",
                    "expectedKeyPoints": ["Incremental strangler fig migration strategy", "Automated end-to-end regression tests (Playwright/Cypress)", "Maintaining developer velocity during transition"],
                    "difficulty": "Advanced"
                }
            ]
        },
        "hr": {
            "beginner": [
                {
                    "id": "fe_hr_b1",
                    "topic": "Frontend Craftsmanship & UX Passion",
                    "question": "What draws you to frontend engineering over backend? How do you balance aesthetic design sensibility with rigorous technical code quality?",
                    "expectedKeyPoints": ["Passion for instant user feedback and polished user experience", "Focus on accessibility and responsive performance", "Continuous learning in evolving web ecosystem"],
                    "difficulty": "Beginner"
                }
            ],
            "intermediate": [
                {
                    "id": "fe_hr_i1",
                    "topic": "Cross-Functional Collaboration",
                    "question": "Frontend developers sit directly between product managers, backend API teams, and designers. How do you ensure smooth communication across these disciplines?",
                    "expectedKeyPoints": ["Clear API contracts agreed early with backend", "Design system alignment with UX", "Empathy and proactive alignment on edge cases"],
                    "difficulty": "Intermediate"
                }
            ],
            "advanced": [
                {
                    "id": "fe_hr_a1",
                    "topic": "Advocating for Web Accessibility & Performance",
                    "question": "How do you champion web performance and accessibility (a11y) standards in a fast-paced environment where leadership prioritizes rapid feature delivery?",
                    "expectedKeyPoints": ["Educating team members via linting and CI performance budgets", "Demonstrating business impact (conversion drop on slow LCP)", "Embedding accessibility into base design system components"],
                    "difficulty": "Advanced"
                }
            ]
        }
    },

    # -------------------------------------------------------------
    # 3. BACKEND DEVELOPER
    # -------------------------------------------------------------
    "backend-developer": {
        "technical": {
            "beginner": [
                {
                    "id": "be_t_b1",
                    "topic": "Database Relationships & Normalization",
                    "question": "What is database normalization (1NF, 2NF, 3NF), and why is it important in relational schemas? When might you intentionally denormalize a table?",
                    "expectedKeyPoints": ["Eliminating data redundancy and update anomalies", "3NF ensures fields depend only on primary key", "Denormalization for read-heavy query optimization"],
                    "difficulty": "Beginner"
                },
                {
                    "id": "be_t_b2",
                    "topic": "HTTP Protocols & Status Codes",
                    "question": "What are the key differences between HTTP/1.1, HTTP/2, and HTTP/3? How does multiplexing eliminate head-of-line blocking?",
                    "expectedKeyPoints": ["HTTP/1.1 head-of-line blocking on single TCP connection", "HTTP/2 binary framing and multiplexed streams", "HTTP/3 uses QUIC over UDP to eliminate transport HOL blocking"],
                    "difficulty": "Beginner"
                }
            ],
            "intermediate": [
                {
                    "id": "be_t_i1",
                    "topic": "Database Indexing & B-Trees",
                    "question": "How do B-Tree indexes work internally in PostgreSQL/MySQL? Why does column order matter in a composite index, and what queries cannot use the index?",
                    "expectedKeyPoints": ["Balanced tree node structure", "Leftmost prefix rule for composite indexes", "Index scan vs index-only scan vs sequential scan", "Function calls on columns preventing index usage"],
                    "difficulty": "Intermediate"
                },
                {
                    "id": "be_t_i2",
                    "topic": "API Security & Token Authentication",
                    "question": "Walk me through how you implement secure stateless JWT authentication with short-lived access tokens and refresh tokens. How do you revoke compromised refresh tokens?",
                    "expectedKeyPoints": ["Access token stored in memory, refresh token in httpOnly SameSite cookie", "Token rotation on every refresh", "Token family invalidation on reuse detection", "Redis blacklist for immediate revocation"],
                    "difficulty": "Intermediate"
                }
            ],
            "advanced": [
                {
                    "id": "be_t_a1",
                    "topic": "Distributed Transactions & Event Sourcing",
                    "question": "Explain Event Sourcing and CQRS (Command Query Responsibility Segregation). How do they handle eventual consistency, schema evolution, and high-throughput write models?",
                    "expectedKeyPoints": ["State stored as immutable sequence of events", "Separate read models optimized for queries", "Kafka/RabbitMQ event distribution", "Snapshotting to avoid replaying millions of events"],
                    "difficulty": "Advanced"
                }
            ]
        },
        "coding": {
            "beginner": [
                {
                    "id": "be_c_b1",
                    "topic": "Valid Parentheses & Syntax Validator",
                    "question": "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. Explain your stack data structure approach.",
                    "codeContext": "Input: s = \"()[]{}\"\nOutput: True\nInput: s = \"(]\"\nOutput: False\nTarget: O(N) time and O(N) auxiliary space.",
                    "starterCode": "def is_valid_parentheses(s: str) -> bool:\n    stack = []\n    mapping = {')': '(', '}': '{', ']': '['}\n    # Complete implementation\n    return len(stack) == 0",
                    "expectedKeyPoints": ["Push opening brackets to stack", "Pop and verify matching bracket when closing character seen", "Check empty stack at end"],
                    "difficulty": "Beginner"
                }
            ],
            "intermediate": [
                {
                    "id": "be_c_i1",
                    "topic": "In-Memory Rate Limiter (Token Bucket)",
                    "question": "Implement an in-memory `TokenBucket` class that regulates API calls. It should allow up to `capacity` tokens, replenishing at `refill_rate` tokens per second.",
                    "codeContext": "Signature: TokenBucket(capacity, refill_rate), allow_request() -> bool\nBehavior: Deduct 1 token if available; calculate elapsed refill dynamically without background threads.",
                    "starterCode": "import time\n\nclass TokenBucket:\n    def __init__(self, capacity: int, refill_rate: float):\n        self.capacity = capacity\n        self.tokens = capacity\n        self.refill_rate = refill_rate\n        self.last_refill = time.time()\n\n    def allow_request(self) -> bool:\n        # Calculate tokens added since last_refill and check availability\n        pass",
                    "expectedKeyPoints": ["Calculate elapsed time since last request", "Refill tokens: min(capacity, tokens + elapsed * refill_rate)", "Deduct token and return True if >= 1, else False"],
                    "difficulty": "Intermediate"
                }
            ],
            "advanced": [
                {
                    "id": "be_c_a1",
                    "topic": "Thread-Safe TTL Cache",
                    "question": "Design a thread-safe in-memory Key-Value Cache supporting `set(key, val, ttl_seconds)` and `get(key)`. Keys must automatically expire and return `None` once their TTL has elapsed.",
                    "codeContext": "Concurrency requirement: Safe under concurrent read and write operations. Avoid memory leaks from dead expired keys.",
                    "starterCode": "import time\nimport threading\n\nclass TTLCache:\n    def __init__(self):\n        self._cache = {}\n        self._lock = threading.RLock()\n\n    def set(self, key: str, val: any, ttl_seconds: float) -> None:\n        pass\n\n    def get(self, key: str) -> any:\n        pass",
                    "expectedKeyPoints": ["Store (value, expire_timestamp) tuple", "Thread synchronization via locks or RLock", "Lazy expiration check on get()", "Periodic cleanup thread for unread expired keys"],
                    "difficulty": "Advanced"
                }
            ]
        },
        "system_design": {
            "beginner": [
                {
                    "id": "be_sd_b1",
                    "topic": "Scalable RESTful API with Pagination",
                    "question": "Design a clean RESTful API for an e-commerce order management system. Explain the difference between offset-based pagination and cursor-based (keyset) pagination for large datasets.",
                    "expectedKeyPoints": ["OFFSET skips N rows causing sequential scan performance degradation", "Cursor pagination uses indexed column (WHERE id > last_seen_id LIMIT 20)", "Stable pagination when records are inserted concurrently"],
                    "difficulty": "Beginner"
                }
            ],
            "intermediate": [
                {
                    "id": "be_sd_i1",
                    "topic": "Asynchronous Notification Pipeline",
                    "question": "Architect a high-volume notification delivery service (Email, SMS, Push notifications) sending 5 million alerts per day. How do you handle third-party gateway downtime, retries, and rate limits?",
                    "expectedKeyPoints": ["Message broker (RabbitMQ / Kafka / SQS)", "Dedicated worker pools per channel type", "Exponential backoff with jitter and Dead-Letter Queue (DLQ)", "Idempotency key per notification to prevent duplicate sends"],
                    "difficulty": "Intermediate"
                }
            ],
            "advanced": [
                {
                    "id": "be_sd_a1",
                    "topic": "Distributed Payment Gateway with Idempotency",
                    "question": "Design a core payment processing backend that communicates with Stripe/Adyen. How do you guarantee exact-once charging semantics, handle network timeouts during external API calls, and maintain ACID audit logs?",
                    "expectedKeyPoints": ["Client generates Idempotency-Key UUID stored in distributed store (Redis/DB)", "State machine: PENDING -> PROCESSING -> CHARGED / FAILED", "Two-phase commit or Outbox pattern with event publishing", "Reconciliation worker scanning for pending transactions"],
                    "difficulty": "Advanced"
                }
            ]
        },
        "behavioral": {
            "beginner": [
                {
                    "id": "be_b_b1",
                    "topic": "Managing Production Database Schema Changes",
                    "question": "Tell me about a time you had to execute a database migration on a live system. How did you plan the migration to prevent locking large tables and avoid downtime?",
                    "expectedKeyPoints": ["Add nullable column or default without table rewrite", "Dual-write strategy before backfilling", "Testing migration against sanitized staging dataset"],
                    "difficulty": "Beginner"
                }
            ],
            "intermediate": [
                {
                    "id": "be_b_i1",
                    "topic": "Resolving Technical Debt vs Product Delivery",
                    "question": "Describe a scenario where existing backend technical debt was significantly slowing down feature delivery. How did you build a business case for refactoring to non-technical stakeholders?",
                    "expectedKeyPoints": ["Quantifying velocity loss, bug incident frequency, or server costs", "Proposing incremental refactoring within feature sprints", "Measurable improvement in delivery speed post-refactor"],
                    "difficulty": "Intermediate"
                }
            ],
            "advanced": [
                {
                    "id": "be_b_a1",
                    "topic": "Post-Mortem of a Critical Production Outage",
                    "question": "Walk me through a high-severity production outage you resolved. How did you coordinate triage, communicate with leadership, and author the blameless post-mortem?",
                    "expectedKeyPoints": ["Immediate stabilization (rollback, rate-limit, failover)", "5-Whys root cause investigation", "Concrete preventive engineering actions added to sprint backlog"],
                    "difficulty": "Advanced"
                }
            ]
        },
        "hr": {
            "beginner": [
                {
                    "id": "be_hr_b1",
                    "topic": "Backend Reliability & Ownership",
                    "question": "What qualities make a backend developer dependable when building mission-critical services? How do you ensure code correctness before pushing to production?",
                    "expectedKeyPoints": ["Disciplined unit and integration testing", "Thoughtful error handling and defensive coding", "Proactive telemetry and logging"],
                    "difficulty": "Beginner"
                }
            ],
            "intermediate": [
                {
                    "id": "be_hr_i1",
                    "topic": "On-Call Rotation & Incident Composure",
                    "question": "Handling production on-call rotations can be stressful. How do you prepare yourself and your team for on-call duties, and how do you prevent alarm fatigue?",
                    "expectedKeyPoints": ["Actionable runbooks and clear escalation paths", "Tuning alert thresholds to eliminate noise/flapping alerts", "Ensuring psychological safety and sustainable rotation schedules"],
                    "difficulty": "Intermediate"
                }
            ],
            "advanced": [
                {
                    "id": "be_hr_a1",
                    "topic": "Architectural Leadership & Mentorship",
                    "question": "How do you guide newer backend developers in writing resilient distributed code without being overbearing or rigid during code reviews?",
                    "expectedKeyPoints": ["Explain the 'why' behind architectural patterns and safety checks", "Pair programming on complex database and concurrency features", "Fostering an open culture of learning and shared responsibility"],
                    "difficulty": "Advanced"
                }
            ]
        }
    },

    # -------------------------------------------------------------
    # 4. FULL-STACK DEVELOPER
    # -------------------------------------------------------------
    "full-stack-developer": {
        "technical": {
            "beginner": [
                {
                    "id": "fs_t_b1",
                    "topic": "End-to-End Client-Server Architecture",
                    "question": "Walk me through the lifecycle of a web request from a button click in a React UI to a database record insertion in the backend. What headers, payloads, and protocols are involved?",
                    "expectedKeyPoints": ["DOM click event triggers fetch / axios POST with JSON payload", "CORS preflight OPTIONS check if cross-origin", "Backend router parsing body, auth token validation", "ORM/SQL transaction commit and 201 response"],
                    "difficulty": "Beginner"
                },
                {
                    "id": "fs_t_b2",
                    "topic": "State Management & Server Synchronization",
                    "question": "Compare managing server state (via React Query/TanStack Query or SWR) with managing client UI state (via Zustand/Redux). Why is caching server state different from global UI state?",
                    "expectedKeyPoints": ["Server state is asynchronous, remotely owned, and needs cache invalidation", "Client state is synchronous and ephemeral (modals, form draft)", "Deduplication and background revalidation"],
                    "difficulty": "Beginner"
                }
            ],
            "intermediate": [
                {
                    "id": "fs_t_i1",
                    "topic": "Optimistic UI Updates & Error Rollbacks",
                    "question": "How do you implement Optimistic UI updates (e.g. instant 'Like' or 'Task Complete' toggle)? How do you roll back the UI if the backend request fails or times out?",
                    "expectedKeyPoints": ["Immediately mutate local client cache and update UI", "Retain snapshot of previous state", "If mutation throws error, revert state to snapshot and show toast alert", "On success, replace temporary ID with server ID"],
                    "difficulty": "Intermediate"
                },
                {
                    "id": "fs_t_i2",
                    "topic": "Server-Side Rendering (SSR) & Hydration",
                    "question": "Explain how Next.js Server-Side Rendering (SSR) works and what causes hydration mismatch errors. How do you prevent layout shifts and mismatched HTML between server and client?",
                    "expectedKeyPoints": ["Server renders initial HTML string for fast first paint", "Client JavaScript downloads and attaches event listeners (hydration)", "Hydration mismatch caused by window access or random IDs during render", "Fix with useEffect or dynamic import with ssr: false"],
                    "difficulty": "Intermediate"
                }
            ],
            "advanced": [
                {
                    "id": "fs_t_a1",
                    "topic": "Full-Stack Security & CORS / CSRF Defenses",
                    "question": "How do you protect a modern full-stack web application against both CSRF and XSS attacks when using JWTs, cookies, and third-party API webhooks?",
                    "expectedKeyPoints": ["httpOnly SameSite=Lax/Strict cookies for session tokens", "Anti-CSRF synchronizer token for state-changing forms", "Content Security Policy (CSP) headers against XSS", "HMAC cryptographic signature validation for incoming webhooks"],
                    "difficulty": "Advanced"
                }
            ]
        },
        "coding": {
            "beginner": [
                {
                    "id": "fs_c_b1",
                    "topic": "Group Anagrams Data Aggregator",
                    "question": "Given an array of strings `strs`, group the anagrams together in any order. Explain your hash map grouping strategy.",
                    "codeContext": "Input: strs = [\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]\nOutput: [[\"bat\"],[\"nat\",\"tan\"],[\"ate\",\"eat\",\"tea\"]]\nTarget: O(N * K log K) or O(N * K) time complexity.",
                    "starterCode": "from collections import defaultdict\n\ndef group_anagrams(strs: list[str]) -> list[list[str]]:\n    anagram_map = defaultdict(list)\n    for s in strs:\n        # Generate canonical key (e.g. sorted characters or character count tuple)\n        key = \"\".join(sorted(s))\n        anagram_map[key].append(s)\n    return list(anagram_map.values())",
                    "expectedKeyPoints": ["Use sorted string or 26-element character frequency tuple as dictionary key", "Append original strings to matching bucket", "Return all dictionary values"],
                    "difficulty": "Beginner"
                }
            ],
            "intermediate": [
                {
                    "id": "fs_c_i1",
                    "topic": "Client-Server Pagination Slicer",
                    "question": "Write a utility function `paginate_and_filter(items, search_term, page, page_size)` that searches across string fields and returns the correct page slice alongside total count and total pages.",
                    "codeContext": "Input: items (list of dicts), search_term (str), page (int 1-indexed), page_size (int)\nOutput: dict with {items, total_count, total_pages, current_page, has_next}",
                    "starterCode": "def paginate_and_filter(items: list[dict], search_term: str, page: int, page_size: int) -> dict:\n    # Filter items matching search_term in any string value\n    # Slice for page and page_size, return paginated envelope\n    pass",
                    "expectedKeyPoints": ["Case-insensitive search across dictionary string values", "Calculate total_pages = ceil(total_count / page_size)", "Zero-indexed slicing: start = (page - 1) * page_size", "Edge cases: page out of bounds, empty items list"],
                    "difficulty": "Intermediate"
                }
            ],
            "advanced": [
                {
                    "id": "fs_c_a1",
                    "topic": "Async Retry with Exponential Backoff and Jitter",
                    "question": "Implement an async retry wrapper function in Python or JavaScript that retries transient failed network calls with exponential backoff and randomized jitter.",
                    "codeContext": "Signature: async_retry(async_fn, max_retries=3, base_delay=1.0, max_delay=10.0)\nRequirement: Add random jitter to prevent thundering herd problem.",
                    "starterCode": "import asyncio\nimport random\n\nasync def async_retry(async_fn, max_retries=3, base_delay=1.0, max_delay=10.0):\n    for attempt in range(max_retries + 1):\n        try:\n            return await async_fn()\n        except Exception as e:\n            if attempt == max_retries:\n                raise e\n            # Calculate backoff with jitter\n            delay = min(max_delay, base_delay * (2 ** attempt)) + random.uniform(0, 0.5)\n            await asyncio.sleep(delay)",
                    "expectedKeyPoints": ["Exponential delay calculation: base * 2^attempt", "Randomized jitter component", "Cap at max_delay", "Reraise error after max_retries exhausted"],
                    "difficulty": "Advanced"
                }
            ]
        },
        "system_design": {
            "beginner": [
                {
                    "id": "fs_sd_b1",
                    "topic": "Full-Stack E-Commerce Storefront Architecture",
                    "question": "Design an end-to-end e-commerce website architecture (Product listing, Cart, Checkout, Order tracking). How do you separate frontend presentation, backend business logic, and payment processing?",
                    "expectedKeyPoints": ["Frontend SPA/SSR communicating via REST or GraphQL", "Stateless API server with session/JWT auth", "Cart stored in Redis or database with inventory lock", "Stripe payment integration with webhook confirmation"],
                    "difficulty": "Beginner"
                }
            ],
            "intermediate": [
                {
                    "id": "fs_sd_i1",
                    "topic": "Real-Time Chat & Activity Feed",
                    "question": "Design a real-time messaging application with active presence indicators (online/offline) and unread notification badges. How do you handle WebSocket connection drops and message delivery guarantees?",
                    "expectedKeyPoints": ["WebSockets with heartbeat ping/pong", "Redis Pub/Sub or Socket.io cluster adapter across multiple server nodes", "Heartbeat TTL in Redis for presence detection", "Message sequence IDs to detect missed messages on reconnect"],
                    "difficulty": "Intermediate"
                }
            ],
            "advanced": [
                {
                    "id": "fs_sd_a1",
                    "topic": "Multi-Tenant SaaS Workspace Platform",
                    "question": "Architect a multi-tenant B2B SaaS platform (like Notion or Slack). How do you enforce strict tenant data isolation, manage custom subdomains, and support role-based access control (RBAC)?",
                    "expectedKeyPoints": ["Tenant isolation strategies: Shared DB with tenant_id vs schema-per-tenant", "Row-Level Security (RLS) in PostgreSQL", "Subdomain resolution middleware to set tenant context", "RBAC permissions model with cached permission sets"],
                    "difficulty": "Advanced"
                }
            ]
        },
        "behavioral": {
            "beginner": [
                {
                    "id": "fs_b_b1",
                    "topic": "Managing Context Switching Across the Stack",
                    "question": "As a full-stack engineer, you might shift from CSS layout tweaks to database query tuning in the same morning. How do you manage your cognitive load and maintain code quality across both domains?",
                    "expectedKeyPoints": ["Time-boxing and task grouping", "Clear architectural boundaries between frontend and backend repos", "Adhering to linters and automated tests in both layers"],
                    "difficulty": "Beginner"
                }
            ],
            "intermediate": [
                {
                    "id": "fs_b_i1",
                    "topic": "Delivering an MVP Under High Time Pressure",
                    "question": "Describe a project where you had to launch an end-to-end full-stack feature within a very tight deadline. What architectural corners did you deliberately cut, and how did you repay that debt later?",
                    "expectedKeyPoints": ["Clear definition of core MVP scope", "Pragmatic trade-offs (e.g. monolithic table over complex schema)", "Documenting debt and scheduling follow-up refactoring sprint"],
                    "difficulty": "Intermediate"
                }
            ],
            "advanced": [
                {
                    "id": "fs_b_a1",
                    "topic": "Resolving Cross-Stack Architectural Friction",
                    "question": "Tell me about a time frontend requirements conflicted with backend database design or API performance. How did you facilitate agreement and design an API contract that satisfied both?",
                    "expectedKeyPoints": ["BFF (Backend-for-Frontend) pattern or GraphQL layer", "Benchmarking query latency vs frontend rendering needs", "Win-win resolution prioritizing end-user responsiveness"],
                    "difficulty": "Advanced"
                }
            ]
        },
        "hr": {
            "beginner": [
                {
                    "id": "fs_hr_b1",
                    "topic": "Full-Stack Philosophy & Versatility",
                    "question": "What excites you most about being a Full-Stack developer? Do you see yourself as a generalist who can build anything, or do you have a natural center of gravity toward frontend or backend?",
                    "expectedKeyPoints": ["Empowerment to take an idea from conception to deployed product", "Understanding the full user journey and system trade-offs", "Continuous curiosity across all layers of the tech stack"],
                    "difficulty": "Beginner"
                }
            ],
            "intermediate": [
                {
                    "id": "fs_hr_i1",
                    "topic": "Team Velocity & Autonomous Ownership",
                    "question": "Full-stack engineers are often asked to own features end-to-end with minimal supervision. How do you validate your technical decisions and keep product managers informed without constant meetings?",
                    "expectedKeyPoints": ["Lightweight RFCs (Request for Comments) for design decisions", "Proactive async demos and status updates", "Clear milestone definitions and acceptance criteria"],
                    "difficulty": "Intermediate"
                }
            ],
            "advanced": [
                {
                    "id": "fs_hr_a1",
                    "topic": "Engineering Standards Across Diverse Stacks",
                    "question": "How do you help maintain consistent quality, testing rigor, and documentation across both frontend and backend repositories as an engineering team grows?",
                    "expectedKeyPoints": ["Shared CI/CD linters and automated test gates", "Clear API documentation (OpenAPI / Swagger)", "Culture of empathetic code reviews and shared team ownership"],
                    "difficulty": "Advanced"
                }
            ]
        }
    },

    # -------------------------------------------------------------
    # 5. DATA ANALYST
    # -------------------------------------------------------------
    "data-analyst": {
        "technical": {
            "beginner": [
                {
                    "id": "da_t_b1",
                    "topic": "SQL Joins & Grouping",
                    "question": "Can you explain the difference between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN? How does WHERE differ from HAVING when filtering aggregate results?",
                    "expectedKeyPoints": ["INNER JOIN returns matching rows only", "LEFT JOIN preserves all left table rows", "WHERE filters row-by-row before grouping", "HAVING filters aggregate values after GROUP BY"],
                    "difficulty": "Beginner"
                },
                {
                    "id": "da_t_b2",
                    "topic": "Data Cleaning & Missing Values",
                    "question": "Suppose you receive a dataset containing 20% missing values in key numerical columns and several extreme outliers. How do you decide whether to impute, winsorize, or drop them?",
                    "expectedKeyPoints": ["Investigate missing mechanism (MCAR, MAR, MNAR)", "Median/mean imputation vs regression/KNN imputation", "IQR or Z-score for outlier identification", "Business context determining outlier validity"],
                    "difficulty": "Beginner"
                }
            ],
            "intermediate": [
                {
                    "id": "da_t_i1",
                    "topic": "SQL Window Functions & Cohorts",
                    "question": "How do window functions like ROW_NUMBER(), RANK(), and DENSE_RANK() work in SQL? How would you use window functions to calculate month-over-month customer retention or churn?",
                    "expectedKeyPoints": ["PARTITION BY and ORDER BY clauses", "Difference in handling ties between RANK and DENSE_RANK", "LAG/LEAD for period-over-period comparisons", "Cohort grouping by user signup date"],
                    "difficulty": "Intermediate"
                },
                {
                    "id": "da_t_i2",
                    "topic": "Metric Definition & Attribution",
                    "question": "How do you differentiate between leading indicators and lagging indicators in business analytics? Walk me through how you choose between first-touch, last-touch, and linear marketing attribution models.",
                    "expectedKeyPoints": ["Leading indicators predict future outcomes (e.g. signups), lagging reflect past results (revenue)", "First-touch rewards brand awareness, last-touch rewards direct conversion", "Multi-touch / linear attribution distributes credit across touchpoints"],
                    "difficulty": "Intermediate"
                }
            ],
            "advanced": [
                {
                    "id": "da_t_a1",
                    "topic": "A/B Testing & Statistical Rigor",
                    "question": "How do you design and evaluate an A/B experimentation framework? How do you calculate sample size, control for p-hacking, and detect novelty bias in user metrics?",
                    "expectedKeyPoints": ["Statistical power (1 - beta) and significance level (alpha)", "Minimum detectable effect (MDE)", "Bonferroni or Benjamini-Hochberg correction for multiple variants", "Sample ratio mismatch (SRM) checks"],
                    "difficulty": "Advanced"
                }
            ]
        },
        "coding": {
            "beginner": [
                {
                    "id": "da_c_b1",
                    "topic": "SQL Running Total & 7-Day Moving Average",
                    "question": "Write a SQL query that calculates the daily total revenue, running cumulative revenue, and 7-day moving average from a `daily_sales` table.",
                    "codeContext": "Schema: daily_sales(sale_date DATE, revenue NUMERIC)\nOutput: sale_date, revenue, cumulative_revenue, moving_avg_7d",
                    "starterCode": "SELECT\n    sale_date,\n    revenue,\n    SUM(revenue) OVER (ORDER BY sale_date) AS cumulative_revenue,\n    AVG(revenue) OVER (\n        ORDER BY sale_date\n        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW\n    ) AS moving_avg_7d\nFROM daily_sales\nORDER BY sale_date;",
                    "expectedKeyPoints": ["SUM() OVER (ORDER BY sale_date) for cumulative running total", "AVG() OVER (ORDER BY sale_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)", "Correct ordering by date"],
                    "difficulty": "Beginner"
                }
            ],
            "intermediate": [
                {
                    "id": "da_c_i1",
                    "topic": "Python / Pandas Outlier Detection (IQR)",
                    "question": "Write a Python function using Pandas that identifies and caps outliers in a numeric DataFrame column using the Interquartile Range (IQR) technique (Winsorization).",
                    "codeContext": "Input: DataFrame `df`, column name `col`\nFormula: Q1 = 25th percentile, Q3 = 75th percentile, IQR = Q3 - Q1\nBounds: [Q1 - 1.5 * IQR, Q3 + 1.5 * IQR]\nOutput: DataFrame with outlier values capped to lower and upper bounds.",
                    "starterCode": "import pandas as pd\n\ndef winsorize_iqr(df: pd.DataFrame, col: str) -> pd.DataFrame:\n    df_clean = df.copy()\n    q1 = df_clean[col].quantile(0.25)\n    q3 = df_clean[col].quantile(0.75)\n    iqr = q3 - q1\n    lower_bound = q1 - (1.5 * iqr)\n    upper_bound = q3 + (1.5 * iqr)\n    df_clean[col] = df_clean[col].clip(lower=lower_bound, upper=upper_bound)\n    return df_clean",
                    "expectedKeyPoints": ["Calculate quantile(0.25) and quantile(0.75)", "Compute IQR and bounds with 1.5 multiplier", "Clip values using df.clip() or boolean mask"],
                    "difficulty": "Intermediate"
                }
            ],
            "advanced": [
                {
                    "id": "da_c_a1",
                    "topic": "SQL Monthly Retention Cohort Analysis",
                    "question": "Write a SQL query that constructs a monthly user retention cohort analysis table showing how many users who signed up in Month 0 remained active in Month 1, Month 2, and Month 3.",
                    "codeContext": "Schema: user_actions(user_id INT, action_date DATE)\nOutput: signup_month, cohort_size, m1_active, m2_active, m3_active",
                    "starterCode": "WITH user_cohorts AS (\n    SELECT user_id, DATE_TRUNC('month', MIN(action_date)) AS signup_month\n    FROM user_actions\n    GROUP BY user_id\n),\nactivity_periods AS (\n    SELECT DISTINCT a.user_id, c.signup_month,\n           DATE_PART('month', AGE(a.action_date, c.signup_month)) AS month_number\n    FROM user_actions a\n    JOIN user_cohorts c ON a.user_id = c.user_id\n)\n-- Aggregate cohort counts by month_number\nSELECT signup_month, COUNT(DISTINCT user_id) AS cohort_size\nFROM user_cohorts\nGROUP BY signup_month;",
                    "expectedKeyPoints": ["CTE to find each user's earliest action (signup_month)", "Calculate month difference between subsequent activity and cohort origin", "Pivot or conditional aggregation (COUNT DISTINCT CASE WHEN month_number = 1)"],
                    "difficulty": "Advanced"
                }
            ]
        },
        "system_design": {
            "beginner": [
                {
                    "id": "da_sd_b1",
                    "topic": "Dimensional Modeling (Star vs Snowflake)",
                    "question": "Explain the difference between a Star Schema and a Snowflake Schema for an e-commerce analytical data warehouse. How do Fact tables and Dimension tables interact?",
                    "expectedKeyPoints": ["Fact tables contain quantitative metrics and foreign keys", "Dimension tables contain descriptive context (customer, product, date)", "Star schema denormalizes dimensions for faster joins; Snowflake normalizes dimensions"],
                    "difficulty": "Beginner"
                }
            ],
            "intermediate": [
                {
                    "id": "da_sd_i1",
                    "topic": "Automated ETL / ELT Pipeline Architecture",
                    "question": "Design an ELT pipeline that extracts transaction logs from production PostgreSQL, loads them into Snowflake/BigQuery, and orchestrates daily transformations using dbt.",
                    "expectedKeyPoints": ["Change Data Capture (CDC) with Debezium or periodic Fivetran batch extraction", "Staging raw tables in data warehouse without transformation", "dbt data models running SQL transformations with testing assertions", "Airflow or Dagster orchestration with Slack alerting on test failure"],
                    "difficulty": "Intermediate"
                }
            ],
            "advanced": [
                {
                    "id": "da_sd_a1",
                    "topic": "Enterprise Metric Store & BI Dashboard Architecture",
                    "question": "Design a centralized Semantic Metric Layer and BI Dashboard architecture serving 500 business users. How do you prevent 'two versions of the truth' where different departments define Churn or LTV differently?",
                    "expectedKeyPoints": ["Semantic layer (Cube / dbt semantic layer / LookML) defining single source of truth for metrics", "Pre-aggregation or materialized views for sub-second dashboard rendering", "Role-based data masking and governance", "Automated data cataloging and lineage tracking"],
                    "difficulty": "Advanced"
                }
            ]
        },
        "behavioral": {
            "beginner": [
                {
                    "id": "da_b_b1",
                    "topic": "Clarifying Ambiguous Business Questions",
                    "question": "A business stakeholder asks you: 'Why are our sales dropping this week?' How do you structure your analytical breakdown and avoid jumping to premature conclusions?",
                    "expectedKeyPoints": ["Deconstruct question: geography, product category, new vs returning users", "Check data pipeline health and tracking anomalies first", "Formulate hypotheses and communicate findings with executive summary"],
                    "difficulty": "Beginner"
                }
            ],
            "intermediate": [
                {
                    "id": "da_b_i1",
                    "topic": "When Data Contradicts Leadership Intuition",
                    "question": "Tell me about a time your data findings directly contradicted the intuition or strategy of a senior executive. How did you present your analysis persuasively and navigate their pushback?",
                    "expectedKeyPoints": ["Objective presentation without being combative", "Showing methodology, confidence intervals, and potential confounding variables", "Validating their perspective while letting verifiable data guide the decision"],
                    "difficulty": "Intermediate"
                }
            ],
            "advanced": [
                {
                    "id": "da_b_a1",
                    "topic": "Driving Organizational Strategy with Insights",
                    "question": "Walk me through an analytical project where your insights led directly to a high-impact business pivot, revenue growth, or cost savings.",
                    "expectedKeyPoints": ["Context and business problem", "Sophisticated analysis uncovering non-obvious root cause", "Measurable business ROI following implementation of recommendations"],
                    "difficulty": "Advanced"
                }
            ]
        },
        "hr": {
            "beginner": [
                {
                    "id": "da_hr_b1",
                    "topic": "Data Storytelling & Business Curiosity",
                    "question": "What separates an exceptional Data Analyst from someone who merely writes SQL queries? How do you ensure your charts tell a clear, actionable story?",
                    "expectedKeyPoints": ["Translating complex numbers into actionable business recommendations", "Clean data visualization principles (eliminating clutter)", "Deep empathy for stakeholder business goals"],
                    "difficulty": "Beginner"
                }
            ],
            "intermediate": [
                {
                    "id": "da_hr_i1",
                    "topic": "Data Integrity & Ethical Reporting",
                    "question": "How do you handle situations where there is subtle pressure to cherry-pick metrics or adjust baseline dates to make a team's quarterly performance look better than it actually is?",
                    "expectedKeyPoints": ["Commitment to objective truth and professional ethics", "Presenting full context alongside favorable metrics", "Upholding team credibility and data trust"],
                    "difficulty": "Intermediate"
                }
            ],
            "advanced": [
                {
                    "id": "da_hr_a1",
                    "topic": "Fostering Data Literacy Across the Company",
                    "question": "How do you empower non-technical teammates to self-serve their own data questions while preventing misinterpretation of complex metrics?",
                    "expectedKeyPoints": ["Creating intuitive curated dashboard templates", "Hosting internal office hours and metric literacy workshops", "Maintaining clear data dictionaries and documentation"],
                    "difficulty": "Advanced"
                }
            ]
        }
    },

    # -------------------------------------------------------------
    # 6. MACHINE LEARNING ENGINEER
    # -------------------------------------------------------------
    "ml-engineer": {
        "technical": {
            "beginner": [
                {
                    "id": "ml_t_b1",
                    "topic": "Supervised Learning Fundamentals",
                    "question": "What is the difference between classification and regression? How do you determine whether a model is suffering from high bias (underfitting) versus high variance (overfitting)?",
                    "expectedKeyPoints": ["Classification predicts discrete categories, regression predicts continuous values", "Underfitting has high train and validation error", "Overfitting has low train error but high validation error"],
                    "difficulty": "Beginner"
                },
                {
                    "id": "ml_t_b2",
                    "topic": "Feature Engineering & Regularization",
                    "question": "Compare L1 (Lasso) and L2 (Ridge) regularization. Why does L1 regularization drive certain feature weights to absolute zero while L2 shrinks them smoothly toward zero?",
                    "expectedKeyPoints": ["L1 adds absolute value penalty; diamond geometric constraint causes sparsity", "L2 adds squared penalty; spherical constraint shrinks weights smoothly", "L1 acts as automatic feature selector"],
                    "difficulty": "Beginner"
                }
            ],
            "intermediate": [
                {
                    "id": "ml_t_i1",
                    "topic": "Model Evaluation Metrics & Imbalance",
                    "question": "Why is accuracy a misleading metric for highly imbalanced datasets (e.g., 99% negative cases)? Explain Precision, Recall, F1-Score, and ROC-AUC in the context of fraud detection.",
                    "expectedKeyPoints": ["Accuracy paradox with dominant negative class", "Precision is TP / (TP + FP)", "Recall is TP / (TP + FN)", "F1 is harmonic mean", "ROC-AUC plots TPR vs FPR across thresholds"],
                    "difficulty": "Intermediate"
                },
                {
                    "id": "ml_t_i2",
                    "topic": "Embeddings & Attention Mechanism",
                    "question": "How does the Self-Attention mechanism work in Transformer architectures? What is the purpose of the Query, Key, and Value vectors and the scale factor `sqrt(d_k)`?",
                    "expectedKeyPoints": ["Attention(Q, K, V) = softmax(Q * K^T / sqrt(d_k)) * V", "Dot product measures token affinity", "Scaling factor prevents vanishing gradients in softmax for large dimensions"],
                    "difficulty": "Intermediate"
                }
            ],
            "advanced": [
                {
                    "id": "ml_t_a1",
                    "topic": "MLOps, Latency & Model Drift",
                    "question": "How do you deploy and monitor a low-latency deep learning model serving 2,000 queries per second in production? How do you detect data drift and concept drift in real time?",
                    "expectedKeyPoints": ["Model quantization (INT8/FP16) and ONNX / TensorRT runtime", "Batching dynamic requests with Triton server", "Kolmogorov-Smirnov test or Population Stability Index (PSI) for data drift", "Automated retraining triggers"],
                    "difficulty": "Advanced"
                }
            ]
        },
        "coding": {
            "beginner": [
                {
                    "id": "ml_c_b1",
                    "topic": "Vectorized Cosine Similarity in Python",
                    "question": "Write a vectorized function in Python using NumPy to compute the pairwise cosine similarity between two 2D matrices of embeddings `A` and `B` without using nested loops.",
                    "codeContext": "Formula: cosine_sim(u, v) = (u . v) / (||u|| * ||v||)\nInput: A of shape (N, D), B of shape (M, D)\nOutput: Matrix of shape (N, M) containing cosine similarities in [-1, 1].",
                    "starterCode": "import numpy as np\n\ndef cosine_similarity_matrix(A: np.ndarray, B: np.ndarray) -> np.ndarray:\n    # Vectorized cosine similarity\n    dot_product = np.dot(A, B.T)\n    norm_A = np.linalg.norm(A, axis=1, keepdims=True)\n    norm_B = np.linalg.norm(B, axis=1, keepdims=True)\n    return dot_product / (norm_A * norm_B.T)",
                    "expectedKeyPoints": ["Matrix multiplication np.dot(A, B.T)", "L2 norm calculation with keepdims=True", "Epsilon addition to prevent division by zero"],
                    "difficulty": "Beginner"
                }
            ],
            "intermediate": [
                {
                    "id": "ml_c_i1",
                    "topic": "Gradient Descent Optimization Step",
                    "question": "Implement a single vectorized gradient descent training step for multiple linear regression `y = X * w + b` with mean squared error (MSE) loss and L2 weight decay.",
                    "codeContext": "Inputs: X (N, D), y (N, 1), w (D, 1), b (scalar), lr (learning rate), lambda_reg (L2 penalty)\nOutputs: Updated w, b, and scalar MSE loss.",
                    "starterCode": "import numpy as np\n\ndef gradient_descent_step(X, y, w, b, lr=0.01, lambda_reg=0.01):\n    N = X.shape[0]\n    # Predictions\n    y_pred = np.dot(X, w) + b\n    error = y_pred - y\n    loss = (1 / (2 * N)) * np.sum(error ** 2) + (lambda_reg / 2) * np.sum(w ** 2)\n    # Gradients\n    dw = (1 / N) * np.dot(X.T, error) + lambda_reg * w\n    db = (1 / N) * np.sum(error)\n    # Parameter updates\n    w = w - lr * dw\n    b = b - lr * db\n    return w, b, loss",
                    "expectedKeyPoints": ["Linear prediction y_pred = Xw + b", "MSE error calculation", "Analytical gradient dw = (1/N) * X^T * error + lambda * w", "Gradient step w = w - lr * dw"],
                    "difficulty": "Intermediate"
                }
            ],
            "advanced": [
                {
                    "id": "ml_c_a1",
                    "topic": "K-Means Clustering from Scratch",
                    "question": "Implement the core iterative Lloyd's algorithm for K-Means clustering in Python/NumPy, assigning points to nearest centroids and updating cluster centroids until convergence.",
                    "codeContext": "Signature: kmeans(X, k, max_iters=100)\nOutput: Final centroids (k, D) and cluster labels (N,).",
                    "starterCode": "import numpy as np\n\ndef kmeans(X: np.ndarray, k: int, max_iters: int = 100):\n    # Initialize centroids randomly from data points\n    indices = np.random.choice(len(X), size=k, replace=False)\n    centroids = X[indices]\n    for _ in range(max_iters):\n        # Compute Euclidean distances and assign clusters\n        distances = np.linalg.norm(X[:, np.newaxis] - centroids, axis=2)\n        labels = np.argmin(distances, axis=1)\n        # Recalculate centroids\n        new_centroids = np.array([X[labels == i].mean(axis=0) for i in range(k)])\n        if np.allclose(centroids, new_centroids):\n            break\n        centroids = new_centroids\n    return centroids, labels",
                    "expectedKeyPoints": ["Broadcasting to compute Euclidean distances (N, k)", "np.argmin(distances, axis=1) for assignment", "Update centroids by taking cluster means", "Early stopping convergence check"],
                    "difficulty": "Advanced"
                }
            ]
        },
        "system_design": {
            "beginner": [
                {
                    "id": "ml_sd_b1",
                    "topic": "Batch vs Real-Time Inference Architecture",
                    "question": "Compare batch prediction pipelines with real-time API inference. What factors influence whether a credit card fraud model should run synchronously on transaction swipe or asynchronously in batch?",
                    "expectedKeyPoints": ["Latency budget (<100ms for online swipe blocking)", "Feature availability: online feature store (Redis) vs offline warehouse", "Compute cost trade-offs and fallback logic on timeout"],
                    "difficulty": "Beginner"
                }
            ],
            "intermediate": [
                {
                    "id": "ml_sd_i1",
                    "topic": "Two-Stage Recommendation System",
                    "question": "Design a personalized content recommendation engine (like YouTube or Netflix) handling 50 million items. Walk me through the candidate retrieval stage and the deep ranking stage.",
                    "expectedKeyPoints": ["Stage 1: Candidate Generation (ANN vector search via FAISS / HNSW reducing 50M to 500 items)", "Stage 2: Ranking with complex cross-features / Transformer ranking model", "Feature store (Feast/Hopsworks) for real-time user context", "Deduplication and diversity re-ranking"],
                    "difficulty": "Intermediate"
                }
            ],
            "advanced": [
                {
                    "id": "ml_sd_a1",
                    "topic": "Scalable Vector Search & RAG Architecture",
                    "question": "Architect an enterprise Retrieval-Augmented Generation (RAG) platform searching across 10 million technical documents with sub-second latency and high retrieval precision. How do you prevent hallucination?",
                    "expectedKeyPoints": ["Chunking strategies (semantic chunking with overlap)", "Hybrid search (BM25 lexical + dense vector embeddings)", "Cross-encoder re-ranking step", "Grounding checks and prompt citations to prevent hallucinations"],
                    "difficulty": "Advanced"
                }
            ]
        },
        "behavioral": {
            "beginner": [
                {
                    "id": "ml_b_b1",
                    "topic": "Dealing with Noisy or Biased Datasets",
                    "question": "Tell me about a project where you were handed poorly labeled, incomplete, or biased training data. How did you audit the data quality and adapt your modeling approach?",
                    "expectedKeyPoints": ["Data profiling and spotting label inconsistencies", "Active learning or confident learning for noise filtering", "Measuring impact of data cleaning on model validation metrics"],
                    "difficulty": "Beginner"
                }
            ],
            "intermediate": [
                {
                    "id": "ml_b_i1",
                    "topic": "Balancing Model Complexity with Production Latency",
                    "question": "Describe a scenario where a state-of-the-art heavy model achieved slightly higher accuracy in validation, but proved too slow or expensive for production deployment. How did you resolve the trade-off?",
                    "expectedKeyPoints": ["Model distillation or quantization (e.g. distilling Large LLM into a light student)", "Demonstrating that 0.5% accuracy gain did not justify 5x cloud infrastructure cost", "Aligning engineering decisions with user latency expectations"],
                    "difficulty": "Intermediate"
                }
            ],
            "advanced": [
                {
                    "id": "ml_b_a1",
                    "topic": "Diagnosing a Production Model Breakdown",
                    "question": "Walk me through a time when a model's real-world performance collapsed shortly after production deployment despite excellent offline cross-validation scores.",
                    "expectedKeyPoints": ["Root cause: data leakage, train-serve feature skew, or shifting user demographics", "Immediate mitigation (fallback to heuristics or previous checkpoint)", "Preventive testing: automated shadow deployment before canary traffic"],
                    "difficulty": "Advanced"
                }
            ]
        },
        "hr": {
            "beginner": [
                {
                    "id": "ml_hr_b1",
                    "topic": "Scientific Curiosity vs Engineering Rigor",
                    "question": "Machine learning lies at the intersection of academic research and production software engineering. How do you balance experimental research curiosity with disciplined coding standards?",
                    "expectedKeyPoints": ["Treating ML code with same rigor as production services (tests, CI/CD, modularity)", "Reproducibility via experiment tracking (MLflow / Weights & Biases)", "Focus on shipping practical customer value"],
                    "difficulty": "Beginner"
                }
            ],
            "intermediate": [
                {
                    "id": "ml_hr_i1",
                    "topic": "AI Ethics, Fairness & Explainability",
                    "question": "How do you evaluate and communicate potential bias, fairness concerns, and algorithmic transparency when deploying models that impact real people's lives (e.g. loans, hiring)?",
                    "expectedKeyPoints": ["Fairness audits across demographic slices", "Explainability tools (SHAP, LIME)", "Proactive ethical responsibility and transparent documentation"],
                    "difficulty": "Intermediate"
                }
            ],
            "advanced": [
                {
                    "id": "ml_hr_a1",
                    "topic": "Keeping Pace with Rapid AI Advances",
                    "question": "The AI ecosystem changes at a relentless pace. How do you filter through the noise of daily papers and open-source models to choose stable technologies for enterprise production?",
                    "expectedKeyPoints": ["Focusing on enduring foundational principles", "Running targeted proof-of-concept spikes with measurable benchmarks", "Mentoring team members on adopting battle-tested tools"],
                    "difficulty": "Advanced"
                }
            ]
        }
    },

    # -------------------------------------------------------------
    # 7. CLOUD / DEVOPS ENGINEER
    # -------------------------------------------------------------
    "devops-engineer": {
        "technical": {
            "beginner": [
                {
                    "id": "do_t_b1",
                    "topic": "Containers & Virtualization",
                    "question": "What is the fundamental architectural difference between a Docker container and a Virtual Machine? How do Linux cgroups and namespaces enable container isolation?",
                    "expectedKeyPoints": ["VM includes guest OS and hypervisor", "Containers share host OS kernel", "Namespaces isolate processes, networks, and mount points", "cgroups enforce CPU and memory limits"],
                    "difficulty": "Beginner"
                },
                {
                    "id": "do_t_b2",
                    "topic": "Networking & Load Balancing",
                    "question": "Explain the difference between Layer 4 (TCP/UDP) and Layer 7 (HTTP/HTTPS) load balancing. When would you use HAProxy/Envoy versus an AWS Network Load Balancer?",
                    "expectedKeyPoints": ["L4 routes packets based on IP and port without inspecting payload", "L7 inspects HTTP headers, cookies, and path routing", "L4 offers raw throughput and lower latency, L7 offers intelligent microservice routing"],
                    "difficulty": "Beginner"
                }
            ],
            "intermediate": [
                {
                    "id": "do_t_i1",
                    "topic": "Kubernetes Architecture & Health Checks",
                    "question": "Explain the difference between Kubernetes Liveness, Readiness, and Startup probes. What happens when a Readiness probe fails versus when a Liveness probe fails?",
                    "expectedKeyPoints": ["Liveness probe failure restarts the container", "Readiness probe failure removes pod IP from service endpoints (no traffic routed)", "Startup probe protects slow-initializing apps"],
                    "difficulty": "Intermediate"
                },
                {
                    "id": "do_t_i2",
                    "topic": "CI/CD & Zero-Downtime Deployment",
                    "question": "Compare Blue-Green deployments with Canary deployments. How do you automate rollback when error rates or latency spike during an automated deployment pipeline?",
                    "expectedKeyPoints": ["Blue-Green swaps router to idle environment", "Canary routes small % of traffic first", "Automated health checks via Prometheus metrics trigger automatic rollback"],
                    "difficulty": "Intermediate"
                }
            ],
            "advanced": [
                {
                    "id": "do_t_a1",
                    "topic": "Infrastructure as Code & Multi-Region",
                    "question": "How do you manage multi-region disaster recovery and state locking in Terraform? How do you handle configuration drift across production environments?",
                    "expectedKeyPoints": ["Remote state backend (S3 + DynamoDB locking)", "Active-passive vs active-active multi-region failover", "Terraform plan in CI with drift detection schedules", "GitOps (ArgoCD) enforcing declared state"],
                    "difficulty": "Advanced"
                }
            ]
        },
        "coding": {
            "beginner": [
                {
                    "id": "do_c_b1",
                    "topic": "Server Access Log Error Parser",
                    "question": "Write a Python script that parses an Nginx web server access log, extracts all client IP addresses returning HTTP 5xx errors, and outputs the top 5 offending IPs and their counts.",
                    "codeContext": "Log format sample: '192.168.1.10 - - [28/Oct/2026:12:00:01 +0000] \"GET /api/v1/data HTTP/1.1\" 502 128'\nOutput: Top 5 IPs sorted by 5xx frequency.",
                    "starterCode": "import re\nfrom collections import Counter\n\ndef top_5xx_ips(log_lines: list[str]) -> list[tuple[str, int]]:\n    pattern = r'^(\\S+) .*? \"\\w+ .*?\" (5\\d{2}) '\n    ip_counts = Counter()\n    for line in log_lines:\n        match = re.search(pattern, line)\n        if match:\n            ip, status = match.groups()\n            ip_counts[ip] += 1\n    return ip_counts.most_common(5)",
                    "expectedKeyPoints": ["Regex or line split matching IP and HTTP status code", "Check if status code starts with '5'", "Counter to aggregate IP frequencies", "most_common(5) for top offenders"],
                    "difficulty": "Beginner"
                }
            ],
            "intermediate": [
                {
                    "id": "do_c_i1",
                    "topic": "Service Health Check Monitor with Backoff",
                    "question": "Write an automated Python health check script that queries an HTTP endpoint, retries with exponential backoff if unreachable, and triggers a webhook notification on repeated failure.",
                    "codeContext": "Behavior: Attempt up to 4 times with backoff [1s, 2s, 4s, 8s]. Return dict with status, latency_ms, and attempts.",
                    "starterCode": "import time\nimport urllib.request\n\ndef check_service_health(url: str, max_retries: int = 4) -> dict:\n    delay = 1.0\n    for attempt in range(1, max_retries + 1):\n        start = time.time()\n        try:\n            req = urllib.request.Request(url, headers={'User-Agent': 'HealthCheck/1.0'})\n            with urllib.request.urlopen(req, timeout=5) as res:\n                if res.status == 200:\n                    return {'status': 'healthy', 'latency_ms': round((time.time() - start) * 1000), 'attempts': attempt}\n        except Exception:\n            if attempt == max_retries:\n                return {'status': 'down', 'latency_ms': None, 'attempts': attempt}\n            time.sleep(delay)\n            delay *= 2\n    return {'status': 'unknown'}",
                    "expectedKeyPoints": ["HTTP request with explicit timeout", "Latency measurement using start and end timestamps", "Exponential backoff delay *= 2", "Detailed status return dictionary"],
                    "difficulty": "Intermediate"
                }
            ],
            "advanced": [
                {
                    "id": "do_c_a1",
                    "topic": "Dockerfile & Container Layer Optimization",
                    "question": "Analyze and rewrite a poorly constructed 1.2GB single-stage Python Dockerfile into an optimized multi-stage build under 150MB with non-root security execution.",
                    "codeContext": "Bad Dockerfile installed build-essential, git, left cache in apt, ran as root.\nGoal: Multi-stage build with python:3.11-slim, wheel caching, and dedicated non-root user.",
                    "starterCode": "# Stage 1: Build dependencies\nFROM python:3.11-slim AS builder\nWORKDIR /app\nRUN apt-get update && apt-get install -y --no-install-recommends gcc build-essential\nCOPY requirements.txt .\nRUN pip install --no-cache-dir --user -r requirements.txt\n\n# Stage 2: Runtime image\nFROM python:3.11-slim\nWORKDIR /app\nRUN useradd -m appuser\nCOPY --from=builder /root/.local /home/appuser/.local\nCOPY . .\nUSER appuser\nENV PATH=/home/appuser/.local/bin:$PATH\nCMD [\"python\", \"main.py\"]",
                    "expectedKeyPoints": ["Multi-stage build discarding compilers in stage 1", "--no-install-recommends and pip --no-cache-dir", "Running under dedicated non-root user (useradd)", "Layer ordering caching requirements.txt before source files"],
                    "difficulty": "Advanced"
                }
            ]
        },
        "system_design": {
            "beginner": [
                {
                    "id": "do_sd_b1",
                    "topic": "CI/CD Pipeline for Microservices",
                    "question": "Design an automated GitOps CI/CD pipeline for a microservice repository. Detail the steps from developer git push to production rollout, including linting, security scanning, and container registries.",
                    "expectedKeyPoints": ["GitHub Actions / GitLab CI triggering lint, unit tests, SAST scanning (Trivy/Snyk)", "Docker build with commit SHA tagging", "Push to container registry (ECR/GCR)", "GitOps agent (ArgoCD/Flux) syncing declared manifests"],
                    "difficulty": "Beginner"
                }
            ],
            "intermediate": [
                {
                    "id": "do_sd_i1",
                    "topic": "Highly Available Kubernetes Cluster across AZs",
                    "question": "Architect a production-grade Kubernetes cluster deployed across 3 AWS Availability Zones. How do you design pod anti-affinity, horizontal pod autoscaling (HPA), and ingress SSL termination?",
                    "expectedKeyPoints": ["EKS control plane spanned across 3 AZs", "Pod Anti-Affinity preventing pods from stacking on same node/AZ", "HPA scaling on custom Prometheus metrics (request throughput/queue depth)", "Cert-manager automated SSL renewal via Let's Encrypt"],
                    "difficulty": "Intermediate"
                }
            ],
            "advanced": [
                {
                    "id": "do_sd_a1",
                    "topic": "Multi-Region Active-Passive Disaster Recovery",
                    "question": "Design a multi-region disaster recovery architecture (Primary: US-East, Secondary: EU-Central). How do you replicate database state, manage Route 53 DNS failover, and achieve an RTO < 5 minutes and RPO < 1 minute?",
                    "expectedKeyPoints": ["Aurora Global Database with cross-region read replicas (<1s replication lag)", "Route 53 latency/health check routing with automatic failover", "Terraform IAC ensuring identical infrastructure in standby region", "Regular automated DR drill testing"],
                    "difficulty": "Advanced"
                }
            ]
        },
        "behavioral": {
            "beginner": [
                {
                    "id": "do_b_b1",
                    "topic": "Preventing Pipeline Bypasses Under Pressure",
                    "question": "Describe an incident where a developer or project manager asked you to bypass automated CI/CD security or testing checks to ship a hotfix faster. How did you handle this request?",
                    "expectedKeyPoints": ["Explaining risk of compounding outages without being unhelpful", "Offering rapid manual smoke test or fast-track emergency review process", "Upholding deployment safety while assisting with immediate resolution"],
                    "difficulty": "Beginner"
                }
            ],
            "intermediate": [
                {
                    "id": "do_b_i1",
                    "topic": "Triage of a Cloud Infrastructure Outage",
                    "question": "Tell me about a time when a cloud configuration change or network security group update broke connectivity across production microservices. How did you detect, isolate, and roll it back?",
                    "expectedKeyPoints": ["Checking CloudTrail / Git commit history for recent infra changes", "Fast rollback via Terraform or console snapshot", "Adding automated terraform plan checks in CI to prevent recurring drift"],
                    "difficulty": "Intermediate"
                }
            ],
            "advanced": [
                {
                    "id": "do_b_a1",
                    "topic": "Driving Organizational Infrastructure as Code Migration",
                    "question": "How did you lead or champion a transition from manual cloud console changes ('ClickOps') to Infrastructure as Code (Terraform/GitOps) across skeptical engineering teams?",
                    "expectedKeyPoints": ["Importing existing resources into Terraform state smoothly", "Demonstrating reproducibility and rapid disaster recovery benefits", "Building modular templates that developers could easily reuse"],
                    "difficulty": "Advanced"
                }
            ]
        },
        "hr": {
            "beginner": [
                {
                    "id": "do_hr_b1",
                    "topic": "DevOps Culture & Developer Enablement",
                    "question": "DevOps is often described not just as tooling, but as a culture. How do you view your role in enabling software developers rather than being a ticket-based gatekeeper?",
                    "expectedKeyPoints": ["Building self-service internal developer platforms (IDP)", "Automating repetitive tasks out of existence", "Empathy for developer velocity and friction reduction"],
                    "difficulty": "Beginner"
                }
            ],
            "intermediate": [
                {
                    "id": "do_hr_i1",
                    "topic": "Managing Production Reliability Stress",
                    "question": "Production infrastructure outages can be high-pressure situations with executive visibility. How do you maintain composure and methodical decision-making during severe incidents?",
                    "expectedKeyPoints": ["Adhering to structured incident command protocols", "Focusing on immediate containment rather than assignment of blame", "Clear, calm communication to stakeholders"],
                    "difficulty": "Intermediate"
                }
            ],
            "advanced": [
                {
                    "id": "do_hr_a1",
                    "topic": "FinOps & Cloud Cost Governance",
                    "question": "As infrastructure expands, cloud spending can balloon. How do you build a culture of FinOps accountability where teams optimize their own Kubernetes and cloud resource footprints?",
                    "expectedKeyPoints": ["Tagging strategies and automated cost attribution by team", "Rightsizing instances and utilizing Spot/Savings Plans", "Celebrating cost optimizations alongside feature launches"],
                    "difficulty": "Advanced"
                }
            ]
        }
    },

    # -------------------------------------------------------------
    # 8. CYBERSECURITY ANALYST
    # -------------------------------------------------------------
    "cybersecurity-analyst": {
        "technical": {
            "beginner": [
                {
                    "id": "sec_t_b1",
                    "topic": "OWASP Top 10 & Web Vulnerabilities",
                    "question": "Explain the difference between Stored XSS and Reflected XSS. What HTTP response headers and sanitization practices mitigate Cross-Site Scripting?",
                    "expectedKeyPoints": ["Stored XSS persists in database, Reflected XSS echoes in URL/request", "Content-Security-Policy (CSP) header", "Context-aware HTML encoding", "httpOnly cookies prevent script access"],
                    "difficulty": "Beginner"
                },
                {
                    "id": "sec_t_b2",
                    "topic": "Public Key Cryptography & PKI",
                    "question": "How does asymmetric cryptography (RSA / ECC) establish a secure TLS session between a browser and a server? What is the role of Certificate Authorities (CAs)?",
                    "expectedKeyPoints": ["Asymmetric keys authenticate identity and exchange symmetric session key", "Symmetric encryption (AES) encrypts session traffic for speed", "CA validates domain ownership and signs certificates with root trust chain"],
                    "difficulty": "Beginner"
                }
            ],
            "intermediate": [
                {
                    "id": "sec_t_i1",
                    "topic": "Authentication Vulnerabilities & CSRF",
                    "question": "How does a Cross-Site Request Forgery (CSRF) attack work, and how does the SameSite cookie attribute (Strict, Lax, None) defend against it alongside CSRF anti-forgery tokens?",
                    "expectedKeyPoints": ["CSRF tricks browser into executing unauthorized command with existing session", "SameSite=Lax prevents cross-origin POST cookies", "Cryptographic anti-CSRF token validated on server", "Authorization headers (Bearer tokens) immune to standard CSRF"],
                    "difficulty": "Intermediate"
                },
                {
                    "id": "sec_t_i2",
                    "topic": "Incident Response & SIEM Triage",
                    "question": "Walk me through your methodology when receiving a high-severity alert indicating suspicious outbound command-and-control (C2) beaconing from an internal production server.",
                    "expectedKeyPoints": ["Isolate affected host from network", "Capture memory and disk forensics artifacts", "Analyze DNS/firewall logs and processes", "Identify initial entry vector", "Eradicate persistence and patch vulnerability"],
                    "difficulty": "Intermediate"
                }
            ],
            "advanced": [
                {
                    "id": "sec_t_a1",
                    "topic": "Zero Trust Architecture & Threat Modeling",
                    "question": "How do you design a Zero Trust security architecture for an organization with hybrid cloud infrastructure? Walk me through applying the STRIDE threat modeling framework to a financial payment microservice.",
                    "expectedKeyPoints": ["Never trust, always verify (microsegmentation, mutual TLS)", "Continuous identity verification and device health validation", "STRIDE: Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege"],
                    "difficulty": "Advanced"
                }
            ]
        },
        "coding": {
            "beginner": [
                {
                    "id": "sec_c_b1",
                    "topic": "Secret Scanner & Token Detector",
                    "question": "Write a Python script that scans text files or git commits to detect exposed API keys, AWS credentials (AKIA...), or high-entropy tokens using regular expressions.",
                    "codeContext": "Target: Detect AWS access keys (AKIA[0-9A-Z]{16}) and generic Bearer tokens.\nOutput: List of matches with file, line number, and redacted token.",
                    "starterCode": "import re\n\ndef scan_for_secrets(file_content: str) -> list[dict]:\n    findings = []\n    aws_pattern = re.compile(r'(AKIA[0-9A-Z]{16})')\n    jwt_pattern = re.compile(r'eyJ[a-zA-Z0-9_-]{10,}\\.eyJ[a-zA-Z0-9_-]{10,}\\.[a-zA-Z0-9_-]{10,}')\n    for line_num, line in enumerate(file_content.splitlines(), start=1):\n        for match in aws_pattern.finditer(line):\n            findings.append({'line': line_num, 'type': 'AWS Key', 'token': match.group()[:6] + '...REDACTED'})\n        for match in jwt_pattern.finditer(line):\n            findings.append({'line': line_num, 'type': 'JWT', 'token': match.group()[:10] + '...REDACTED'})\n    return findings",
                    "expectedKeyPoints": ["Regex patterns for AWS key and JWT headers", "Tracking line numbers", "Redacting tokens in reporting output"],
                    "difficulty": "Beginner"
                }
            ],
            "intermediate": [
                {
                    "id": "sec_c_i1",
                    "topic": "Brute-Force SSH Log Analyzer",
                    "question": "Write a Python log parser that reads `auth.log` and flags IP addresses that attempted more than 5 failed SSH authentication attempts within a rolling 60-second window.",
                    "codeContext": "Log sample: 'Oct 28 12:00:15 server sshd[123]: Failed password for invalid user root from 203.0.113.5 port 45212'\nOutput: List of banned IPs and failure counts.",
                    "starterCode": "from collections import defaultdict\nfrom datetime import datetime\nimport re\n\ndef detect_ssh_bruteforce(log_entries: list[dict], threshold: int = 5, window_sec: int = 60) -> list[str]:\n    # entries: [{'timestamp': datetime_obj, 'ip': '203.0.113.5', 'status': 'failed'}]\n    flagged_ips = set()\n    ip_timestamps = defaultdict(list)\n    for entry in log_entries:\n        if entry.get('status') == 'failed':\n            ip = entry['ip']\n            ts = entry['timestamp']\n            ip_timestamps[ip].append(ts)\n            # Filter timestamps within window_sec\n            recent = [t for t in ip_timestamps[ip] if (ts - t).total_seconds() <= window_sec]\n            ip_timestamps[ip] = recent\n            if len(recent) >= threshold:\n                flagged_ips.add(ip)\n    return list(flagged_ips)",
                    "expectedKeyPoints": ["Parse timestamp and IP address from auth log", "Maintain sliding timestamp window per IP", "Flag IP when failure count exceeds threshold within window"],
                    "difficulty": "Intermediate"
                }
            ],
            "advanced": [
                {
                    "id": "sec_c_a1",
                    "topic": "HMAC Signature Verification without Timing Attacks",
                    "question": "Implement an HMAC-SHA256 signature verification function in Python for webhook payloads. Ensure it uses constant-time string comparison (`hmac.compare_digest`) to prevent timing attack side channels.",
                    "codeContext": "Signature: verify_webhook(payload_bytes, secret_key, signature_header)\nSecurity rule: Constant-time comparison to prevent timing leak.",
                    "starterCode": "import hmac\nimport hashlib\n\ndef verify_webhook(payload: bytes, secret: str, received_sig: str) -> bool:\n    expected_sig = hmac.new(\n        secret.encode('utf-8'),\n        payload,\n        hashlib.sha256\n    ).hexdigest()\n    # Use hmac.compare_digest for constant-time comparison\n    return hmac.compare_digest(expected_sig, received_sig)",
                    "expectedKeyPoints": ["hmac.new with sha256 algorithm", "Bytes encoding of secret and payload", "hmac.compare_digest to prevent timing attacks"],
                    "difficulty": "Advanced"
                }
            ]
        },
        "system_design": {
            "beginner": [
                {
                    "id": "sec_sd_b1",
                    "topic": "Secure Web Application Perimeter Architecture",
                    "question": "Design a defense-in-depth security perimeter for a public banking web application. Walk me through the layers: DNS/DDoS protection, WAF, DMZ, API gateway, and internal network segmentation.",
                    "expectedKeyPoints": ["Cloud DDoS and CDN protection (Cloudflare / AWS Shield)", "Web Application Firewall (WAF) filtering SQLi and XSS", "API Gateway performing rate-limiting and TLS termination", "Database residing in isolated private subnets without public internet routes"],
                    "difficulty": "Beginner"
                }
            ],
            "intermediate": [
                {
                    "id": "sec_sd_i1",
                    "topic": "Enterprise SIEM & SOC Pipeline Architecture",
                    "question": "Design a centralized Security Information and Event Management (SIEM) pipeline ingesting 100,000 security events per second across firewalls, endpoints, and cloud logs. How do you implement real-time correlation and minimize alert fatigue?",
                    "expectedKeyPoints": ["Log shippers (Fluentbit/Elastic Agent) sending to Kafka broker", "Stream processing engine normalizing to Open Cybersecurity Schema Framework (OCSF)", "Correlation rules detecting multi-stage kill-chain tactics", "Automated SOAR (Security Orchestration, Automation, and Response) playbooks"],
                    "difficulty": "Intermediate"
                }
            ],
            "advanced": [
                {
                    "id": "sec_sd_a1",
                    "topic": "Zero Trust Enterprise Access Architecture",
                    "question": "Design a Zero Trust Network Access (ZTNA) model replacing legacy corporate VPNs for 10,000 remote employees accessing private cloud services. How do you enforce device posture checks, mutual TLS, and microsegmentation?",
                    "expectedKeyPoints": ["Identity Provider (IdP) integration with MFA and SAML/OIDC", "Endpoint Detection and Response (EDR) agent assessing device compliance", "Software-Defined Perimeter (SDP) controller granting ephemeral access tokens", "Mutual TLS (mTLS) with short-lived client certificates"],
                    "difficulty": "Advanced"
                }
            ]
        },
        "behavioral": {
            "beginner": [
                {
                    "id": "sec_b_b1",
                    "topic": "Educating Users Who Clicked Phishing Links",
                    "question": "An employee in finance clicks a suspicious link in an email and enters their credentials. How do you conduct the initial containment, and how do you counsel the employee without causing shame or alienation?",
                    "expectedKeyPoints": ["Immediate credential reset and active session revocation", "Inspect host for endpoint persistence or secondary payloads", "Compassionate educational conversation reinforcing that attackers are sophisticated"],
                    "difficulty": "Beginner"
                }
            ],
            "intermediate": [
                {
                    "id": "sec_b_i1",
                    "topic": "Balancing Strict Security with Business Agility",
                    "question": "Security controls can sometimes slow down developers and business teams. Tell me about a time you introduced a security requirement without grinding team velocity to a halt.",
                    "expectedKeyPoints": ["Integrating security scanning into existing CI/CD pipelines (DevSecOps)", "Providing pre-approved secure starter templates and libraries", "Clear documentation and actionable remediation guidance"],
                    "difficulty": "Intermediate"
                }
            ],
            "advanced": [
                {
                    "id": "sec_b_a1",
                    "topic": "Leading Emergency Incident Response",
                    "question": "Walk me through how you led response to a live, high-severity security incident (e.g. ransomware infection, leaked production API key, or unauthorized database access).",
                    "expectedKeyPoints": ["Rapid containment to prevent lateral movement", "Evidence preservation for legal and regulatory compliance", "Transparent communication to legal, executive leadership, and affected customers", "Comprehensive remediation and hardening post-incident"],
                    "difficulty": "Advanced"
                }
            ]
        },
        "hr": {
            "beginner": [
                {
                    "id": "sec_hr_b1",
                    "topic": "Ethical Mindset & Integrity",
                    "question": "Cybersecurity analysts often hold broad visibility and administrative access into sensitive systems. How do you demonstrate uncompromising professional ethics and data privacy in your daily work?",
                    "expectedKeyPoints": ["Adherence to principle of least privilege and strict role separation", "Respecting confidentiality and internal audit policies", "Continuous vigilance and personal accountability"],
                    "difficulty": "Beginner"
                }
            ],
            "intermediate": [
                {
                    "id": "sec_hr_i1",
                    "topic": "Threat Intel Curiosity & Adversarial Thinking",
                    "question": "How do you stay abreast of new CVEs, zero-day vulnerabilities, and changing threat actor tactics? How do you think like an attacker when evaluating internal systems?",
                    "expectedKeyPoints": ["Following threat intelligence feeds, CISA alerts, and security research communities", "Adversarial mindset during threat modeling and code reviews", "Participating in CTFs (Capture The Flag) or security testing labs"],
                    "difficulty": "Intermediate"
                }
            ],
            "advanced": [
                {
                    "id": "sec_hr_a1",
                    "topic": "Building a Security-First Company Culture",
                    "question": "Security cannot succeed if it is only the security team's job. How do you cultivate a security-first culture where every developer and employee feels ownership over company security?",
                    "expectedKeyPoints": ["Security champion programs embedded in development teams", "Engaging, positive security awareness training rather than punitive quizzes", "Recognizing and rewarding employees who report security bugs and phishing"],
                    "difficulty": "Advanced"
                }
            ]
        }
    }
}

# Role Alias Normalizer
def normalize_role(role_name: str) -> str:
    r = (role_name or "").lower().strip()
    if "full" in r:
        return "full-stack-developer"
    elif "front" in r:
        return "frontend-developer"
    elif "back" in r:
        return "backend-developer"
    elif "data" in r or "analyst" in r:
        return "data-analyst"
    elif "machine" in r or "ml" in r or "ai" in r:
        return "ml-engineer"
    elif "cloud" in r or "devops" in r:
        return "devops-engineer"
    elif "security" in r or "cyber" in r:
        return "cybersecurity-analyst"
    return "software-developer"

def normalize_format(format_name: str) -> str:
    f = (format_name or "").lower().strip()
    if "cod" in f or "problem" in f:
        return "coding"
    elif "system" in f or "design" in f:
        return "system_design"
    elif "behav" in f or "star" in f:
        return "behavioral"
    elif "hr" in f or "culture" in f:
        return "hr"
    elif "mix" in f or "hybrid" in f:
        return "mixed"
    return "technical"

def normalize_difficulty(diff: str) -> str:
    d = (diff or "").lower().strip()
    if "adv" in d or "senior" in d:
        return "advanced"
    elif "beg" in d or "entry" in d or "junior" in d:
        return "beginner"
    return "intermediate"


MIXED_INTERVIEW_SEQUENCE = ("technical", "behavioral", "coding", "system_design", "hr")
INTERVIEW_FORMAT_LABELS = {
    "technical": "Technical Interview",
    "coding": "Coding & Problem-Solving Interview",
    "system_design": "System Design Interview",
    "behavioral": "Behavioral Interview",
    "hr": "HR & Culture Interview",
}


def mixed_question_format(question_number: int) -> str:
    """Cycle through each assessment style for main questions in a mixed interview."""
    return MIXED_INTERVIEW_SEQUENCE[(max(1, question_number) - 1) % len(MIXED_INTERVIEW_SEQUENCE)]


def difficulty_guidance(difficulty: str) -> str:
    level = normalize_difficulty(difficulty)
    return {
        "beginner": "Entry-level: assess fundamentals and one clear concept; avoid hidden edge cases, multi-step architecture, and senior-only assumptions.",
        "intermediate": "Intermediate: require applied reasoning, common edge cases, and a justified trade-off; avoid specialist or principal-level scope.",
        "advanced": "Advanced: require depth, multiple constraints, failure modes, scale, or nuanced trade-offs appropriate to a senior candidate.",
    }[level]

def get_role_curated_questions(role_key: str, format_key: str, diff_key: str) -> List[Dict[str, Any]]:
    """Retrieve curated questions matching the role and format, prioritizing requested difficulty."""
    bank = INTERVIEW_QUESTION_BANKS.get(role_key, INTERVIEW_QUESTION_BANKS["software-developer"])
    
    if format_key == "mixed":
        # Combine technical, behavioral, and system design / coding
        t_list = bank.get("technical", {}).get(diff_key, [])
        b_list = bank.get("behavioral", {}).get(diff_key, [])
        c_list = bank.get("coding", {}).get(diff_key, [])
        sd_list = bank.get("system_design", {}).get(diff_key, [])
        
        combined = []
        if t_list: combined.append(t_list[0])
        if b_list: combined.append(b_list[0])
        if c_list: combined.append(c_list[0])
        if sd_list: combined.append(sd_list[0])
        if len(t_list) > 1: combined.append(t_list[1])
        if len(b_list) > 1: combined.append(b_list[1])
        return combined
    
    format_bank = bank.get(format_key, bank.get("technical", {}))
    # Only return questions calibrated for the requested difficulty. Other levels
    # are not valid fallbacks for a configured interview session.
    return list(format_bank.get(diff_key, []))


def normalize_question_text(text: str) -> str:
    return " ".join(re.findall(r"[a-z0-9]+", (text or "").lower()))


def is_repeated_question(question: Dict[str, Any] | str, prior_questions: List[Dict[str, Any]]) -> bool:
    text = question if isinstance(question, str) else question.get("questionText") or question.get("question") or ""
    normalized = normalize_question_text(text)
    if not normalized:
        return True
    words = set(normalized.split())
    topic = normalize_question_text("" if isinstance(question, str) else question.get("topic", ""))
    for prior in prior_questions:
        prior_text = normalize_question_text(prior.get("questionText") or prior.get("question") or "")
        if normalized == prior_text or SequenceMatcher(None, normalized, prior_text).ratio() >= 0.82:
            return True
        prior_words = set(prior_text.split())
        if words and prior_words and len(words & prior_words) / len(words | prior_words) >= 0.72:
            return True
        prior_topic = normalize_question_text(prior.get("topic", ""))
        if topic and prior_topic and topic == prior_topic and len(words & prior_words) / max(1, min(len(words), len(prior_words))) >= 0.65:
            return True
    return False


# =========================================================================
# ROLE & FORMAT-SPECIFIC EVALUATION RUBRICS
# =========================================================================

FORMAT_RUBRICS: Dict[str, Dict[str, Any]] = {
    "technical": {
        "description": "Technical correctness, problem-solving reasoning, depth of understanding, and practical application.",
        "keys": ["technicalAccuracy", "problemSolving", "depthOfUnderstanding", "practicalApplication"],
        "labels": {
            "technicalAccuracy": "Technical Correctness",
            "problemSolving": "Problem-Solving & Reasoning",
            "depthOfUnderstanding": "Depth of Understanding",
            "practicalApplication": "Practical Application",
        },
    },
    "coding": {
        "description": "Code correctness, algorithmic reasoning, edge case handling, and complexity/code quality.",
        "keys": ["correctness", "algorithmicReasoning", "edgeCases", "complexityAndQuality"],
        "labels": {
            "correctness": "Code Correctness",
            "algorithmicReasoning": "Algorithmic Reasoning",
            "edgeCases": "Edge Cases & Robustness",
            "complexityAndQuality": "Complexity & Code Quality",
        },
    },
    "behavioral": {
        "description": "Situation and task clarity (STAR), personal action and ownership, outcomes/reflection, and communication.",
        "keys": ["situationClarity", "actionOwnership", "outcomeAndReflection", "communication"],
        "labels": {
            "situationClarity": "Situation & Task Clarity",
            "actionOwnership": "Personal Action & Ownership",
            "outcomeAndReflection": "Outcomes & Reflection",
            "communication": "Communication & Relevance",
        },
    },
    "hr": {
        "description": "Role relevance, verbal articulation, self-awareness and career alignment, and supporting examples.",
        "keys": ["relevance", "communication", "selfAwareness", "supportingExamples"],
        "labels": {
            "relevance": "Role & Motivation Relevance",
            "communication": "Verbal Articulation",
            "selfAwareness": "Self-Awareness & Growth",
            "supportingExamples": "Supporting Examples",
        },
    },
    "system_design": {
        "description": "Requirements analysis, architecture and data modeling, scalability and reliability, and trade-offs/security.",
        "keys": ["requirementsAnalysis", "architectureAndData", "scalabilityAndReliability", "tradeoffsAndSecurity"],
        "labels": {
            "requirementsAnalysis": "Requirements & Scope",
            "architectureAndData": "Architecture & Data Modeling",
            "scalabilityAndReliability": "Scalability & Reliability",
            "tradeoffsAndSecurity": "Trade-offs & Security",
        },
    },
}

def get_rubric_for_format(format_name: str) -> Dict[str, Any]:
    norm = normalize_format(format_name)
    if norm in FORMAT_RUBRICS:
        return FORMAT_RUBRICS[norm]
    return FORMAT_RUBRICS["technical"]


# =========================================================================
# AI GENERATOR SERVICE FUNCTIONS
# =========================================================================

async def generate_interview_opening(
    career_title: str,
    format_name: str,
    difficulty: str,
    candidate_profile: Optional[Dict[str, Any]] = None,
    prior_questions: Optional[List[Dict[str, Any]]] = None,
    code_language: str = "python",
) -> Tuple[str, Dict[str, Any]]:
    """
    Generate professional interviewer opening greeting and first question using Gemini AI.
    Integrates candidate context and role-specific competencies from question bank.
    """
    role_key = normalize_role(career_title)
    session_format_key = normalize_format(format_name)
    format_key = mixed_question_format(1) if session_format_key == "mixed" else session_format_key
    question_format_name = INTERVIEW_FORMAT_LABELS.get(format_key, format_name)
    diff_key = normalize_difficulty(difficulty)

    curated_pool = get_role_curated_questions(role_key, format_key, diff_key)
    sample_topics = [q.get("topic", "") for q in curated_pool[:3] if q.get("topic")]

    skills = (candidate_profile or {}).get("technicalSkills") or []
    skills_str = ", ".join(str(x.get("name", "")) if isinstance(x, dict) else str(x) for x in skills[:6]) or "Software fundamentals"

    is_coding = format_key == "coding"

    schema: Dict[str, Any] = {
        "type": "OBJECT",
        "properties": {
            "greeting": {"type": "STRING"},
            "questionText": {"type": "STRING"},
            "topic": {"type": "STRING"},
            "starterCode": {"type": "STRING", "nullable": True},
            "codeContext": {"type": "STRING", "nullable": True},
        },
        "required": ["greeting", "questionText", "topic", "starterCode", "codeContext"],
    }

    coding_extra = (
        f"Provide a concrete algorithmic or implementation problem with starterCode (function stub) and codeContext (I/O example, constraints). Write the starter code in {code_language}. Do not provide the solution."
        if is_coding else
        "Leave starterCode and codeContext null. Ask a direct, contextual interview question."
    )

    prompt = (
        f"You are an expert hiring interviewer conducting a {question_format_name} for the role of {career_title}. "
        f"This is part of the candidate's {format_name} session. Difficulty level: {difficulty}. "
        f"Difficulty calibration: {difficulty_guidance(difficulty)} "
        f"Core competencies to evaluate: {', '.join(sample_topics) or 'Problem-solving, architectural clarity'}. "
        f"Candidate demonstrated skills: {skills_str}.\n\n"
        f"Previously asked in this candidate's recent sessions (avoid the same concepts): "
        f"{'; '.join(q.get('questionText') or q.get('question', '') for q in (prior_questions or [])[-20:]) or 'None'}.\n"
        f"Instructions:\n"
        f"1. Provide a warm, concise interviewer greeting (1-2 sentences) welcoming the candidate.\n"
        f"2. Ask exactly ONE main interview question specifically tailored to {career_title}, the {question_format_name} format, and the selected {difficulty} level.\n"
        f"3. {coding_extra}\n"
        f"4. Do NOT include hints, answers, or solution explanations in the question.\n"
        f"5. Return strictly the requested JSON schema."
    )

    data = await call_gemini_structured(prompt=prompt, schema=schema)

    q_text = (data.get("questionText") or "").strip()
    if not q_text or len(q_text) > 4000:
        raise GeminiUnavailableError("Gemini returned an invalid interview question. Please retry.")

    greeting = (data.get("greeting") or "").strip()
    if not greeting:
        greeting = f"Welcome to your {career_title} interview simulation! Let us begin with the first question."

    topic = str(data.get("topic") or "Core Competency")[:120].strip()

    question = {
        "id": f"q_{uuid.uuid4().hex[:12]}",
        "question": q_text,
        "questionText": q_text,
        "topic": topic,
        "type": format_key,
        "evaluationFormat": format_key,
        "difficulty": difficulty,
        "starterCode": data.get("starterCode"),
        "starterLanguage": code_language if is_coding else None,
        "codeContext": data.get("codeContext"),
        "isFollowUp": False,
    }

    retries = 0
    while is_repeated_question(question, prior_questions or []) and retries < 2:
        retries += 1
        data = await call_gemini_structured(
            prompt=(prompt + f"\nThe previous question repeated an earlier concept. Generate a distinct replacement. "
                    f"Rejected: {q_text}"),
            schema=schema,
        )
        q_text = (data.get("questionText") or "").strip()
        if not q_text or len(q_text) > 4000:
            continue
        question.update({
            "question": q_text,
            "questionText": q_text,
            "topic": str(data.get("topic") or "Core Competency")[:120].strip(),
            "starterCode": data.get("starterCode"),
            "starterLanguage": code_language if is_coding else None,
            "codeContext": data.get("codeContext"),
        })
    if is_repeated_question(question, prior_questions or []):
        raise GeminiUnavailableError("Gemini returned a repeated or invalid question. Please retry.")

    return greeting, question


async def generate_interview_starter_code(
    career_title: str,
    difficulty: str,
    question: Dict[str, Any],
    code_language: str,
) -> str:
    supported_languages = {"python", "javascript", "typescript", "java", "cpp", "sql"}
    if code_language not in supported_languages:
        raise ValueError("Choose a supported programming language.")

    language_labels = {
        "python": "Python 3", "javascript": "JavaScript", "typescript": "TypeScript",
        "java": "Java", "cpp": "C++", "sql": "SQL",
    }
    schema = {
        "type": "OBJECT",
        "properties": {"starterCode": {"type": "STRING"}},
        "required": ["starterCode"],
    }
    prompt = (
        f"Create an editor starter template in {language_labels[code_language]} for a {difficulty} interview question "
        f"for a {career_title}. Question: {question.get('questionText') or question.get('question', '')}\n"
        f"Problem details: {question.get('codeContext') or 'No extra constraints supplied.'}\n"
        "Return only syntactically valid starter code: imports if needed, the correct function/class/query signature, "
        "and concise TODO comments. Do not implement or reveal the solution. Preserve the problem's input/output contract. "
        "For SQL, provide a valid query skeleton with a TODO comment. Return the requested JSON only."
    )
    data = await call_gemini_structured(prompt=prompt, schema=schema)
    starter = str(data.get("starterCode") or "").strip()
    if not starter or len(starter) > 12000:
        raise GeminiUnavailableError("Could not generate a valid starter template. Please retry.")
    return starter


async def evaluate_answer_and_steer(
    career_title: str,
    format_name: str,
    difficulty: str,
    current_question: Dict[str, Any],
    candidate_answer: str,
    conversation_history: List[Dict[str, Any]],
    current_q_num: int,
    total_q_target: int,
    already_followed_up: bool = False,
    is_coaching_mode: bool = False,
    prior_questions: Optional[List[Dict[str, Any]]] = None,
    code_language: str = "python",
) -> Dict[str, Any]:
    """
    Evaluate candidate response against role & format-specific rubric, validate scores,
    and determine next turn (follow-up question or new main question).
    """
    session_format_key = normalize_format(format_name)
    if session_format_key == "mixed":
        current_format_key = normalize_format(
            current_question.get("evaluationFormat") or current_question.get("type") or "technical"
        )
        if current_format_key == "mixed":
            current_format_key = mixed_question_format(current_q_num)
        next_format_key = mixed_question_format(current_q_num + 1)
    else:
        current_format_key = session_format_key
        next_format_key = session_format_key
    current_format_name = INTERVIEW_FORMAT_LABELS.get(current_format_key, format_name)
    next_format_name = INTERVIEW_FORMAT_LABELS.get(next_format_key, format_name)
    rubric = get_rubric_for_format(current_format_key)
    dimension_keys = rubric["keys"]

    schema_properties: Dict[str, Any] = {}
    for k in dimension_keys:
        schema_properties[k] = {"type": "INTEGER"}

    schema_properties.update({
        "strengths": {"type": "ARRAY", "items": {"type": "STRING"}},
        "improvements": {"type": "ARRAY", "items": {"type": "STRING"}},
        "suggestedImprovement": {"type": "STRING"},
        "idealAnswer": {"type": "STRING"},
        "acknowledgment": {"type": "STRING"},
        "isFollowUp": {"type": "BOOLEAN"},
        "followUpQuestion": {"type": "STRING", "nullable": True},
        "nextTopic": {"type": "STRING", "nullable": True},
        "nextQuestionText": {"type": "STRING", "nullable": True},
        "starterCode": {"type": "STRING", "nullable": True},
        "codeContext": {"type": "STRING", "nullable": True},
    })

    required_keys = list(dimension_keys) + [
        "strengths", "improvements", "suggestedImprovement", "idealAnswer",
        "acknowledgment", "isFollowUp", "followUpQuestion", "nextTopic",
        "nextQuestionText", "starterCode", "codeContext"
    ]

    schema: Dict[str, Any] = {
        "type": "OBJECT",
        "properties": schema_properties,
        "required": required_keys,
    }

    q_text = current_question.get("questionText") or current_question.get("question") or "Interview Question"
    recent_turns = "\n".join(
        f"{t.get('role', 'speaker').title()}: {t.get('text', '')}"
        for t in conversation_history[-8:]
    )

    next_is_coding = next_format_key == "coding"
    reached_target = current_q_num >= total_q_target

    prompt = (
        f"You are an expert interviewer evaluating a candidate for {career_title} ({current_format_name}, {difficulty}) within a {format_name} session.\n"
        f"Evaluation Rubric: {rubric['description']}\n"
        f"Difficulty calibration: {difficulty_guidance(difficulty)}\n"
        f"Dimensions to score (integers 0-100 based strictly on candidate performance): {', '.join(dimension_keys)}.\n\n"
        f"Current Question: {q_text}\n"
        f"Candidate Answer: {candidate_answer}\n\n"
        f"Recent Dialogue Context:\n{recent_turns}\n\n"
        f"Steering Rules:\n"
        f"1. Score each rubric dimension honestly as an integer 0-100 based on accuracy, reasoning, and depth.\n"
        f"2. Identify 1-3 concrete strengths and 1-3 specific areas for improvement demonstrated in this answer.\n"
        f"3. Provide a concise constructive improvement suggestion and an ideal answer summary.\n"
        f"4. A brief interviewer acknowledgment (1 sentence) commenting on their approach.\n"
        f"5. Follow-up Policy: If this question was already followed up ({already_followed_up}) or if answer was clear, set isFollowUp=false and followUpQuestion=null.\n"
        f"   Only if answer was ambiguous, incomplete, or skimmed critical trade-offs AND not already followed up, set isFollowUp=true and ask ONE targeted follow-up.\n"
        f"6. Next Question Policy: If following up or if reached limit ({reached_target}), leave nextQuestionText null.\n"
        f"   Otherwise, generate exactly ONE new main question for {career_title} in the {next_format_name} category at the same selected difficulty. "
        f"Include starterCode/codeContext in {code_language} only if the next question is coding.\n"
        f"7. Return strictly the requested JSON schema."
    )

    asked = list(prior_questions or [])
    asked_text = "\n".join(
        f"- [{q.get('type', format_name)} / {q.get('difficulty', difficulty)} / {q.get('topic', 'unknown topic')}] "
        f"{q.get('questionText') or q.get('question', '')}"
        for q in asked
    ) or "- None"
    prompt += (
        f"\n\nSession constraints: role={career_title}; format={format_name}; "
        f"difficulty={difficulty} (keep this exact baseline; do not adapt it). {difficulty_guidance(difficulty)} "
        f"Do not change the configured format or difficulty. Cover role-specific competencies.\n"
        f"Questions already asked (including follow-ups); do not repeat their wording, topic, or underlying concept:\n{asked_text}\n"
        f"In coaching mode, do not reveal an answer before the candidate responds."
    )

    data = await call_gemini_structured(prompt=prompt, schema=schema)

    # Validate numeric scores
    scores: Dict[str, int] = {}
    for k in dimension_keys:
        val = data.get(k)
        if not isinstance(val, int) or isinstance(val, bool) or not (0 <= val <= 100):
            raise GeminiUnavailableError("Gemini returned invalid evaluation scores. Please retry.")
        scores[k] = val

    avg_score = int(round(sum(scores.values()) / len(scores)))

    # Validate qualitative fields
    strengths = [s.strip() for s in (data.get("strengths") or []) if isinstance(s, str) and s.strip()]
    improvements = [im.strip() for im in (data.get("improvements") or []) if isinstance(im, str) and im.strip()]
    suggested_improvement = str(data.get("suggestedImprovement") or "")[:1000].strip()
    ideal_answer = str(data.get("idealAnswer") or "")[:2000].strip()
    if not strengths or not improvements or not suggested_improvement or not ideal_answer:
        raise GeminiUnavailableError("Gemini returned incomplete answer feedback. Your answer is saved; please retry.")

    # Form standard 5-dimension mapping for frontend UI cards
    norm_format = current_format_key
    if norm_format == "coding":
        std_dims = {
            "technicalAccuracy": scores.get("correctness", avg_score),
            "problemSolving": scores.get("algorithmicReasoning", avg_score),
            "depthOfUnderstanding": scores.get("complexityAndQuality", avg_score),
            "practicalApplication": scores.get("edgeCases", avg_score),
            "communication": int(round((scores.get("correctness", avg_score) + scores.get("algorithmicReasoning", avg_score)) / 2)),
        }
    elif norm_format == "behavioral":
        std_dims = {
            "technicalAccuracy": scores.get("outcomeAndReflection", avg_score),
            "problemSolving": scores.get("actionOwnership", avg_score),
            "depthOfUnderstanding": scores.get("situationClarity", avg_score),
            "practicalApplication": scores.get("outcomeAndReflection", avg_score),
            "communication": scores.get("communication", avg_score),
        }
    elif norm_format == "hr":
        std_dims = {
            "technicalAccuracy": scores.get("relevance", avg_score),
            "problemSolving": scores.get("selfAwareness", avg_score),
            "depthOfUnderstanding": scores.get("supportingExamples", avg_score),
            "practicalApplication": scores.get("supportingExamples", avg_score),
            "communication": scores.get("communication", avg_score),
        }
    elif norm_format == "system_design":
        std_dims = {
            "technicalAccuracy": scores.get("architectureAndData", avg_score),
            "problemSolving": scores.get("requirementsAnalysis", avg_score),
            "depthOfUnderstanding": scores.get("scalabilityAndReliability", avg_score),
            "practicalApplication": scores.get("tradeoffsAndSecurity", avg_score),
            "communication": int(round((scores.get("requirementsAnalysis", avg_score) + scores.get("scalabilityAndReliability", avg_score)) / 2)),
        }
    else:
        std_dims = {
            "technicalAccuracy": scores.get("technicalAccuracy", avg_score),
            "problemSolving": scores.get("problemSolving", avg_score),
            "depthOfUnderstanding": scores.get("depthOfUnderstanding", avg_score),
            "practicalApplication": scores.get("practicalApplication", avg_score),
            "communication": int(round((scores.get("technicalAccuracy", avg_score) + scores.get("problemSolving", avg_score)) / 2)),
        }

    evaluation = {
        **std_dims,
        "score": avg_score,
        "rubricScores": scores,
        "strengths": strengths[:4],
        "improvements": improvements[:4],
        "suggestedImprovement": suggested_improvement,
        "idealAnswer": ideal_answer,
    }

    interviewer_reply = str(data.get("acknowledgment") or "Thank you for that response.")[:400].strip()

    # Determine follow-up turn
    wants_follow_up = bool(data.get("isFollowUp")) and not already_followed_up
    follow_up_text = (data.get("followUpQuestion") or "").strip()

    if wants_follow_up and follow_up_text and not is_repeated_question(follow_up_text, asked):
        return {
            "evaluation": evaluation,
            "isFollowUp": True,
            "followUpQuestionText": follow_up_text,
            "interviewerReply": interviewer_reply,
            "nextQuestion": None,
        }

    # If reached limit, conclude
    if reached_target:
        return {
            "evaluation": evaluation,
            "isFollowUp": False,
            "interviewerReply": interviewer_reply,
            "nextQuestion": None,
        }

    # Otherwise return next question
    next_q_text = (data.get("nextQuestionText") or "").strip()
    attempts = 0
    while next_q_text and is_repeated_question(next_q_text, asked) and attempts < 2:
        attempts += 1
        replacement_prompt = (
            f"Generate one replacement main interview question for {career_title}, format {next_format_name}, "
            f"difficulty {difficulty}. It must test a different role-specific concept and must not repeat these: "
            f"{asked_text}\nRejected duplicate: {next_q_text}\nReturn exactly the evaluation JSON schema. "
            "Preserve the current answer evaluation and provide a new, distinct next question."
        )
        data = await call_gemini_structured(prompt=replacement_prompt, schema=schema)
        next_q_text = (data.get("nextQuestionText") or "").strip()
    if not next_q_text or is_repeated_question(next_q_text, asked):
        raise GeminiUnavailableError("Gemini returned a repeated or invalid question. Your answer is saved; please retry.")

    next_q = {
        "id": f"q_{uuid.uuid4().hex[:12]}",
        "question": next_q_text,
        "questionText": next_q_text,
        "topic": str(data.get("nextTopic") or "Subsequent Competency")[:120].strip(),
        "type": next_format_key,
        "evaluationFormat": next_format_key,
        "difficulty": difficulty,
        "starterCode": data.get("starterCode"),
        "starterLanguage": code_language if next_is_coding else None,
        "codeContext": data.get("codeContext"),
        "isFollowUp": False,
    }

    return {
        "evaluation": evaluation,
        "isFollowUp": False,
        "interviewerReply": interviewer_reply,
        "nextQuestion": next_q,
    }


async def generate_coaching_hint(
    career_title: str,
    format_name: str,
    current_question: Dict[str, Any]
) -> str:
    """
    Generate concise coaching guidance for candidate without revealing the full solution.
    """
    q_text = current_question.get("questionText") or current_question.get("question") or "Current Question"
    schema = {
        "type": "OBJECT",
        "properties": {"hint": {"type": "STRING"}},
        "required": ["hint"],
    }

    prompt = (
        f"You are a supportive mock interview coach. Provide ONE concise, actionable guidance hint (1-2 sentences) "
        f"for the following question to help the candidate structure their reasoning.\n"
        f"Role: {career_title}. Format: {format_name}.\n"
        f"Question: {q_text}\n\n"
        f"Important: Do NOT reveal the direct answer, full code, or complete solution. "
        f"Guide them on framework, structure, or key considerations."
    )

    data = await call_gemini_structured(prompt=prompt, schema=schema)
    hint = (data.get("hint") or "").strip()
    if not hint:
        raise GeminiUnavailableError("Could not generate coaching hint. Please try again.")
    return hint


async def generate_comprehensive_report(
    career_title: str,
    format_name: str,
    difficulty: str,
    answers_data: List[Dict[str, Any]],
    status: str = "completed"
) -> Dict[str, Any]:
    """
    Deterministically compiles the final evaluation report from validated answers.
    Never invents scores for sessions with 0 answers.
    """
    valid_answers = [
        a for a in (answers_data or [])
        if isinstance(a, dict) and isinstance(a.get("evaluation"), dict) and isinstance(a["evaluation"].get("score"), (int, float))
    ]

    report_status = status

    # Handle sessions without valid answers honestly
    if not valid_answers:
        return {
            "overallScore": None,
            "tier": "Not available",
            "status": report_status if report_status in {"ended_early", "incomplete"} else "incomplete",
            "questionsAnswered": 0,
            "summaryText": "Session concluded without answered questions. No evaluation score is available.",
            "dimensions": None,
            "rubricDimensions": None,
            "perQuestionFeedback": [],
            "recommendations": [
                {
                    "title": "Review Role Core Competencies",
                    "exercise": f"Review fundamentals and common interview patterns for {career_title}."
                },
                {
                    "title": "Practice Answer Structuring",
                    "exercise": "Structure technical answers with problem statement, trade-offs, and metrics."
                },
                {
                    "title": "Complete a Practice Simulation",
                    "exercise": "Attempt a 15-minute simulation and answer all questions end to end."
                }
            ]
        }

    # Deterministically calculate dimensional averages
    dim_keys = ["technicalAccuracy", "problemSolving", "communication", "depthOfUnderstanding", "practicalApplication"]
    aggregated_dims: Dict[str, int] = {}
    for dk in dim_keys:
        vals = [
            a["evaluation"].get(dk, a["evaluation"].get("score", 70))
            for a in valid_answers
        ]
        aggregated_dims[dk] = int(round(sum(vals) / len(vals))) if vals else 70

    # Overall score is the deterministic average of validated question scores
    q_scores = [int(round(a["evaluation"]["score"])) for a in valid_answers]
    overall_score = int(round(sum(q_scores) / len(q_scores)))

    tier = (
        "Market-Competitive Ready" if overall_score >= 82
        else "Developing Foundation" if overall_score >= 65
        else "Needs Practice"
    )

    per_q_feedback = []
    all_improvements: List[str] = []
    for idx, ans in enumerate(valid_answers, 1):
        ev = ans.get("evaluation") or {}
        q_text = ans.get("questionText") or f"Question {idx}"
        cand_ans = ans.get("answerText") or ""
        q_score = int(round(ev.get("score", 70)))
        strengths = ev.get("strengths") or []
        gaps = ev.get("improvements") or []
        all_improvements.extend(gaps)

        per_q_feedback.append({
            "questionNumber": idx,
            "questionText": q_text,
            "candidateAnswer": cand_ans,
            "score": q_score,
            "whatWentWell": strengths[0] if strengths else None,
            "whatWasMissing": gaps[0] if gaps else None,
            "suggestedImprovement": ev.get("suggestedImprovement"),
            "idealAnswer": ev.get("idealAnswer"),
        })

    # Summary text
    summary_text = (
        f"Completed evaluation across {len(valid_answers)} question(s) for the {career_title} {format_name} simulation. "
        f"Overall score of {overall_score}% reflects validated rubric performance across technical accuracy, reasoning, and depth."
    )

    # Actionable recommendations derived from demonstrated gaps
    unique_gaps = list(dict.fromkeys(all_improvements))[:3]
    recommendations = []
    if unique_gaps:
        for gap in unique_gaps:
            recommendations.append({
                "title": f"Bridge Gap: {gap[:40]}",
                "exercise": f"Focus practice on {gap.lower()} using platform learning modules and roadmaps."
            })
    else:
        recommendations = [
            {"title": "Deepen Architecture Trade-Offs", "exercise": "Practice discussing performance, scalability, and security trade-offs."},
            {"title": "Quantify Project Impact", "exercise": "Add concrete metrics and latency benchmarks to your project stories."},
        ]

    return {
        "overallScore": overall_score,
        "tier": tier,
        "status": report_status,
        "questionsAnswered": len(valid_answers),
        "summaryText": summary_text,
        "dimensions": aggregated_dims,
        "perQuestionFeedback": per_q_feedback,
        "recommendations": recommendations,
    }
