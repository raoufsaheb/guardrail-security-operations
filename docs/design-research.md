# Guardrail — Design Research & Visual Identity

## 1. Visual Research & Benchmarks

SecOps analysts triage dozens to hundreds of security telemetry alerts per shift. The user experience must prioritize:
1. **Zero Eye Strain**: Dark obsidian background prevents visual fatigue across 12-hour shifts.
2. **Instant Severity Differentiation**: High-contrast, standardized chromatic signaling for threat severity (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
3. **Information Density**: Compact tabular views with monospace alignment for IP addresses, CIDR blocks, SHA-256 hashes, and MITRE technique IDs.

### Primary References:
- **CrowdStrike Falcon Console**: Tactical slate and obsidian cards, immediate host isolation controls.
- **SentinelOne Singularity**: Incident lifecycle progression bar and blast radius topology.
- **Datadog Cloud SIEM**: Forensic audit timelines with telemetry source badges.

---

## 2. Color Palette & Tactical Accents

| Role | Color | Hex Code | Visual Purpose |
|---|---|---|---|
| **Void Ground** | Obsidian Black | `#090D12` | Deepest surface, zero screen glare |
| **Console Surface** | Slate Midnight | `#0F1722` | Cards, panels, workspace drawers |
| **Tactical Border** | Steel Grid | `#1E293B` | Clean 1px structural framing |
| **Critical Alarm** | Crimson Pulse | `#EF4444` | P0 Severity, immediate action required |
| **High Threat** | Amber Flare | `#F97316` | P1 Severity, 4-hour SLA |
| **Medium Threat** | Gold Warning | `#FBBF24` | P2 Severity, 12-hour SLA |
| **Low / Info** | Terminal Cyan | `#38BDF8` | Informational telemetry, audit log badges |
| **Contained / Resolved**| Emerald Shield | `#10B981` | Threat neutralized, host secured |

---

## 3. Typography & Monospace Ergonomics

1. **Headers & Interface Text**: `Plus Jakarta Sans`
   - Geometric grotesque with excellent legibility at small sizes (11px-13px).
2. **Technical Telemetry**: `JetBrains Mono`
   - Tabular figures (`tnum`) for IP addresses (`10.0.14.88`), hostnames (`prod-k8s-worker-02`), timestamps (`14:52:18 UTC`), and MITRE IDs (`T1078.001`).

---

## 4. Component Layout Patterns

1. **DEFCON / SOC Status Banner**:
   - Real-time global posture indicator (`DEFCON 2 / ELEVATED`), active criticals counter, and shift countdown.
2. **Incident Stream Table**:
   - High-density rows with severity indicators, SLA countdown, MITRE technique tags, affected asset chips, and assignee avatars.
3. **Incident Investigation Workspace**:
   - Dual-column workspace:
     - Left (60%): Incident description, MITRE ATT&CK breakdown, forensic event timeline.
     - Right (40%): Response Playbook execution checklist and Affected Assets with "Isolate Host from VPC" toggle.
4. **Shift Handover Brief Modal**:
   - Executive brief compiled dynamically with open criticals, active containments, and SLA breach risks.
