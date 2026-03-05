import { useState } from 'react';
import { useAuth } from '../App';
import { supabase } from '../lib/supabase';

export default function Onboarding() {
  const { user, profile, setProfile, demoMode } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTeams, setSelectedTeams] = useState([]);

  const toggleTeam = (teamId) => {
    setSelectedTeams(prev => 
      prev.includes(teamId) 
        ? prev.filter(t => t !== teamId)
        : [...prev, teamId]
    );
  };

  const steps = [
    {
      title: "Welcome to TEN MediaHQ",
      subtitle: "Your church media command center",
      content: (
        <div className="space-y-6 text-center">
          <div className="text-6xl">⛪</div>
          <p className="text-lg text-slate-300">
            Manage your media team, equipment, schedules, and more - all in one place.
          </p>
        </div>
      )
    },
    {
      title: "Select Your Team",
      subtitle: "Which team(s) are you part of?",
      content: (
        <div className="space-y-4">
          <button
            onClick={() => toggleTeam('envoy_nation')}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
              selectedTeams.includes('envoy_nation')
                ? 'border-blue-500 bg-blue-500/20'
                : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔵</span>
              <div>
                <h3 className="text-white font-semibold">Envoy Nation</h3>
                <p className="text-slate-400 text-sm">Sunday Services • 11:00 AM</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => toggleTeam('e_nation')}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
              selectedTeams.includes('e_nation')
                ? 'border-purple-500 bg-purple-500/20'
                : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🟣</span>
              <div>
                <h3 className="text-white font-semibold">E-Nation (TCE)</h3>
                <p className="text-slate-400 text-sm">The Commissioned Envoy • 2:00 PM</p>
              </div>
            </div>
          </button>
        </div>
      )
    },
    {
      title: "Dashboard",
      subtitle: "Your personalized overview",
      content: (
        <div className="space-y-6 text-center">
          <div className="text-6xl">📊</div>
          <p className="text-lg text-slate-300">
            See upcoming services, team stats, and quick actions at a glance.
          </p>
        </div>
      )
    },
    {
      title: "Equipment Tracking",
      subtitle: "Manage your media gear",
      content: (
        <div className="space-y-6 text-center">
          <div className="text-6xl">📦</div>
          <p className="text-lg text-slate-300">
            Check out equipment, track who has what, and manage your inventory.
          </p>
        </div>
      )
    },
    {
      title: "Rotas & Scheduling",
      subtitle: "Know when you're serving",
      content: (
        <div className="space-y-6 text-center">
          <div className="text-6xl">📅</div>
          <p className="text-lg text-slate-300">
            View your assignments, accept or decline rotas, and plan ahead.
          </p>
        </div>
      )
    },
    {
      title: "You're All Set!",
      subtitle: "Let's get started",
      content: (
        <div className="space-y-6 text-center">
          <div className="text-6xl">🎉</div>
          <p className="text-lg text-slate-300">
            You're ready to use TEN MediaHQ. Click below to enter your dashboard.
          </p>
        </div>
      )
    }
  ];

  const canProceed = () => {
    if (currentStep === 1) {
      return selectedTeams.length > 0;
    }
    return true;
  };

  const handleNext = async () => {
    if (!canProceed()) return;
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem('onboarding_complete', 'true');
      localStorage.setItem('selected_teams', JSON.stringify(selectedTeams));
      
      if (user && !demoMode) {
        try {
          await supabase
            .from('profiles')
            .update({ 
              onboarding_completed: true,
              teams: selectedTeams.length > 0 ? selectedTeams : ['envoy_nation'],
              primary_team: selectedTeams[0] || 'envoy_nation'
            })
            .eq('id', user.id);
          
          if (setProfile && profile) {
            setProfile({
              ...profile,
              onboarding_completed: true,
              teams: selectedTeams.length > 0 ? selectedTeams : ['envoy_nation'],
              primary_team: selectedTeams[0] || 'envoy_nation'
            });
          }
        } catch (err) {
          console.log('Could not save onboarding to database:', err);
        }
      }
      
      window.location.href = '/dashboard';
    }
  };

  const handleSkip = async () => {
    localStorage.setItem('onboarding_complete', 'true');
    
    if (user && !demoMode) {
      try {
        await supabase
          .from('profiles')
          .update({ onboarding_completed: true })
          .eq('id', user.id);
      } catch (err) {
        console.log('Could not save onboarding to database:', err);
      }
    }
    
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 flex-1 rounded-full transition-all ${
                idx <= currentStep ? 'bg-blue-500' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-8">
          {/* Step indicator */}
          <div className="text-slate-500 text-sm mb-2">
            Step {currentStep + 1} of {steps.length}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-2">
            {steps[currentStep].title}
          </h1>
          <p className="text-slate-400 mb-8">
            {steps[currentStep].subtitle}
          </p>

          {/* Content */}
          <div className="mb-8">
            {steps[currentStep].content}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-3 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-all"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all ${
                canProceed()
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              {currentStep === steps.length - 1 ? 'Enter Dashboard' : 'Continue'}
            </button>
          </div>

          {/* Skip */}
          {currentStep < steps.length - 1 && (
            <button
              onClick={handleSkip}
              className="w-full mt-4 text-slate-500 hover:text-slate-300 text-sm transition-all"
            >
              Skip intro →
            </button>
          )}
        </div>

        {/* Logo */}
        <div className="text-center mt-6 opacity-50">
          <span className="text-white font-bold">TEN</span>
          <span className="text-slate-400 ml-1">MediaHQ</span>
        </div>
      </div>
    </div>
  );
}
