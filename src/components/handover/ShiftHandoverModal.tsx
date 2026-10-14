import React, { useState } from 'react';
import { useSecurityStore } from '../../store/securityStore';
import { generateShiftHandoverReport } from '../../lib/incidentTriage';
import {
  X,
  FileText,
  Copy,
  Check,
  Download,
  ShieldCheck,
} from 'lucide-react';

export const ShiftHandoverModal: React.FC = () => {
  const { isHandoverModalOpen, closeHandoverModal, incidents } =
    useSecurityStore();

  const [copied, setCopied] = useState(false);

  if (!isHandoverModalOpen) return null;

  const report = generateShiftHandoverReport(incidents);

  const handleCopy = () => {
    navigator.clipboard.writeText(report.markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([report.markdownContent], {
      type: 'text/markdown;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `soc_shift_handover_${Date.now()}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0F1722] border border-[#1E293B] rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative my-8">
        <button
          onClick={closeHandoverModal}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#94A3B8] hover:text-white hover:bg-[#1E293B]"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8]">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-sans font-bold text-lg text-white">
              SOC Shift Handover Executive Brief
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Automated turnover briefing for incoming Tier 2/3 incident response team
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-4 text-xs font-mono">
          <div className="p-3 rounded-xl bg-[#090D12] border border-[#1E293B]">
            <span className="text-[#94A3B8] block text-[10px]">Open Criticals</span>
            <span className="text-base font-bold text-[#EF4444]">
              {report.openCriticals.length}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#090D12] border border-[#1E293B]">
            <span className="text-[#94A3B8] block text-[10px]">Isolated Hosts</span>
            <span className="text-base font-bold text-[#10B981]">
              {report.containedAssetsCount}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#090D12] border border-[#1E293B]">
            <span className="text-[#94A3B8] block text-[10px]">Active Queue</span>
            <span className="text-base font-bold text-[#38BDF8]">
              {report.totalActiveIncidents}
            </span>
          </div>
        </div>

        {/* Markdown Output Viewer */}
        <div className="border border-[#1E293B] rounded-xl bg-[#090D12] p-4 max-h-96 overflow-y-auto mb-4 font-mono text-xs text-[#CBD5E1] whitespace-pre-wrap leading-relaxed select-text">
          {report.markdownContent}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-[#1E293B]">
          <div className="flex items-center gap-2 text-xs text-[#10B981] font-mono">
            <ShieldCheck className="w-4 h-4" />
            <span>Forensic ledger signed & ready</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-2 rounded-xl border border-[#1E293B] hover:bg-[#1E293B] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#10B981]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Markdown</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl bg-[#38BDF8] hover:bg-[#0284C7] text-[#090D12] text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export .md File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
