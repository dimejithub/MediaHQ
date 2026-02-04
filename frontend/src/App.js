import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import '@/App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Simple Login Page
function Login() {
  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  const handleGoogleLogin = () => {
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background" data-testid="login-page">
      <div className="w-full max-w-md p-8 space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-accent-foreground font-heading font-bold text-xl">
              TEN
            </div>
            <span className="font-heading font-bold text-2xl">MediaHQ</span>
          </div>
          <h1 className="text-3xl font-heading font-bold tracking-tight mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to manage your media team operations</p>
        </div>

        <button
          onClick={handleGoogleLogin}
          data-testid="google-login-btn"
          className="w-full flex items-center justify-center gap-3 px-6 py-3 border border-input bg-card hover:bg-secondary rounded-md font-medium transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        <p className="text-center text-sm text-muted-foreground">Secure authentication powered by Emergent</p>
      </div>
    </div>
  );
}

// Simple Dashboard
function Dashboard() {
  return (
    <div className="min-h-screen bg-background p-8" data-testid="dashboard-page">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-heading font-bold mb-4">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to TEN MediaHQ</p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 bg-card border rounded-lg">
            <h3 className="font-semibold mb-2">Team Members</h3>
            <p className="text-3xl font-bold">Loading...</p>
          </div>
          <div className="p-6 bg-card border rounded-lg">
            <h3 className="font-semibold mb-2">Services</h3>
            <p className="text-3xl font-bold">Loading...</p>
          </div>
          <div className="p-6 bg-card border rounded-lg">
            <h3 className="font-semibold mb-2">Equipment</h3>
            <p className="text-3xl font-bold">Loading...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Login />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;