import React, { useState } from 'react';
import { useSecurityStore } from '../../store/securityStore';
import {
  calculateSlaStatus,
  calculatePlaybookProgress,
  SEVERITY_CONFIG,
} from '../../lib/incidentTriage';
import type { IncidentStatus } from '../../types/security';
import {
  Server,
  Terminal,
  Clock,
  CheckCircle2,
  PlayCircle,
  Radio,
  Send,
  Lock,
  Unlock,
  UserCheck,
} from 'lucide-react';

export const IncidentDetailWorkspace: React.FC = () => {
  const {
    incidents,
    selectedIncidentId,
    updateIncidentStatus,
    assignIncident,
    togglePlaybookStep,
    toggleAssetIsolation,
    addTimelineEvent,
  } = useSecurityStore();

  const [newNote, setNewNote] = useState('');

  const currentIncident =
    incidents.find((i) => i.id === selectedIncidentId) || incidents[0];

  if (!currentIncident) return null;

  const sla = calculateSlaStatus(currentIncident);
  const sevConfig = SEVERITY_CONFIG[currentIncident.severity];
  const playbookProgress = calculatePlaybookProgress(currentIncident.playbook);

  const statuses: IncidentStatus[] = [
    'TRIAGE',
    'INVESTIGATING',
    'CONTAINED',
    'RESOLVED',
  ];

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    addTimelineEvent(currentIncident.id, {
      source: 'analyst',
      message: newNote.trim(),
      severity: 'INFO',
    });

    setNewNote('');
  };

  return (
    <section aria-labelledby="workspace-heading" className="bg-[#0F1722] border border-[#1E293B] rounded-2xl p-6 shadow-xl space-y-6">
      {/* Top Header: ID, Title, Severity, Lifecycle Stepper */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pb-6 border-b border-[#1E293B]">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="font-mono text-sm font-bold text-[#38BDF8] bg-[#38BDF8]/10 px-2.5 py-0.5 rounded-lg border border-[#38BDF8]/20">
              {currentIncident.id}
            </span>

            {/* Severity Pill */}
            <span
              className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-mono font-bold tracking-wider"
              style={{
                backgroundColor: `${sevConfig.bg}20`,
                color: sevConfig.bg,
                border: `1px solid ${sevConfig.bg}40`,
              }}
            >
              {sevConfig.pulse && <Radio className="w-3.5 h-3.5 animate-pulse" />}
              {currentIncident.severity} SEVERITY
            </span>

            {/* SLA Timer */}
            <div
              className={`flex items-center gap-1.5 font-mono text-xs font-semibold px-2.5 py-0.5 rounded-lg border ${
                sla.isBreached
                  ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30'
                  : sla.isWarning
                  ? 'bg-[#F97316]/10 text-[#F97316] border-[#F97316]/30'
                  : 'bg-[#1E293B] text-[#94A3B8] border-[#334155]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>SLA: {sla.displayString}</span>
            </div>
          </div>

          <h1 id="workspace-heading" className="text-xl sm:text-2xl font-bold font-sans text-white">
            {currentIncident.title}
          </h1>

          <div className="flex items-center gap-2 mt-2 text-xs font-mono text-[#94A3B8]">
            <UserCheck className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Assigned:</span>
            <select
              value={currentIncident.assignee}
              onChange={(e) => assignIncident(currentIncident.id, e.target.value)}
              className="bg-[#090D12] border border-[#1E293B] rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#38BDF8]"
            >
              <option value="Alex Rivera (Lead SOC)">Alex Rivera (Lead SOC)</option>
              <option value="Jordan Vance (SecOps Eng)">Jordan Vance (SecOps Eng)</option>
              <option value="Elena Rostova (Compliance)">Elena Rostova (Compliance)</option>
              <option value="Unassigned">Unassigned</option>
            </select>
          </div>
        </div>

        {/* Status Lifecycle Stepper */}
        <div className="flex flex-wrap items-center gap-2 bg-[#090D12] p-2 rounded-2xl border border-[#1E293B]">
          {statuses.map((st, idx) => {
            const isCurrent = currentIncident.status === st;
            const isPast =
              statuses.indexOf(currentIncident.status) > idx;

            return (
              <button
                key={st}
                onClick={() => updateIncidentStatus(currentIncident.id, st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isCurrent
                    ? 'bg-[#38BDF8] text-[#090D12] shadow-sm'
                    : isPast
                    ? 'bg-[#1E293B] text-[#10B981]'
                    : 'text-[#64748B] hover:text-white'
                }`}
              >
                {isPast ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <span className="text-[10px] opacity-60">0{idx + 1}</span>
                )}
                <span>{st}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dual Column Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (60%): Description, MITRE Techniques, Forensic Audit Stream */}
        <div className="lg:col-span-7 space-y-6">
          {/* Incident Overview & Description */}
          <div className="bg-[#090D12] border border-[#1E293B] rounded-xl p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-2 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-[#38BDF8]" />
              Threat Telemetry Synopsis
            </h2>
            <p className="text-sm font-sans text-[#CBD5E1] leading-relaxed">
              {currentIncident.description}
            </p>
          </div>

          {/* MITRE ATT&CK Mapping */}
          <div className="bg-[#090D12] border border-[#1E293B] rounded-xl p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-3">
              MITRE ATT&CK Technique Mapping
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentIncident.mitreTechniques.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-lg border border-[#1E293B] bg-[#0F1722] flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-[#A78BFA] bg-[#A78BFA]/10 px-2 py-0.5 rounded border border-[#A78BFA]/20">
                      {m.id}
                    </span>
                    <span className="text-[10px] font-sans font-semibold text-[#94A3B8] uppercase">
                      {m.tactic}
                    </span>
                  </div>
                  <span className="text-xs font-sans text-white font-medium">
                    {m.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Forensic Audit Timeline Stream */}
          <div className="bg-[#090D12] border border-[#1E293B] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                Forensic Event Timeline ({currentIncident.timeline.length})
              </h2>
              <span className="text-[10px] font-mono text-[#64748B]">
                Ordered chronologically (newest first)
              </span>
            </div>

            {/* Timeline Stream */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {currentIncident.timeline.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 rounded-lg border border-[#1E293B] bg-[#0F1722] text-xs font-sans"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#1E293B] text-[#38BDF8] border border-[#38BDF8]/20">
                        {ev.source}
                      </span>
                      {ev.severity && (
                        <span
                          className="font-mono text-[10px] font-bold"
                          style={{ color: SEVERITY_CONFIG[ev.severity].bg }}
                        >
                          [{ev.severity}]
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[10px] text-[#64748B]">
                      {ev.timestamp.replace('T', ' ').substring(0, 19)}
                    </span>
                  </div>
                  <p className="text-[#CBD5E1] font-mono text-[11px] leading-relaxed">
                    {ev.message}
                  </p>
                </div>
              ))}
            </div>

            {/* Analyst Quick Note Input */}
            <form onSubmit={handleAddNote} className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Add analyst observation or investigation note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="flex-1 bg-[#0F1722] border border-[#1E293B] rounded-xl px-3 py-2 text-xs font-sans text-white placeholder-[#64748B] focus:outline-none focus:border-[#38BDF8]"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-[#38BDF8] hover:bg-[#0284C7] text-[#090D12] text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post Note</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column (40%): Response Playbook Runner & Affected Host Isolation */}
        <div className="lg:col-span-5 space-y-6">
          {/* Response Playbook Execution Checklist */}
          <div className="bg-[#090D12] border border-[#1E293B] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
                  <PlayCircle className="w-4 h-4 text-[#10B981]" />
                  Response Playbook
                </h2>
                <span className="text-xs font-bold text-white block mt-0.5">
                  {currentIncident.playbook.name}
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/20">
                {playbookProgress.percentage}% Done
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#1E293B] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#10B981] h-full rounded-full transition-all duration-500"
                style={{ width: `${playbookProgress.percentage}%` }}
              />
            </div>

            {/* Playbook Steps */}
            <div className="space-y-3">
              {currentIncident.playbook.steps.map((step) => (
                <div
                  key={step.id}
                  onClick={() =>
                    togglePlaybookStep(currentIncident.id, step.id)
                  }
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    step.isCompleted
                      ? 'bg-[#10B981]/5 border-[#10B981]/30 text-white'
                      : 'bg-[#0F1722] border-[#1E293B] text-[#94A3B8] hover:border-[#38BDF8]/40'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={step.isCompleted}
                      onChange={() => {}} // Controlled by container onClick
                      className="mt-0.5 rounded border-[#1E293B] text-[#10B981] focus:ring-[#10B981]"
                    />
                    <div className="min-w-0">
                      <span
                        className={`text-xs font-bold block ${
                          step.isCompleted ? 'text-white' : 'text-[#E2E8F0]'
                        }`}
                      >
                        {step.title}
                      </span>
                      <p className="text-[11px] text-[#64748B] mt-0.5 leading-relaxed">
                        {step.description}
                      </p>
                      {step.completedAt && (
                        <span className="text-[10px] font-mono text-[#10B981] block mt-1">
                          ✓ Executed at {step.completedAt.substring(11, 19)} UTC by {step.completedBy}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Affected Assets & Blast Radius Quarantining */}
          <div className="bg-[#090D12] border border-[#1E293B] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
                <Server className="w-4 h-4 text-[#F97316]" />
                Affected Blast Radius ({currentIncident.affectedAssets.length})
              </h2>
            </div>

            <div className="space-y-3">
              {currentIncident.affectedAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="p-3.5 rounded-lg border border-[#1E293B] bg-[#0F1722] flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-white block">
                        {asset.hostname}
                      </span>
                      <span className="font-mono text-[11px] text-[#94A3B8]">
                        {asset.ipAddress} • {asset.os || 'Linux Container'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono text-[#64748B] block">
                        Risk Score
                      </span>
                      <span className="font-mono text-xs font-bold text-[#EF4444]">
                        {asset.riskScore}/100
                      </span>
                    </div>
                  </div>

                  {/* Isolation Action Button */}
                  <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between">
                    <span className="text-[11px] text-[#94A3B8]">
                      VPC Network Isolation:
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        toggleAssetIsolation(currentIncident.id, asset.id)
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        asset.isIsolated
                          ? 'bg-[#EF4444] text-white shadow-md shadow-red-950/40'
                          : 'bg-[#1E293B] text-[#94A3B8] hover:text-white hover:bg-[#334155]'
                      }`}
                    >
                      {asset.isIsolated ? (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>SEVERED / ISOLATED</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Isolate Host</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
