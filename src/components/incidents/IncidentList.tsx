import React from 'react';
import { useSecurityStore } from '../../store/securityStore';
import {
  calculateSlaStatus,
  SEVERITY_CONFIG,
} from '../../lib/incidentTriage';
import {
  ShieldAlert,
  Clock,
  Server,
  User,
  Radio,
  ChevronRight,
} from 'lucide-react';

export const IncidentList: React.FC = () => {
  const {
    incidents,
    selectedIncidentId,
    selectIncident,
    selectedSeverityFilter,
    selectedStatusFilter,
    searchQuery,
  } = useSecurityStore();

  const filtered = incidents.filter((i) => {
    // Severity filter
    if (
      selectedSeverityFilter !== 'ALL' &&
      i.severity !== selectedSeverityFilter
    ) {
      return false;
    }

    // Status filter
    if (selectedStatusFilter !== 'ALL' && i.status !== selectedStatusFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const matchTitle = i.title.toLowerCase().includes(q);
      const matchId = i.id.toLowerCase().includes(q);
      const matchAsset = i.affectedAssets.some(
        (a) =>
          a.hostname.toLowerCase().includes(q) ||
          a.ipAddress.toLowerCase().includes(q)
      );
      const matchMitre = i.mitreTechniques.some(
        (m) =>
          m.id.toLowerCase().includes(q) || m.name.toLowerCase().includes(q)
      );

      if (!matchTitle && !matchId && !matchAsset && !matchMitre) {
        return false;
      }
    }

    return true;
  });

  return (
    <section aria-labelledby="incident-queue-heading" className="bg-[#0F1722] border border-[#1E293B] rounded-2xl overflow-hidden shadow-xs">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-[#1E293B] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#38BDF8]" />
          <h2 id="incident-queue-heading" className="font-sans font-bold text-sm text-white">
            Incident Triage Stream ({filtered.length})
          </h2>
        </div>
        <span className="text-[11px] font-mono text-[#94A3B8]">
          Select an incident to launch investigation workspace
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-[#94A3B8] text-xs">
          <p className="font-semibold text-white text-sm mb-1">
            No incidents match active filters
          </p>
          <p>Try resetting severity or status criteria.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1E293B] text-[10px] font-semibold text-[#64748B] uppercase tracking-wider bg-[#090D12]">
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Incident ID & Title</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Target Host / Asset</th>
                <th className="py-3 px-4">MITRE Technique</th>
                <th className="py-3 px-4">SLA Countdown</th>
                <th className="py-3 px-4">Assignee</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B] text-xs font-sans">
              {filtered.map((inc) => {
                const isSelected = selectedIncidentId === inc.id;
                const sla = calculateSlaStatus(inc);
                const sevConfig = SEVERITY_CONFIG[inc.severity];
                const primaryAsset = inc.affectedAssets[0];

                return (
                  <tr
                    key={inc.id}
                    onClick={() => selectIncident(inc.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#1E293B]/70 border-l-2 border-[#38BDF8]'
                        : 'hover:bg-[#1E293B]/40'
                    }`}
                  >
                    {/* Severity Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider"
                        style={{
                          backgroundColor: `${sevConfig.bg}25`,
                          color: sevConfig.bg,
                          border: `1px solid ${sevConfig.bg}40`,
                        }}
                      >
                        {sevConfig.pulse && (
                          <Radio className="w-3 h-3 animate-pulse" />
                        )}
                        {inc.severity}
                      </span>
                    </td>

                    {/* ID & Title */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-semibold text-[#38BDF8]">
                          {inc.id}
                        </span>
                      </div>
                      <div className="font-semibold text-white truncate max-w-sm">
                        {inc.title}
                      </div>
                    </td>

                    {/* Status Chip */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border ${
                          inc.status === 'CONTAINED'
                            ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
                            : inc.status === 'RESOLVED'
                            ? 'bg-[#64748B]/15 text-[#94A3B8] border-[#64748B]/30'
                            : 'bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/30'
                        }`}
                      >
                        {inc.status}
                      </span>
                    </td>

                    {/* Affected Asset */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {primaryAsset ? (
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <Server className="w-3.5 h-3.5 text-[#64748B]" />
                          <span className="text-[#E2E8F0]">
                            {primaryAsset.hostname}
                          </span>
                          {primaryAsset.isIsolated && (
                            <span className="text-[9px] bg-[#EF4444]/20 text-[#EF4444] px-1.5 py-0.2 rounded border border-[#EF4444]/30">
                              ISOLATED
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[#64748B]">None</span>
                      )}
                    </td>

                    {/* MITRE Technique */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {inc.mitreTechniques[0] ? (
                        <span className="font-mono text-[11px] text-[#A78BFA] bg-[#A78BFA]/10 px-2 py-0.5 rounded-md border border-[#A78BFA]/20">
                          {inc.mitreTechniques[0].id}
                        </span>
                      ) : (
                        <span className="text-[#64748B]">—</span>
                      )}
                    </td>

                    {/* SLA Timer */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div
                        className={`flex items-center gap-1.5 font-mono text-[11px] font-semibold ${
                          sla.isBreached
                            ? 'text-[#EF4444]'
                            : sla.isWarning
                            ? 'text-[#F97316]'
                            : 'text-[#94A3B8]'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{sla.displayString}</span>
                      </div>
                    </td>

                    {/* Assignee */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                        <User className="w-3 h-3 text-[#64748B]" />
                        <span>{inc.assignee.split(' ')[0]}</span>
                      </div>
                    </td>

                    {/* Inspect Icon */}
                    <td className="py-3 px-4 text-right">
                      <div className="text-[#38BDF8] p-1 rounded-lg">
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
