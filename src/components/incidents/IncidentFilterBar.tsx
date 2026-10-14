import React from 'react';
import { useSecurityStore } from '../../store/securityStore';
import type { Severity, IncidentStatus } from '../../types/security';
import { Search, Filter } from 'lucide-react';

export const IncidentFilterBar: React.FC = () => {
  const {
    selectedSeverityFilter,
    setSeverityFilter,
    selectedStatusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    incidents,
  } = useSecurityStore();

  const severities: (Severity | 'ALL')[] = [
    'ALL',
    'CRITICAL',
    'HIGH',
    'MEDIUM',
    'LOW',
  ];

  const statuses: (IncidentStatus | 'ALL')[] = [
    'ALL',
    'TRIAGE',
    'INVESTIGATING',
    'CONTAINED',
    'RESOLVED',
  ];

  const getSeverityBadgeCount = (sev: Severity | 'ALL') => {
    if (sev === 'ALL') return incidents.length;
    return incidents.filter((i) => i.severity === sev).length;
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0F1722] border border-[#1E293B] rounded-2xl p-4">
      {/* Severity Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mr-2 hidden sm:inline">
          Severity:
        </span>
        {severities.map((sev) => {
          const isSelected = selectedSeverityFilter === sev;
          const count = getSeverityBadgeCount(sev);

          return (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-sans font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-[#38BDF8] text-[#090D12] shadow-xs'
                  : 'bg-[#090D12] text-[#94A3B8] hover:text-white border border-[#1E293B]'
              }`}
            >
              <span>{sev}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  isSelected
                    ? 'bg-[#090D12]/20 text-[#090D12]'
                    : 'bg-[#1E293B] text-[#94A3B8]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Status Filter & Search Input */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status Dropdown */}
        <div className="relative">
          <Filter className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={selectedStatusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as IncidentStatus | 'ALL')
            }
            className="bg-[#090D12] border border-[#1E293B] rounded-xl pl-8 pr-8 py-2 text-xs font-sans text-white focus:outline-none focus:border-[#38BDF8] cursor-pointer appearance-none"
          >
            <option value="ALL">All Statuses</option>
            {statuses
              .filter((s) => s !== 'ALL')
              .map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] text-[#94A3B8]">
            ▼
          </div>
        </div>

        {/* Search */}
        <div className="relative flex-1 sm:w-64">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search host, IP, MITRE ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#090D12] border border-[#1E293B] rounded-xl pl-9 pr-4 py-2 text-xs font-sans text-white placeholder-[#64748B] focus:outline-none focus:border-[#38BDF8]"
          />
        </div>
      </div>
    </div>
  );
};
