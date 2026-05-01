import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Link kept for Sign up link below
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowLeft, Mail, Lock, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    setLoading(true);
    const { error: authError } = await login(email, password);
    setLoading(false);
    if (authError) {
      setError(authError);
      return;
    }
    navigate('/app', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-center p-6 sm:p-12 min-h-screen">
        <div className="w-full max-w-sm">
          <Button
            variant="ghost"
            size="sm"
            className="mb-6 -ml-3 text-muted-foreground"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to home
          </Button>

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 h-12 w-12 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                <span className="text-primary-foreground font-bold text-lg">S</span>
              </div>
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>Sign in with your Stevens email to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@stevens.edu"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="pl-9"
                      autoFocus
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="pl-9"
                      disabled={loading}
                    />
                  </div>
                </div>
                {error && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />{error}
                  </p>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              <p className="text-center text-xs text-muted-foreground mt-6">
                Don&apos;t have an account?{' '}
                <Link to="/signup" className="text-primary font-medium hover:underline">Sign up</Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
