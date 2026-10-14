import React from 'react';
import { useSecurityStore } from '../../store/securityStore';
import {
  ShieldAlert,
  FileText,
  RotateCcw,
  Plus,
  Radio,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    incidents,
    openHandoverModal,
    openCreateModal,
    resetDemoData,
  } = useSecurityStore();

  const criticalCount = incidents.filter(
    (i) => i.severity === 'CRITICAL' && i.status !== 'RESOLVED' && i.status !== 'CLOSED'
  ).length;

  return (
    <header className="bg-[#0F1722] border-b border-[#1E293B] sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand Lockup */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E293B] to-[#090D12] border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8] shadow-lg shadow-cyan-950/20">
            <ShieldAlert className="w-5 h-5 text-[#38BDF8]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans font-bold text-lg text-white tracking-tight">
                Guardrail
              </span>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#1E293B] text-[#38BDF8] border border-[#38BDF8]/20">
                SecOps v1.0
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] hidden sm:block">
              Defensive Incident Response & Containment Orchestration
            </p>
          </div>
        </div>

        {/* Global Posture & SOC Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* DEFCON Status Indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#090D12] border border-[#1E293B] text-xs font-mono">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F97316] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F97316]" />
            </span>
            <span className="text-[#94A3B8]">POSTURE:</span>
            <span className="font-bold text-[#F97316]">DEFCON 2 (ELEVATED)</span>
          </div>

          {/* Active Criticals Pill */}
          {criticalCount > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-xs font-mono text-[#EF4444]">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span className="font-bold">{criticalCount} P0 Alarm</span>
            </div>
          )}

          {/* Shift Handover Brief */}
          <button
            onClick={openHandoverModal}
            className="p-2 sm:px-3 sm:py-2 rounded-xl border border-[#1E293B] bg-[#090D12] hover:bg-[#1E293B] text-[#94A3B8] hover:text-white text-xs font-sans font-medium transition-colors flex items-center gap-1.5"
            title="Generate Shift Handover Briefing"
          >
            <FileText className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span className="hidden sm:inline">Shift Handover</span>
          </button>

          {/* Reset Demo */}
          <button
            onClick={resetDemoData}
            title="Reset to default SOC incident fixtures"
            className="p-2 sm:px-3 sm:py-2 rounded-xl border border-[#1E293B] bg-[#090D12] hover:bg-[#1E293B] text-[#94A3B8] hover:text-white text-xs font-sans font-medium transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset Demo</span>
          </button>

          {/* Register Alarm Button */}
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs font-sans font-semibold transition-all shadow-md shadow-red-950/30"
          >
            <Plus className="w-4 h-4" />
            <span>Register Alarm</span>
          </button>
        </div>
      </div>
    </header>
  );
};
