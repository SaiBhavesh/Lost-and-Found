import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
    if (!email.endsWith('@stevens.edu')) {
      setError('Please use your @stevens.edu email address.');
      return;
    }
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
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left: gradient panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-primary via-rose-700 to-amber-700 text-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-10 right-0 h-80 w-80 rounded-full bg-amber-300/30 blur-3xl" />
        </div>
        <Link to="/" className="relative flex items-center gap-2 text-sm hover:opacity-80 transition-opacity">
          <div className="h-8 w-8 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
            <span className="font-bold">S</span>
          </div>
          <span className="font-semibold">Stevens Lost &amp; Found</span>
        </Link>
        <div className="relative">
          <p className="text-3xl font-semibold leading-tight mb-4">
            &ldquo;Found my laptop within two hours of posting. This app is a lifesaver.&rdquo;
          </p>
          <p className="text-sm text-white/80">— Maria G., SSE &apos;26</p>
        </div>
        <div className="relative text-xs text-white/70">
          © {new Date().getFullYear()} Stevens Institute of Technology
        </div>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
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
