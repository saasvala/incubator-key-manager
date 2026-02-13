import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LicenseKeyScreen from "@/pages/LicenseKeyScreen";
import SuperAdminSetup from "@/pages/SuperAdminSetup";
import LoginScreen from "@/pages/LoginScreen";
import Dashboard from "@/pages/Dashboard";

const queryClient = new QueryClient();

function AppRouter() {
  const { phase } = useAuth();

  if (phase === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 mx-auto animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Initializing system...</p>
        </div>
      </div>
    );
  }

  switch (phase) {
    case 'license':
      return <LicenseKeyScreen />;
    case 'setup':
      return <SuperAdminSetup />;
    case 'login':
      return <LoginScreen />;
    case 'app':
      return <Dashboard />;
    default:
      return <LicenseKeyScreen />;
  }
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
