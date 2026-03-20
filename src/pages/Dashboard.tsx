import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LogOut, Users, Rocket, Target, Calendar, DollarSign, Package, BarChart3, FileText, Shield, Database } from 'lucide-react';
import UserManagement from './UserManagement';

const MODULE_ICONS: Record<string, React.ReactNode> = {
  dashboard: <BarChart3 className="h-5 w-5" />,
  startups: <Rocket className="h-5 w-5" />,
  cohorts: <Users className="h-5 w-5" />,
  mentorship: <Calendar className="h-5 w-5" />,
  milestones: <Target className="h-5 w-5" />,
  resources: <Package className="h-5 w-5" />,
  funding: <DollarSign className="h-5 w-5" />,
  evaluation: <BarChart3 className="h-5 w-5" />,
  reports: <FileText className="h-5 w-5" />,
  audit: <Shield className="h-5 w-5" />,
  backup: <Database className="h-5 w-5" />,
  users: <Users className="h-5 w-5" />,
};

const MODULE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  startups: 'Startup Onboarding',
  cohorts: 'Cohort Management',
  mentorship: 'Mentorship Scheduling',
  milestones: 'Milestone Tracking',
  resources: 'Resource Allocation',
  funding: 'Funding & Grants',
  evaluation: 'Performance Evaluation',
  reports: 'Reports & Export',
  audit: 'Audit Logs',
  backup: 'Backup / Restore',
  users: 'User Management',
};

const MODULE_DESCRIPTIONS: Record<string, string> = {
  startups: 'Register and manage startup profiles',
  cohorts: 'Organize startups into program cohorts',
  mentorship: 'Schedule and track mentor sessions',
  milestones: 'Set goals and track progress',
  resources: 'Allocate equipment, space & tools',
  funding: 'Track grants, investments & loans',
  evaluation: 'Score and compare startup performance',
  reports: 'Generate reports and export data',
  audit: 'View system activity logs',
  backup: 'Backup and restore all data',
  users: 'Manage users, roles & permissions',
};

export default function Dashboard() {
  const { currentUser, currentRole, permissions, logout } = useAuth();
  const [activeModule, setActiveModule] = useState<string | null>(null);

  if (activeModule === 'users') {
    return <UserManagement onBack={() => setActiveModule(null)} />;
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">Incubator Management</h1>
            <p className="text-xs text-muted-foreground">
              {currentUser?.username} — {currentRole?.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Module Grid */}
      <main className="container mx-auto px-4 py-8">
        <h2 className="mb-6 text-xl font-semibold text-foreground">Your Modules</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {permissions
            .filter(p => p !== 'dashboard')
            .map((mod) => (
              <Card
                key={mod}
                className="group cursor-pointer border-border/60 transition-all duration-200 hover:border-primary/40 hover:shadow-md active:scale-[0.97]"
                onClick={() => setActiveModule(mod)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                      {MODULE_ICONS[mod]}
                    </div>
                    <CardTitle className="text-sm font-medium">
                      {MODULE_LABELS[mod] || mod}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {MODULE_DESCRIPTIONS[mod] || 'Click to open module'}
                  </p>
                </CardContent>
              </Card>
            ))}
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-border bg-card py-2 text-center">
        <p className="text-xs text-muted-foreground">
          Powered by <span className="font-semibold">Software Vala™</span>
        </p>
      </footer>
    </div>
  );
}
