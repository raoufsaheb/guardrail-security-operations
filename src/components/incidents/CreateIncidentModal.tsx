import React, { useState } from 'react';
import { useSecurityStore } from '../../store/securityStore';
import type { Severity, IncidentStatus } from '../../types/security';
import { X, PlusCircle } from 'lucide-react';

export const CreateIncidentModal: React.FC = () => {
  const { isCreateModalOpen, closeCreateModal, createIncident } =
    useSecurityStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<Severity>('HIGH');
  const [assignee, setAssignee] = useState('Alex Rivera (Lead SOC)');
  const [slaMinutes, setSlaMinutes] = useState(240);
  const [hostname, setHostname] = useState('prod-app-server-08');
  const [ipAddress, setIpAddress] = useState('10.0.12.44');
  const [mitreId, setMitreId] = useState('T1059.004');
  const [mitreName, setMitreName] = useState('Command and Scripting: Unix Shell');

  if (!isCreateModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    createIncident({
      title: title.trim(),
      description: description.trim(),
      severity,
      status: 'TRIAGE' as IncidentStatus,
      assignee,
      slaMinutes,
      mitreTechniques: [
        {
          id: mitreId,
          name: mitreName,
          tactic: 'Execution',
        },
      ],
      affectedAssets: [
        {
          id: `ast_${Date.now()}`,
          hostname: hostname.trim(),
          ipAddress: ipAddress.trim(),
          assetType: 'server',
          riskScore: severity === 'CRITICAL' ? 92 : severity === 'HIGH' ? 76 : 45,
          isIsolated: false,
          os: 'Linux Host',
        },
      ],
      playbook: {
        id: `pb_${Date.now()}`,
        name: `${title.trim()} Rapid Response`,
        category: 'Custom Triage',
        steps: [
          {
            id: 's1',
            title: 'Sever Host Network Interface (EDR Isolation)',
            description: 'Isolate host from production VPC to contain threat propagation.',
            isCompleted: false,
            actionRequired: 'isolate-host',
          },
          {
            id: 's2',
            title: 'Verify Ingress Source & Revoke Credentials',
            description: 'Check active IAM sessions and invalidate suspicious tokens.',
            isCompleted: false,
          },
        ],
      },
    });

    closeCreateModal();
    // Reset form
    setTitle('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0F1722] border border-[#1E293B] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative my-8 text-xs font-sans">
        <button
          onClick={closeCreateModal}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#94A3B8] hover:text-white hover:bg-[#1E293B]"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444]">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-sans font-bold text-lg text-white">
              Register New Security Alarm
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Manual alarm ingestion with automated SLA & playbook provisioning
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Severity & SLA */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">
                Alarm Severity
              </label>
              <select
                value={severity}
                onChange={(e) => {
                  const s = e.target.value as Severity;
                  setSeverity(s);
                  if (s === 'CRITICAL') setSlaMinutes(60);
                  else if (s === 'HIGH') setSlaMinutes(240);
                  else if (s === 'MEDIUM') setSlaMinutes(720);
                  else setSlaMinutes(1440);
                }}
                className="w-full bg-[#090D12] border border-[#1E293B] rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-[#38BDF8]"
              >
                <option value="CRITICAL">CRITICAL (P0 - 1h SLA)</option>
                <option value="HIGH">HIGH (P1 - 4h SLA)</option>
                <option value="MEDIUM">MEDIUM (P2 - 12h SLA)</option>
                <option value="LOW">LOW (P3 - 24h SLA)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">
                SLA Window (Minutes)
              </label>
              <input
                type="number"
                value={slaMinutes}
                onChange={(e) => setSlaMinutes(Number(e.target.value))}
                required
                className="w-full bg-[#090D12] border border-[#1E293B] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#38BDF8]"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">
              Incident Headline / Alarm Title
            </label>
            <input
              type="text"
              placeholder="e.g. Cobalt Strike Beaconing from Production Kubernetes Pod"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-[#090D12] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#38BDF8]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">
              Threat Synopsis & Forensic Details
            </label>
            <textarea
              rows={3}
              placeholder="Details on telemetry alert, hashes, C2 IP, or process tree..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full bg-[#090D12] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#38BDF8]"
            />
          </div>

          {/* Target Asset Hostname & IP */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">
                Target Hostname
              </label>
              <input
                type="text"
                value={hostname}
                onChange={(e) => setHostname(e.target.value)}
                required
                className="w-full bg-[#090D12] border border-[#1E293B] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#38BDF8]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">
                Target IP Address
              </label>
              <input
                type="text"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                required
                className="w-full bg-[#090D12] border border-[#1E293B] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#38BDF8]"
              />
            </div>
          </div>

          {/* MITRE Technique */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">
                MITRE Technique ID
              </label>
              <input
                type="text"
                value={mitreId}
                onChange={(e) => setMitreId(e.target.value)}
                className="w-full bg-[#090D12] border border-[#1E293B] rounded-xl px-3 py-2 text-xs font-mono text-[#A78BFA] focus:outline-none focus:border-[#38BDF8]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">
                MITRE Technique Name
              </label>
              <input
                type="text"
                value={mitreName}
                onChange={(e) => setMitreName(e.target.value)}
                className="w-full bg-[#090D12] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#38BDF8]"
              />
            </div>
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">
              Lead Analyst Assignee
            </label>
            <input
              type="text"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="w-full bg-[#090D12] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#38BDF8]"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#1E293B]">
            <button
              type="button"
              onClick={closeCreateModal}
              className="px-4 py-2 rounded-xl text-[#94A3B8] hover:text-white font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold transition-all shadow-md shadow-red-950/40"
            >
              Create Incident
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
