import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { supabase } from '../lib/supabase';

export default function Onboarding() {
  const { user, profile, setProfile, demoMode } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [rosterMembers, setRosterMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchName, setSearchName] = useState('');

  useEffect(() => {
    const fetchRoster = async () => {
      if (demoMode) return;
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id, user_id, name, role, unit')
          .order('name');
        setRosterMembers(data || []);
      } catch (err) {
        console.error('Error fetching roster:', err);
      }
    };
    fetchRoster();
  }, [demoMode]);

  const toggleTeam = (teamId) => {
    setSelectedTeams(prev =>
      prev.includes(teamId) ? prev.filter(t => t !== teamId) : [...prev, teamId]
    );
  };

  const filteredRoster = rosterMembers.filter(m =>
    m.name?.toLowerCase().includes(searchName.toLowerCase())
  );

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
      title: "Find Yourself",
      subtitle: "Are you already on the team roster?",
      content: (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Search your name..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            data-testid="onboarding-name-search"
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <div className="max-h-48 overflow-y-auto space-y-2">
            {filteredRoster.map(member => (
              <button
                key={member.id}
                onClick={() => setSelectedMember(member)}
                data-testid={`roster-pick-${member.user_id}`}
                className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                  selectedMember?.id === member.id
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                }`}
              >
                <p className="text-white font-medium">{member.name}</p>
                <p className="text-slate-400 text-xs capitalize">{member.role?.replace(/_/g, ' ')} {member.unit ? `· ${member.unit}` : ''}</p>
              </button>
            ))}
          </div>
          <button
            onClick={() => setSelectedMember({ id: 'new', name: 'new_member' })}
            className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
              selectedMember?.id === 'new'
                ? 'border-green-500 bg-green-500/20'
                : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
            }`}
          >
            <p className="text-white font-medium">I'm new to the team</p>
            <p className="text-slate-400 text-xs">Set up a fresh profile</p>
          </button>
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
                <p className="text-slate-400 text-sm">Leicester Blessing · Sunday Service</p>
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
                <p className="text-slate-400 text-sm">The Commissioned Envoy</p>
              </div>
            </div>
          </button>
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
            {selectedMember && selectedMember.id !== 'new'
              ? `Welcome back, ${selectedMember.name}! Your profile has been linked.`
              : "You're ready to use TEN MediaHQ. Click below to enter your dashboard."}
          </p>
        </div>
      )
    }
  ];

  const canProceed = () => {
    if (currentStep === 1) return selectedMember !== null;
    if (currentStep === 2) return selectedTeams.length > 0;
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
          if (selectedMember && selectedMember.id !== 'new') {
            // Merge: update existing roster profile with auth user ID
            await supabase
              .from('profiles')
              .update({
                id: user.id,
                email: user.email,
                onboarding_completed: true,
                teams: selectedTeams.length > 0 ? selectedTeams : ['envoy_nation'],
                primary_team: selectedTeams[0] || 'envoy_nation'
              })
              .eq('id', selectedMember.id);

            // Update local profile state
            if (setProfile) {
              setProfile({
                ...selectedMember,
                id: user.id,
                email: user.email,
                onboarding_completed: true,
                teams: selectedTeams.length > 0 ? selectedTeams : ['envoy_nation'],
                primary_team: selectedTeams[0] || 'envoy_nation'
              });
            }
          } else {
            // New member
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
          <div className="text-slate-500 text-sm mb-2">
            Step {currentStep + 1} of {steps.length}
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {steps[currentStep].title}
          </h1>
          <p className="text-slate-400 mb-8">
            {steps[currentStep].subtitle}
          </p>
          <div className="mb-8">
            {steps[currentStep].content}
          </div>
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
              data-testid="onboarding-next-btn"
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all ${
                canProceed()
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              {currentStep === steps.length - 1 ? 'Enter Dashboard' : 'Continue'}
            </button>
          </div>
          {currentStep < steps.length - 1 && (
            <button
              onClick={handleSkip}
              className="w-full mt-4 text-slate-500 hover:text-slate-300 text-sm transition-all"
            >
              Skip intro
            </button>
          )}
        </div>
        <div className="text-center mt-6 opacity-50">
          <span className="text-white font-bold">TEN</span>
          <span className="text-slate-400 ml-1">MediaHQ</span>
        </div>
      </div>
    </div>
  );
}
