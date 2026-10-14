import React from 'react';
import { useSecurityStore } from '../../store/securityStore';
import { calculateSlaStatus } from '../../lib/incidentTriage';
import {
  AlertOctagon,
  Server,
  Clock,
} from 'lucide-react';

export const StatsBar: React.FC = () => {
  const { incidents } = useSecurityStore();

  const activeIncidents = incidents.filter(
    (i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED'
  );

  const criticalCount = activeIncidents.filter((i) => i.severity === 'CRITICAL').length;
  const highCount = activeIncidents.filter((i) => i.severity === 'HIGH').length;

  let isolatedAssetsCount = 0;
  for (const inc of incidents) {
    isolatedAssetsCount += inc.affectedAssets.filter((a) => a.isIsolated).length;
  }

  const warningCount = activeIncidents.filter((i) => {
    const sla = calculateSlaStatus(i);
    return sla.isWarning || sla.isBreached;
  }).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Active Incidents */}
      <div className="bg-[#0F1722] rounded-2xl border border-[#1E293B] p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-[#94A3B8]">
            Active Alarms
          </span>
          <div className="w-7 h-7 rounded-lg bg-[#1E293B] flex items-center justify-center text-[#38BDF8]">
            <AlertOctagon className="w-4 h-4" />
          </div>
        </div>
        <div className="font-mono text-3xl font-bold text-white">
          {activeIncidents.length}
        </div>
        <span className="text-[11px] text-[#94A3B8] mt-1 block">
          {criticalCount} Critical • {highCount} High priority
        </span>
      </div>

      {/* 2. P0 Critical Threats */}
      <div className="bg-[#0F1722] rounded-2xl border border-[#1E293B] p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-[#94A3B8]">
            P0 Critical Threat
          </span>
          <div className="w-7 h-7 rounded-lg bg-[#EF4444]/20 flex items-center justify-center text-[#EF4444]">
            <AlertOctagon className="w-4 h-4 animate-pulse" />
          </div>
        </div>
        <div className="font-mono text-3xl font-bold text-[#EF4444]">
          {criticalCount}
        </div>
        <span className="text-[11px] text-[#94A3B8] mt-1 block">
          {criticalCount > 0 ? 'Active cryptoviral staging' : 'All criticals contained'}
        </span>
      </div>

      {/* 3. Isolated Assets */}
      <div className="bg-[#0F1722] rounded-2xl border border-[#1E293B] p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-[#94A3B8]">
            Quarantined Hosts
          </span>
          <div className="w-7 h-7 rounded-lg bg-[#10B981]/20 flex items-center justify-center text-[#10B981]">
            <Server className="w-4 h-4" />
          </div>
        </div>
        <div className="font-mono text-3xl font-bold text-[#10B981]">
          {isolatedAssetsCount}
        </div>
        <span className="text-[11px] text-[#94A3B8] mt-1 block">
          Network interface severed via EDR
        </span>
      </div>

      {/* 4. SLA Breach Risk */}
      <div className="bg-[#0F1722] rounded-2xl border border-[#1E293B] p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-[#94A3B8]">
            SLA Breach Risk
          </span>
          <div className="w-7 h-7 rounded-lg bg-[#F97316]/20 flex items-center justify-center text-[#F97316]">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div
          className={`font-mono text-3xl font-bold ${
            warningCount > 0 ? 'text-[#F97316]' : 'text-[#38BDF8]'
          }`}
        >
          {warningCount}
        </div>
        <span className="text-[11px] text-[#94A3B8] mt-1 block">
          {warningCount > 0 ? 'Immediate triage required' : 'All SLAs compliant'}
        </span>
      </div>
    </div>
  );
};
