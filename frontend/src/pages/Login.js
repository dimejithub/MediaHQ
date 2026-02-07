import { useAuth } from '@/App';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Login() {
  const { user, enableDemoMode } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const isSubmitting = useRef(false);

  useEffect(() => {
    if (user) {
      const onboardingComplete = localStorage.getItem('onboarding_complete') === 'true';
      navigate(onboardingComplete ? '/dashboard' : '/onboarding');
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isSubmitting.current || loading) return;
    isSubmitting.current = true;
    
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase(), password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      // Store session token and user data
      localStorage.setItem('session_token', data.session_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Clear demo mode
      localStorage.removeItem('demoMode');
      localStorage.removeItem('demoRole');
      localStorage.removeItem('onboarding_complete');

      // Redirect
      window.location.href = '/onboarding';
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Network error - please try again');
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  const handleDemoMode = () => {
    enableDemoMode();
    const onboardingComplete = localStorage.getItem('onboarding_complete') === 'true';
    navigate(onboardingComplete ? '/dashboard' : '/onboarding');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 particles-bg overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl morph-bg"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl morph-bg" style={{animationDelay: '2s'}}></div>
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
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-slate-400">Sign in to manage your media team</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm animate-fadeIn">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 animate-fadeInUp stagger-2">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="firstname@tenmediahq.com"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              required
              disabled={loading}
              data-testid="email-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              required
              disabled={loading}
              data-testid="password-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            data-testid="login-btn"
            className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg hover-lift btn-animate disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

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
          className="w-full px-6 py-4 bg-gradient-to-r from-slate-800 to-slate-900 text-white border border-slate-700 rounded-xl font-medium hover:border-slate-600 transition-all btn-animate hover-glow group"
        >
          <span className="flex items-center justify-center gap-2">
            <span className="text-xl group-hover:animate-bounce">🎮</span>
            Try Demo Mode
          </span>
        </button>

        <div className="text-center text-sm text-slate-500 space-y-2 animate-fadeIn stagger-3">
          <p>Default credentials for team members:</p>
          <p className="text-slate-400 font-mono text-xs bg-slate-800/50 px-3 py-2 rounded-lg">
            Email: firstname@tenmediahq.com<br/>
            Password: Envoy@2026
          </p>
        </div>
      </div>
    </div>
  );
}
