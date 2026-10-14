import React from 'react';
import { ShieldCheck, Lock, Terminal } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#090D12] border-t border-[#1E293B] py-10 mt-16 text-xs font-sans text-[#64748B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand info */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1E293B] border border-[#38BDF8]/20 flex items-center justify-center text-[#38BDF8]">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-white block">
                Guardrail Defensive Security Console
              </span>
              <span>Autonomous SOC Incident Response & Playbook Orchestration</span>
            </div>
          </div>

          {/* Compliance Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0F1722] border border-[#1E293B] text-[11px] text-[#38BDF8] font-mono">
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            <span>SOC 2 Type II • NIST 800-61 Rev 2 Incident Standard</span>
          </div>

          {/* On-Call Metadata */}
          <div className="text-right text-[11px] text-[#64748B]">
            <p className="flex items-center gap-1 md:justify-end">
              <Lock className="w-3 h-3 text-[#10B981]" />
              Forensic audit log sealed with in-memory temporal integrity
            </p>
            <p className="mt-0.5">© 2026 Guardrail Security. Professional Developer Portfolio Exhibition.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
