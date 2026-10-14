import React from 'react';
import { Header } from './components/layout/Header';
import { StatsBar } from './components/layout/StatsBar';
import { IncidentFilterBar } from './components/incidents/IncidentFilterBar';
import { IncidentList } from './components/incidents/IncidentList';
import { IncidentDetailWorkspace } from './components/workspace/IncidentDetailWorkspace';
import { ShiftHandoverModal } from './components/handover/ShiftHandoverModal';
import { CreateIncidentModal } from './components/incidents/CreateIncidentModal';
import { Footer } from './components/layout/Footer';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#090D12] text-[#E2E8F0] font-sans flex flex-col selection:bg-[#38BDF8]/20 selection:text-[#38BDF8]">
      {/* Global Security Console Header */}
      <Header />

      {/* Main Operations Center */}
      <main
        id="main-content"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1 w-full"
      >
        {/* Row 1: SOC KPI Stats Bar */}
        <StatsBar />

        {/* Row 2: Search & Severity Filter Bar */}
        <IncidentFilterBar />

        {/* Row 3: High-Density Incident Triage Table */}
        <IncidentList />

        {/* Row 4: Deep Incident Investigation Workspace & Playbook Runner */}
        <div id="investigation-workspace">
          <IncidentDetailWorkspace />
        </div>
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Modals & Overlays */}
      <ShiftHandoverModal />
      <CreateIncidentModal />
    </div>
  );
};

export default App;
