import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Sparkles } from 'lucide-react';
import { PageWrapper } from '@/components/PageWrapper';
import { useAuth } from '@/context/AuthContext';

type AuthMode = 'login' | 'signup' | 'reset';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Authentication failed. Please try again.';
}

export function AuthPage() {
  const { configured, loading, user, signIn, signUp, sendPasswordReset } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = location.state as { from?: { pathname?: string } } | null;
  const destination = routeState?.from?.pathname ?? '/profile';
  const [mode, setMode] = useState<AuthMode>(searchParams.get('mode') === 'reset' ? 'reset' : 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (loading) return <PageWrapper><div className="min-h-[50vh] bg-ivory" /></PageWrapper>;
  if (user) return <Navigate to={destination} replace />;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setBusy(true);
    try {
      if (mode === 'signup') {
        const result = await signUp(email, password, name);
        if (result.needsEmailConfirmation) {
          setMessage('Check your email to confirm your Lumera account before signing in.');
        } else {
          navigate(destination, { replace: true });
        }
      } else if (mode === 'reset') {
        await sendPasswordReset(email);
        setMessage('If an account exists for this email, a password reset link has been sent.');
      } else {
        await signIn(email, password);
        navigate(destination, { replace: true });
      }
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setBusy(false);
    }
  };

  const changeMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError('');
    setMessage('');
  };

  return (
    <PageWrapper>
      <section className="account-auth-page">
        <div className="account-auth-card">
          <Link to="/" className="account-auth-back"><ArrowLeft size={15} /> Back to Lumera</Link>
          <span className="account-eyebrow"><Sparkles size={13} /> YOUR LUMERA</span>
          <h1>
            {mode === 'signup' ? 'Make yourself at home.' : mode === 'reset' ? 'A fresh start.' : 'Welcome back.'}
          </h1>
          <p className="account-auth-intro">
            {mode === 'signup'
              ? 'Create an account to keep your collection and studio work connected.'
              : mode === 'reset'
                ? 'We’ll send a secure link to reset your password.'
                : 'Sign in to continue to your Lumera account.'}
          </p>

          {!configured ? (
            <div className="account-auth-notice" role="status">
              Supabase is not configured yet. Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your local environment, then apply the database migration.
            </div>
          ) : (
            <form className="account-auth-form" onSubmit={(event) => void submit(event)}>
              {mode === 'signup' && (
                <label>
                  <span>Name</span>
                  <input required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} />
                </label>
              )}
              <label>
                <span>Email</span>
                <span className="account-auth-input"><Mail size={16} /><input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></span>
              </label>
              {mode !== 'reset' && (
                <label>
                  <span>Password</span>
                  <span className="account-auth-input"><LockKeyhole size={16} /><input required type={showPassword ? 'text' : 'password'} minLength={8} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} /><button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></span>
                  {mode === 'signup' && <small>Use at least 8 characters.</small>}
                </label>
              )}
              {error && <p className="account-auth-error" role="alert">{error}</p>}
              {message && <p className="account-auth-success" role="status">{message}</p>}
              <button className="account-auth-submit" type="submit" disabled={busy}>
                {busy ? 'Please wait…' : mode === 'signup' ? 'Create Account' : mode === 'reset' ? 'Send Reset Link' : 'Sign In'}
                {!busy && <ArrowRight size={16} />}
              </button>
            </form>
          )}

          {configured && (
            <div className="account-auth-switches">
              {mode === 'login' ? (
                <>
                  <button type="button" onClick={() => changeMode('signup')}>Create an account</button>
                  <button type="button" onClick={() => changeMode('reset')}>Forgot password?</button>
                </>
              ) : (
                <button type="button" onClick={() => changeMode('login')}>Return to sign in</button>
              )}
            </div>
          )}
        </div>
      </section>
    </PageWrapper>
  );
}
