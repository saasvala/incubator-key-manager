import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { validateLicenseKey, storeLicense, seedRoles, setAppState } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { KeyRound, ShieldAlert } from 'lucide-react';

export default function LicenseKeyScreen() {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setPhase } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const valid = await validateLicenseKey(key);
      if (!valid) {
        setError('Invalid license key. Access denied.');
        setLoading(false);
        return;
      }

      await storeLicense(key);
      await seedRoles();
      await setAppState({ licenseValid: true });
      setPhase('setup');
    } catch (err) {
      setError('Activation failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute right-4 top-4"><ThemeToggle /></div>
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <KeyRound className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Incubator Management System
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your license key to activate
          </p>
        </div>

        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">License Activation</CardTitle>
            <CardDescription>
              A valid license key is required to access this system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="font-mono text-center tracking-widest"
                  autoFocus
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={!key.trim() || loading}>
                {loading ? 'Validating...' : 'Activate License'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Powered by <span className="font-semibold">Software Vala™</span>
        </p>
      </div>
    </div>
  );
}
