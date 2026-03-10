import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // For PKCE flow: exchange the code from URL for a session
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        const errorParam = url.searchParams.get('error');
        const errorDescription = url.searchParams.get('error_description');

        if (errorParam) {
          throw new Error(errorDescription || errorParam);
        }

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        }

        // Wait for auth state to settle
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (session) {
          // Check if user has completed onboarding
          const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', session.user.id)
            .single();

          if (profile?.onboarding_completed) {
            localStorage.setItem('onboarding_complete', 'true');
            navigate('/dashboard', { replace: true });
          } else {
            navigate('/onboarding', { replace: true });
          }
        } else {
          // No session yet - wait for onAuthStateChange
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
              subscription.unsubscribe();
              const { data: profile } = await supabase
                .from('profiles')
                .select('onboarding_completed')
                .eq('id', session.user.id)
                .single();

              if (profile?.onboarding_completed) {
                localStorage.setItem('onboarding_complete', 'true');
                navigate('/dashboard', { replace: true });
              } else {
                navigate('/onboarding', { replace: true });
              }
            }
          });

          // Timeout fallback - if no auth event after 10s, redirect to login
          setTimeout(() => {
            subscription.unsubscribe();
            navigate('/login', { replace: true });
          }, 10000);
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err.message);
        setTimeout(() => navigate('/login', { replace: true }), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">{error}</div>
          <div className="text-slate-400">Redirecting to login...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-white to-slate-200 flex items-center justify-center text-slate-900 font-bold text-2xl animate-pulse">
          TEN
        </div>
        <div className="text-white text-xl mb-2">Signing you in...</div>
        <div className="text-slate-400 text-sm">Please wait</div>
      </div>
    </div>
  );
}
