import { describe, it, expect, beforeEach } from 'vitest';
import { useSecurityStore } from '../src/store/securityStore';

describe('SecurityStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useSecurityStore.getState().resetDemoData();
  });

  it('initializes with seed incidents and default selection', () => {
    const state = useSecurityStore.getState();
    expect(state.incidents.length).toBe(4);
    expect(state.selectedIncidentId).toBe('INC-2026-8841');
  });

  it('updates incident status and records audit log in timeline', () => {
    useSecurityStore.getState().updateIncidentStatus('INC-2026-8841', 'CONTAINED');

    const inc = useSecurityStore
      .getState()
      .incidents.find((i) => i.id === 'INC-2026-8841')!;

    expect(inc.status).toBe('CONTAINED');
    expect(inc.timeline[0].message).toContain('CONTAINED');
  });

  it('toggles playbook step and triggers host isolation when actionRequired', () => {
    const initialAsset = useSecurityStore
      .getState()
      .incidents.find((i) => i.id === 'INC-2026-8841')!
      .affectedAssets[0];

    expect(initialAsset.isIsolated).toBe(false);

    // Step 1 on INC-2026-8841 has actionRequired: 'isolate-host'
    useSecurityStore.getState().togglePlaybookStep('INC-2026-8841', 'step_1');

    const updatedInc = useSecurityStore
      .getState()
      .incidents.find((i) => i.id === 'INC-2026-8841')!;

    expect(updatedInc.playbook.steps[0].isCompleted).toBe(true);
    expect(updatedInc.affectedAssets[0].isIsolated).toBe(true);
  });

  it('toggles asset isolation directly with audit log entry', () => {
    const incId = 'INC-2026-8834';
    const assetId = 'asset_bastion_01';

    useSecurityStore.getState().toggleAssetIsolation(incId, assetId);

    const inc = useSecurityStore
      .getState()
      .incidents.find((i) => i.id === incId)!;

    expect(inc.affectedAssets[0].isIsolated).toBe(true);
    expect(inc.timeline[0].message).toContain('ISOLATED');
  });

  it('creates a new manual alarm incident with computed SLA', () => {
    const initialCount = useSecurityStore.getState().incidents.length;

    useSecurityStore.getState().createIncident({
      title: 'Manual Honeypot Alarm',
      description: 'Unauthorized port probe detected on subnet 10.0.99.0/24',
      severity: 'HIGH',
      status: 'TRIAGE',
      assignee: 'Alex Rivera',
      slaMinutes: 120,
      mitreTechniques: [
        { id: 'T1046', name: 'Network Service Discovery', tactic: 'Discovery' },
      ],
      affectedAssets: [
        {
          id: 'ast_honey',
          hostname: 'honeypot-node-01',
          ipAddress: '10.0.99.4',
          assetType: 'server',
          riskScore: 65,
          isIsolated: false,
        },
      ],
      playbook: {
        id: 'pb_honeypot',
        name: 'Honeypot Ingress Triage',
        category: 'Discovery',
        steps: [
          {
            id: 's1',
            title: 'Verify Offending Source IP',
            description: 'Check IP in AbuseIPDB and AlienVault OTX',
            isCompleted: false,
          },
        ],
      },
    });

    const updatedState = useSecurityStore.getState();
    expect(updatedState.incidents.length).toBe(initialCount + 1);
    expect(updatedState.incidents[0].title).toBe('Manual Honeypot Alarm');
  });
});
