// ============= Incubator Program Management System Types =============

export interface License {
  id: string;
  key: string;
  device: string;
  expiry: string;
  modules: string[];
  seats: number;
  activated: boolean;
}

export type RoleName =
  | 'Super Admin'
  | 'Program Director'
  | 'Incubator Manager'
  | 'Startup Coordinator'
  | 'Mentor'
  | 'Operations Manager'
  | 'Finance Officer'
  | 'Investor'
  | 'External Auditor';

export const READ_ONLY_ROLES: RoleName[] = ['Investor', 'External Auditor'];

export const DEFAULT_ROLES: RoleName[] = [
  'Super Admin',
  'Program Director',
  'Incubator Manager',
  'Startup Coordinator',
  'Mentor',
  'Operations Manager',
  'Finance Officer',
  'Investor',
  'External Auditor',
];

export interface Role {
  id: string;
  name: RoleName;
}

export interface User {
  id: string;
  roleId: string;
  username: string;
  password: string;
  status: 'active' | 'inactive' | 'locked';
  createdAt: string;
}

export interface Startup {
  id: string;
  name: string;
  founder: string;
  cohortId: string;
  description: string;
  status: 'active' | 'inactive' | 'graduated';
  createdAt: string;
}

export interface Cohort {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'upcoming';
}

export interface Milestone {
  id: string;
  startupId: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
  completedDate?: string;
}

export interface MentorSession {
  id: string;
  startupId: string;
  mentorId: string;
  date: string;
  notes: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface Funding {
  id: string;
  startupId: string;
  source: string;
  amount: number;
  date: string;
  type: 'grant' | 'investment' | 'loan';
}

export interface Resource {
  id: string;
  type: string;
  name: string;
  assignedTo: string;
  status: 'available' | 'assigned' | 'maintenance';
}

export interface Evaluation {
  id: string;
  startupId: string;
  score: number;
  criteria: string;
  evaluatorId: string;
  date: string;
  notes: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  date: string;
}

export interface Backup {
  id: string;
  date: string;
  size: number;
  data: string;
}

export interface AppState {
  licenseValid: boolean;
  superAdminCreated: boolean;
  currentUser: User | null;
}

// Role-module access matrix
export const ROLE_PERMISSIONS: Record<RoleName, string[]> = {
  'Super Admin': ['dashboard', 'startups', 'cohorts', 'mentorship', 'milestones', 'resources', 'funding', 'evaluation', 'reports', 'audit', 'backup', 'users'],
  'Program Director': ['dashboard', 'startups', 'cohorts', 'mentorship', 'milestones', 'resources', 'funding', 'evaluation', 'reports'],
  'Incubator Manager': ['dashboard', 'startups', 'cohorts', 'mentorship', 'milestones', 'resources', 'evaluation'],
  'Startup Coordinator': ['dashboard', 'startups', 'cohorts', 'mentorship', 'milestones'],
  'Mentor': ['dashboard', 'mentorship', 'milestones'],
  'Operations Manager': ['dashboard', 'resources', 'reports'],
  'Finance Officer': ['dashboard', 'funding', 'reports'],
  'Investor': ['dashboard', 'startups', 'funding', 'evaluation'],
  'External Auditor': ['dashboard', 'reports', 'audit'],
};
