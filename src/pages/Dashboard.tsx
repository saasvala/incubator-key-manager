import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Users, Rocket, Target, Calendar, DollarSign, Package, BarChart3, FileText, Shield, Database } from 'lucide-react';

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

export default function Dashboard() {
  const { currentUser, currentRole, permissions, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-lg font-bold text-foreground">Incubator Management</h1>
            <p className="text-xs text-muted-foreground">
              {currentUser?.username} — {currentRole?.name}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Module Grid */}
      <main className="container mx-auto px-4 py-8">
        <h2 className="mb-6 text-xl font-semibold text-foreground">Your Modules</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {permissions
            .filter(p => p !== 'dashboard')
            .map((mod) => (
              <Card key={mod} className="cursor-pointer border-border/50 transition-colors hover:border-primary/30 hover:bg-accent/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {MODULE_ICONS[mod]}
                    </div>
                    <CardTitle className="text-sm font-medium">
                      {MODULE_LABELS[mod] || mod}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Click to open module
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
