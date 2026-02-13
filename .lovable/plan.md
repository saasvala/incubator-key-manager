

# Incubator Program Management System
## Offline-First Web App (Capacitor-Ready for APK)

### Phase 1: Foundation & Access Control
- **License Key Gate**: Full-screen license key entry on app open. Key validated locally against stored keys. Invalid key = app blocked, no UI shown.
- **Super Admin Auto-Setup**: On valid key, prompt to create Super Admin username + password. Stored in IndexedDB.
- **Login System**: Username + password login for all users. No self-signup. Session persisted locally.

### Phase 2: User & Role Management
- **9 Default Roles**: Super Admin, Program Director, Incubator Manager, Startup Coordinator, Mentor, Operations Manager, Finance Officer, Investor (read-only), External Auditor (read-only)
- **User Management Panel**: Super Admin creates/edits/deletes users with username + password + role. Reset/rework user button. User & role limits tied to license key.
- **Role-Based Access**: Each role sees only permitted modules and actions.

### Phase 3: Core Modules
- **Dashboard**: Role-specific overview with key metrics (startups, milestones, funding, sessions)
- **Startup Onboarding**: Register startups with founder info, assign to cohorts. Full CRUD.
- **Cohort Management**: Create/manage cohorts, assign startups, track cohort progress.
- **Mentorship Scheduling**: Schedule mentor sessions with startups, calendar view, status tracking.
- **Milestone Tracking**: Define milestones per startup, track completion status, timeline view.

### Phase 4: Operations & Finance Modules
- **Resource Allocation**: Track resources (equipment, space, tools), assign to startups/users.
- **Funding & Grants**: Record funding sources, amounts, disbursements per startup.
- **Performance Evaluation**: Score startups on criteria, evaluation history, comparison views.

### Phase 5: System & Reporting
- **Reports & Export**: Generate reports for startups, cohorts, funding. Export as CSV/PDF.
- **Audit Logs**: Track all user actions with timestamp — who did what, when.
- **Backup / Restore**: Export full IndexedDB data as encrypted JSON file. Import to restore.

### Phase 6: Branding & Polish
- **"Powered by Software Vala™"** branding on all screens — non-removable.
- **Dummy data** pre-loaded for all roles to demonstrate functionality.
- **Capacitor configuration** included so you can build the APK on your machine.

### Data Storage
All data stored in **IndexedDB** (browser local database) — completely offline, zero cloud. Tables: License, Roles, Users, Startups, Milestones, Mentor Sessions, Funding, Resources, Evaluations, Audit Logs, Backups.

### To Get Your APK
After building, you'll export to GitHub, install Capacitor, and run `npx cap run android` with Android Studio to produce your APK.

