import React, { useState, useEffect } from "react";
import { api } from "../services/api.js";
import { useToast } from "../context/ToastContext.js";
import { SkillEvidence } from "../types/index.js";
import { Card } from "../components/ui/Card.js";
import { Button } from "../components/ui/Button.js";
import { Input } from "../components/ui/Input.js";
import { Badge } from "../components/ui/Badge.js";
import { Modal } from "../components/ui/Modal.js";
import { EvidenceCard } from "../components/cards/InsightCard.js";
import { LoadingState } from "../components/ui/LoadingState.js";
import { EmptyState } from "../components/ui/EmptyState.js";
import { Award, Plus, Github, Globe, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";

export const ProofOfSkillsPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const toast = useToast();

  const [evidenceList, setEvidenceList] = useState<SkillEvidence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [skillName, setSkillName] = useState("React.js");
  const [evidenceType, setEvidenceType] = useState<SkillEvidence["evidenceType"]>("github");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [strength, setStrength] = useState<SkillEvidence["strength"]>("Strong");

  const loadEvidence = async () => {
    setIsLoading(true);
    try {
      const data = await api.evidence.getAll();
      setEvidenceList(data || []);
    } catch (err: any) {
      toast.error("Failed to load skill evidence: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvidence();
  }, []);

  const handleAddEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName || !title) {
      toast.error("Skill name and title are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await api.evidence.create({
        skillName,
        evidenceType,
        title,
        url,
        description,
        strength,
      });

      setEvidenceList([created, ...evidenceList]);
      setIsModalOpen(false);
      setTitle("");
      setUrl("");
      setDescription("");
      toast.success("Skill evidence logged and verified!");
    } catch (err: any) {
      toast.error("Failed to save evidence: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.evidence.delete(id);
      setEvidenceList(evidenceList.filter((e) => e.id !== id));
      toast.success("Evidence item removed.");
    } catch (err: any) {
      toast.error("Failed to delete item: " + err.message);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading verified proof of skills portfolio..." />;
  }

  return (
    <div id="proof-of-skills-page" className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Verifiable Competencies
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Proof of Skills Repository
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Transform claimed abilities into verified competencies backed by GitHub repositories, live deployments, and credentials.
          </p>
        </div>

        <Button
          id="add-evidence-btn"
          variant="primary"
          size="sm"
          className="w-full sm:w-auto"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="w-3.5 h-3.5 text-white" />}
        >
          Add Skill Evidence
        </Button>
      </div>

      {/* Overview Stat Banner */}
      <Card variant="subtle" className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Evidence-Grounded Employability
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Employers value verifiable proof over resume keywords. Every project link and repository you submit directly increases your technical readiness scoring.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Artifacts</span>
              <p className="text-xl font-black text-blue-600 dark:text-blue-400">{evidenceList.length}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Verified Skills</span>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {new Set(evidenceList.map((e) => e.skillName)).size}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Evidence Cards Grid */}
      {evidenceList.length === 0 ? (
        <EmptyState
          title="No skill evidence added yet"
          description="Log your first GitHub repository, live app URL, or certification to prove your technical proficiencies."
          actionText="Add First Evidence Artifact"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {evidenceList.map((item) => (
            <EvidenceCard key={item.id} evidence={item} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Add Evidence Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Skill Evidence Artifact"
        description="Provide a verifiable link or artifact demonstrating your practical competence in a specific skill."
        size="md"
      >
        <form onSubmit={handleAddEvidence} className="space-y-4">
          <Input
            id="evidence-skill-name"
            label="Validated Skill Name"
            placeholder="e.g. React.js, Node.js, Docker, SQL"
            value={skillName}
            onChange={(e) => setSkillName(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Evidence Type
            </label>
            <select
              value={evidenceType}
              onChange={(e) => setEvidenceType(e.target.value as any)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
            >
              <option value="github">GitHub Repository</option>
              <option value="portfolio">Portfolio / Live Deployment URL</option>
              <option value="certification">Industry Certification</option>
              <option value="internship">Internship Experience</option>
              <option value="hackathon">Hackathon Project</option>
              <option value="achievement">Academic / Competition Achievement</option>
            </select>
          </div>

          <Input
            id="evidence-title"
            label="Artifact Title"
            placeholder="e.g. Full-Stack E-Commerce API or AWS Cloud Practitioner"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Input
            id="evidence-url"
            label="URL / Link (Optional for direct achievements)"
            placeholder="e.g. https://github.com/alexchen/realtime-canvas"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <Input
            id="evidence-desc"
            label="Description & Implementation Highlights"
            placeholder="e.g. Implemented JWT auth, Redis caching layer, and 90% test coverage."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Evidence Strength
            </label>
            <select
              value={strength}
              onChange={(e) => setStrength(e.target.value as any)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
            >
              <option value="Strong">Strong (Production Code, Deployed App, or Verified Cert)</option>
              <option value="Moderate">Moderate (Classroom Project or Completed Assignment)</option>
              <option value="Emerging">Emerging (Proof-of-Concept / Initial Draft)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Save & Verify
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
