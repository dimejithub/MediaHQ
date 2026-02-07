import { useAuth } from '@/App';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Login() {
  const { user, enableDemoMode, checkAuth } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check for session token in URL (from Google OAuth callback)
    const params = new URLSearchParams(window.location.search);
    const sessionToken = params.get('session_token');
    const errorParam = params.get('error');
    
    if (errorParam) {
      setError(errorParam);
      // Clear URL params
      window.history.replaceState({}, document.title, '/login');
      return;
    }
    
    if (sessionToken) {
      setLoading(true);
      // Store session token and check auth
      localStorage.setItem('session_token', sessionToken);
      
      // Clear onboarding for new OAuth login - they'll see onboarding first
      localStorage.removeItem('onboarding_complete');
      
      // Set session cookie via API
      fetch(`${BACKEND_URL}/api/auth/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_token: sessionToken }),
        credentials: 'include'
      }).then(() => {
        checkAuth();
        // Clear URL params
        window.history.replaceState({}, document.title, '/login');
        navigate('/onboarding');
      }).catch(err => {
        console.error('Session error:', err);
        setError('Failed to create session');
        setLoading(false);
      });
    }
  }, [checkAuth, navigate]);

  useEffect(() => {
    if (user) {
      // Check if onboarding is complete
      const onboardingComplete = localStorage.getItem('onboarding_complete') === 'true';
      navigate(onboardingComplete ? '/dashboard' : '/onboarding');
    }
  }, [user, navigate]);

  const handleGoogleLogin = () => {
    setLoading(true);
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${BACKEND_URL}/api/auth/google`;
  };

  const handleDemoMode = () => {
    enableDemoMode();
    // Check if onboarding is complete for demo mode
    const onboardingComplete = localStorage.getItem('onboarding_complete') === 'true';
    navigate(onboardingComplete ? '/dashboard' : '/onboarding');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 particles-bg overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl morph-bg"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl morph-bg" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-green-500/5 rounded-full blur-2xl animate-float"></div>
      </div>

      <div className="w-full max-w-md p-8 space-y-8 relative z-10">
        <div className="text-center animate-fadeInUp">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white to-slate-200 flex items-center justify-center text-slate-900 font-bold text-2xl shadow-2xl animate-float hover-scale">
              TEN
            </div>
            <div className="text-left">
              <span className="font-bold text-2xl text-white block gradient-text-shine">MediaHQ</span>
              <span className="text-sm text-slate-400">Church Media System</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 gradient-text">Welcome Back</h1>
          <p className="text-slate-400">Sign in to manage your media team operations</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4 animate-fadeInUp stagger-2">
          <button 
            onClick={handleGoogleLogin} 
            disabled={loading}
            data-testid="google-login-btn" 
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-slate-900 rounded-xl font-medium hover:bg-slate-100 transition-all shadow-lg hover-lift btn-animate group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Signing in...
              </span>
            ) : (
              <>
                <svg className="w-5 h-5 group-hover:animate-wiggle" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-950 text-slate-500">or</span>
            </div>
          </div>

          <button
            onClick={handleDemoMode}
            disabled={loading}
            data-testid="demo-mode-btn"
            className="w-full px-6 py-4 bg-gradient-to-r from-slate-800 to-slate-900 text-white border border-slate-700 rounded-xl font-medium hover:border-slate-600 transition-all btn-animate hover-glow group disabled:opacity-50"
          >
            <span className="flex items-center justify-center gap-2">
              <span className="text-xl group-hover:animate-bounce">🎮</span>
              Try Demo Mode
            </span>
          </button>
        </div>

        <p className="text-center text-sm text-slate-500 animate-fadeIn stagger-3">
          Demo mode lets you explore all features without signing in
        </p>
      </div>
    </div>
  );
}
