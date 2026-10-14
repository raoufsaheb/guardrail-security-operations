import { create } from 'zustand';
import type {
  Incident,
  Severity,
  IncidentStatus,
  IncidentEvent,
} from '../types/security';
import { SEED_INCIDENTS } from '../data/seedIncidents';

const STORAGE_KEY = 'guardrail_secops_v1';

function loadPersistedIncidents(): Incident[] {
  if (typeof window === 'undefined') return SEED_INCIDENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_INCIDENTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_INCIDENTS;
  } catch {
    return SEED_INCIDENTS;
  }
}

function savePersistedIncidents(incidents: Incident[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(incidents));
  } catch {
    // safe
  }
}

export interface SecurityState {
  incidents: Incident[];
  selectedIncidentId: string | null;
  selectedSeverityFilter: Severity | 'ALL';
  selectedStatusFilter: IncidentStatus | 'ALL';
  searchQuery: string;

  isHandoverModalOpen: boolean;
  isCreateModalOpen: boolean;

  // Actions
  selectIncident: (id: string | null) => void;
  setSeverityFilter: (sev: Severity | 'ALL') => void;
  setStatusFilter: (status: IncidentStatus | 'ALL') => void;
  setSearchQuery: (query: string) => void;
  openHandoverModal: () => void;
  closeHandoverModal: () => void;
  openCreateModal: () => void;
  closeCreateModal: () => void;

  updateIncidentStatus: (id: string, status: IncidentStatus) => void;
  assignIncident: (id: string, assignee: string) => void;
  togglePlaybookStep: (incidentId: string, stepId: string) => void;
  toggleAssetIsolation: (incidentId: string, assetId: string) => void;
  addTimelineEvent: (
    incidentId: string,
    eventData: Omit<IncidentEvent, 'id' | 'timestamp'>
  ) => void;
  createIncident: (
    data: Omit<
      Incident,
      'id' | 'createdAt' | 'updatedAt' | 'slaDeadline' | 'timeline'
    >
  ) => void;
  resetDemoData: () => void;
}

