<img width="1889" height="983" alt="Screenshot 2025-12-27 at 11 30 07 PM" src="https://github.com/user-attachments/assets/9fa60c28-a69c-4b6e-af69-1cd394c9f283" />

## speedOps | Internal Startup OS

**speedOps** is a high-signal, high-contrast operational command center built for fast-scaling startups. It bridges the gap between high-level project management and granular engineering execution by combining AI-assisted planning with a gated, proof-based task orchestration pipeline and multi-user workspace synchronization.

## 🚀 Core Features

### 1. Nexus Cluster Architecture (Multi-User Sync)
The platform has evolved from individual silos to **Operational Clusters**.
- **Nexus Invites**: Owners can generate 6-digit authorization codes to sync multiple operators to the same workspace.
- **Cluster Isolation**: Data is partitioned at the workspace level, ensuring complete sovereignty and secure collaboration within a team.
- **Live Membership**: Real-time tracking of which operators are synced to the cluster mainframe.

### 2. AI-Driven Project Inception (Neural Ingestion)
Leveraging **Google Gemini API**, speedOps transforms raw project requirements into high-fidelity technical briefs.
- **Project Briefing**: Automatically generates a developer-readable roadmap based on purpose, scope, and resources.
- **Unit Breakdown**: Decomposes the brief into specific features, tasks, and temporal markers (milestones) assigned to specific operators based on their roles.

### 3. Gated Task Orchestration (Handover Protocol)
Tasks aren't just "moved"; they are migrated through a cryptographic-style protocol.
- **Proof of Work**: Moving a task to a subsequent stage (e.g., Testing to QA) requires a `Proof Link` (GitHub PR, Vercel Deploy) and protocol notes.
- **Accountability Handovers**: Every stage transition triggers a mandatory "Next Operator" assignment, ensuring no unit is ever left without an owner.

### 4. Intelligence Feed (Role-Aware Context)
A segmented communication layer designed for technical depth.
- **Severity Tagging**: Comments are categorized as `Bug`, `Error`, `UI/UX`, `Improvement`, or `Note`.
- **Operator Attribution**: Every piece of intelligence displays the author's specific role (e.g., "Sarah Chen | Backend") for instant context.
- **Visual Signal**: Semantic borders (e.g., red for bugs) provide immediate visual cues on task health.

### 5. Real-Time Operational Grid
Built for wall displays and war rooms.
- **Cluster Sync**: Powered by **Firebase Firestore** for sub-second synchronization across all operator terminals in a workspace.
- **Unit Matrix**: A Kanban-inspired board with vertical and horizontal snap modes, optimized for high-density information.
- **Operational Strength**: Tracks team member bandwidth and availability in real-time.

## 🛠 Tech Stack
- **Frontend**: React 19, Tailwind CSS (High-Contrast Neon Theme)
- **Icons**: Lucide-React
- **Intelligence**: Google Gemini (gemini-3-pro-preview)
- **Backend/DB**: Firebase Firestore (Workspace-Isolated Architecture)
- **Auth**: Firebase Authentication

## 📋 Installation & Setup
1. Ensure `process.env.API_KEY` is configured for Google Gemini.
2. Update `firebase.ts` with your specific Firebase project credentials.
3. **Security Rules**: Apply the workspace-membership rules provided in the documentation to ensure data isolation.
4. Deploy to a static hosting environment.

## 🔐 Database Sovereignty
All operational data resides in `/workspaces/{workspaceId}/`. Access is strictly governed by the `members` array within each workspace document, preventing cross-cluster data leakage.