export const useSecurityStore = create<SecurityState>((set) => ({
  incidents: loadPersistedIncidents(),
  selectedIncidentId: 'INC-2026-8841',
  selectedSeverityFilter: 'ALL',
  selectedStatusFilter: 'ALL',
  searchQuery: '',

  isHandoverModalOpen: false,
  isCreateModalOpen: false,

  selectIncident: (id) => set({ selectedIncidentId: id }),
  setSeverityFilter: (sev) => set({ selectedSeverityFilter: sev }),
  setStatusFilter: (status) => set({ selectedStatusFilter: status }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  openHandoverModal: () => set({ isHandoverModalOpen: true }),
  closeHandoverModal: () => set({ isHandoverModalOpen: false }),
  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),

  updateIncidentStatus: (id, status) => {
    set((state) => {
      const nextIncidents = state.incidents.map((inc) => {
        if (inc.id === id) {
          const updatedEvent: IncidentEvent = {
            id: `ev_${Date.now()}`,
            timestamp: new Date().toISOString(),
            source: 'analyst',
            message: `Status transitioned from ${inc.status} to ${status}.`,
            severity: 'INFO',
          };
          return {
            ...inc,
            status,
            updatedAt: new Date().toISOString(),
            timeline: [updatedEvent, ...inc.timeline],
          };
        }
        return inc;
      });

      savePersistedIncidents(nextIncidents);
      return { incidents: nextIncidents };
    });
  },

  assignIncident: (id, assignee) => {
    set((state) => {
      const nextIncidents = state.incidents.map((inc) => {
        if (inc.id === id) {
          return {
            ...inc,
            assignee,
            updatedAt: new Date().toISOString(),
          };
        }
        return inc;
      });
      savePersistedIncidents(nextIncidents);
      return { incidents: nextIncidents };
    });
  },

  togglePlaybookStep: (incidentId, stepId) => {
    set((state) => {
      const nextIncidents = state.incidents.map((inc) => {
        if (inc.id !== incidentId) return inc;

        let isolatedTriggered = false;
        const now = new Date().toISOString();

        const updatedSteps = inc.playbook.steps.map((step) => {
          if (step.id === stepId) {
            const nextCompleted = !step.isCompleted;
            if (nextCompleted && step.actionRequired === 'isolate-host') {
              isolatedTriggered = true;
            }
            return {
              ...step,
              isCompleted: nextCompleted,
              completedAt: nextCompleted ? now : undefined,
              completedBy: nextCompleted ? 'Alex Rivera (Lead SOC)' : undefined,
            };
          }
          return step;
        });

        // Isolate affected asset if required
        const nextAssets = isolatedTriggered
          ? inc.affectedAssets.map((a) => ({ ...a, isIsolated: true }))
          : inc.affectedAssets;

        // Auto-advance to CONTAINED if all steps are completed
        const allCompleted = updatedSteps.every((s) => s.isCompleted);
        const nextStatus =
          allCompleted && inc.status === 'INVESTIGATING'
            ? 'CONTAINED'
            : inc.status;

        const timelineEvent: IncidentEvent = {
          id: `ev_pb_${Date.now()}`,
          timestamp: now,
          source: 'analyst',
          message: `Playbook action updated for "${inc.playbook.name}" (Step: ${stepId})`,
          severity: 'INFO',
        };

        return {
          ...inc,
          status: nextStatus,
          playbook: { ...inc.playbook, steps: updatedSteps },
          affectedAssets: nextAssets,
          timeline: [timelineEvent, ...inc.timeline],
          updatedAt: now,
        };
      });

      savePersistedIncidents(nextIncidents);
      return { incidents: nextIncidents };
    });
  },

  toggleAssetIsolation: (incidentId, assetId) => {
    set((state) => {
      const nextIncidents = state.incidents.map((inc) => {
        if (inc.id !== incidentId) return inc;

        const nextAssets = inc.affectedAssets.map((a) => {
          if (a.id === assetId) {
            const nextIso = !a.isIsolated;
            return { ...a, isIsolated: nextIso };
          }
          return a;
        });

        const targetAsset = inc.affectedAssets.find((a) => a.id === assetId);
        const now = new Date().toISOString();
        const timelineEvent: IncidentEvent = {
          id: `ev_iso_${Date.now()}`,
          timestamp: now,
          source: 'analyst',
          message: targetAsset?.isIsolated
            ? `Asset ${targetAsset.hostname} reconnected to VPC network.`
            : `Asset ${targetAsset?.hostname} ISOLATED from production VPC via EDR API.`,
          severity: 'CRITICAL',
        };

        return {
          ...inc,
          affectedAssets: nextAssets,
          timeline: [timelineEvent, ...inc.timeline],
          updatedAt: now,
        };
      });

      savePersistedIncidents(nextIncidents);
      return { incidents: nextIncidents };
    });
  },

  addTimelineEvent: (incidentId, eventData) => {
    set((state) => {
      const nextIncidents = state.incidents.map((inc) => {
        if (inc.id !== incidentId) return inc;

        const newEvent: IncidentEvent = {
          ...eventData,
          id: `ev_${Date.now()}`,
          timestamp: new Date().toISOString(),
        };

        return {
          ...inc,
          timeline: [newEvent, ...inc.timeline],
          updatedAt: new Date().toISOString(),
        };
      });

      savePersistedIncidents(nextIncidents);
      return { incidents: nextIncidents };
    });
  },

  createIncident: (data) => {
    const now = new Date().toISOString();
    const id = `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const deadlineMs = Date.now() + data.slaMinutes * 60 * 1000;
    const slaDeadline = new Date(deadlineMs).toISOString();

    const newIncident: Incident = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
      slaDeadline,
      timeline: [
        {
          id: `ev_init_${Date.now()}`,
          timestamp: now,
          source: 'analyst',
          message: `Manual alarm registered by SOC triage team. SLA window: ${data.slaMinutes}m.`,
          severity: data.severity,
        },
      ],
    };

    set((state) => {
      const nextIncidents = [newIncident, ...state.incidents];
      savePersistedIncidents(nextIncidents);
      return {
        incidents: nextIncidents,
        selectedIncidentId: newIncident.id,
      };
    });
  },

  resetDemoData: () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // safe
      }
    }
    savePersistedIncidents(SEED_INCIDENTS);
    set({
      incidents: SEED_INCIDENTS,
      selectedIncidentId: 'INC-2026-8841',
      selectedSeverityFilter: 'ALL',
      selectedStatusFilter: 'ALL',
      searchQuery: '',
    });
  },
}));
