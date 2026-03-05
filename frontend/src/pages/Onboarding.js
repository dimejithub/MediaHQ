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
  const [animating, setAnimating] = useState(false);

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
      icon: "⛪",
      content: (
        <div className="space-y-6 text-center">
          <div className="text-7xl animate-float">{String.fromCodePoint(0x26EA)}</div>
          <p className="text-lg text-slate-300 animate-fadeInUp stagger-2">
            Manage your media team, equipment, schedules, and more — all in one place.
          </p>
          <div className="flex justify-center gap-4 animate-fadeInUp stagger-3">
            <div className="glass-light rounded-xl px-4 py-3 text-center">
              <div className="text-2xl mb-1">👥</div>
              <div className="text-xs text-slate-400">Team</div>
            </div>
            <div className="glass-light rounded-xl px-4 py-3 text-center">
              <div className="text-2xl mb-1">📦</div>
              <div className="text-xs text-slate-400">Equipment</div>
            </div>
            <div className="glass-light rounded-xl px-4 py-3 text-center">
              <div className="text-2xl mb-1">📅</div>
              <div className="text-xs text-slate-400">Rotas</div>
            </div>
            <div className="glass-light rounded-xl px-4 py-3 text-center">
              <div className="text-2xl mb-1">✅</div>
              <div className="text-xs text-slate-400">Checklists</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Find Yourself",
      subtitle: "Are you already on the team roster?",
      icon: "🔍",
      content: (
        <div className="space-y-4">
          <div className="animate-fadeInUp stagger-1">
            <input
              type="text"
              placeholder="Search your name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              data-testid="onboarding-name-search"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>
          <div className="max-h-48 overflow-y-auto space-y-2 animate-fadeInUp stagger-2">
            {filteredRoster.map((member, idx) => (
              <button
                key={member.id}
                onClick={() => setSelectedMember(member)}
                data-testid={`roster-pick-${member.user_id}`}
                className={`w-full p-3 rounded-xl border-2 text-left transition-all hover-lift ${
                  selectedMember?.id === member.id
                    ? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/10'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                }`}
                style={{ animationDelay: `${idx * 0.03}s` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {member.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{member.name}</p>
                    <p className="text-slate-400 text-xs capitalize">{member.role?.replace(/_/g, ' ')} {member.unit ? `· ${member.unit}` : ''}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={() => setSelectedMember({ id: 'new', name: 'new_member' })}
            className={`w-full p-3 rounded-xl border-2 text-left transition-all hover-lift animate-fadeInUp stagger-3 ${
              selectedMember?.id === 'new'
                ? 'border-green-500 bg-green-500/20 shadow-lg shadow-green-500/10'
                : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-lg">+</div>
              <div>
                <p className="text-white font-medium text-sm">I'm new to the team</p>
                <p className="text-slate-400 text-xs">Set up a fresh profile</p>
              </div>
            </div>
          </button>
        </div>
      )
    },
    {
      title: "Select Your Team",
      subtitle: "Which team(s) are you part of?",
      icon: "🏠",
      content: (
        <div className="space-y-4">
          <button
            onClick={() => toggleTeam('envoy_nation')}
            className={`w-full p-5 rounded-xl border-2 transition-all text-left hover-lift card-animate animate-fadeInUp stagger-1 ${
              selectedTeams.includes('envoy_nation')
                ? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/10'
                : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-2xl shadow-lg">🔵</div>
              <div>
                <h3 className="text-white font-semibold text-lg">Envoy Nation</h3>
                <p className="text-slate-400 text-sm">Leicester Blessing · Sunday Service · Connected with PMO</p>
              </div>
              {selectedTeams.includes('envoy_nation') && (
                <div className="ml-auto text-blue-400 text-xl animate-scaleIn">✓</div>
              )}
            </div>
          </button>
          <button
            onClick={() => toggleTeam('e_nation')}
            className={`w-full p-5 rounded-xl border-2 transition-all text-left hover-lift card-animate animate-fadeInUp stagger-2 ${
              selectedTeams.includes('e_nation')
                ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/10'
                : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg">🟣</div>
              <div>
                <h3 className="text-white font-semibold text-lg">E-Nation (TCE)</h3>
                <p className="text-slate-400 text-sm">The Commissioned Envoy</p>
              </div>
              {selectedTeams.includes('e_nation') && (
                <div className="ml-auto text-purple-400 text-xl animate-scaleIn">✓</div>
              )}
            </div>
          </button>
        </div>
      )
    },
    {
      title: "Dashboard",
      subtitle: "Your personalized overview",
      icon: "📊",
      content: (
        <div className="space-y-6 text-center">
          <div className="text-7xl animate-float">📊</div>
          <p className="text-lg text-slate-300 animate-fadeInUp stagger-2">
            See upcoming services, team stats, and quick actions at a glance.
          </p>
          <div className="grid grid-cols-3 gap-3 animate-fadeInUp stagger-3">
            <div className="glass-light rounded-xl p-3"><div className="text-2xl font-bold text-white">23</div><div className="text-xs text-slate-400">Members</div></div>
            <div className="glass-light rounded-xl p-3"><div className="text-2xl font-bold text-white">3</div><div className="text-xs text-slate-400">Services</div></div>
            <div className="glass-light rounded-xl p-3"><div className="text-2xl font-bold text-white">4</div><div className="text-xs text-slate-400">Units</div></div>
          </div>
        </div>
      )
    },
    {
      title: "Equipment Tracking",
      subtitle: "Manage your media gear",
      icon: "📦",
      content: (
        <div className="space-y-6 text-center">
          <div className="text-7xl animate-float">📦</div>
          <p className="text-lg text-slate-300 animate-fadeInUp stagger-2">
            Check out equipment, track who has what, and manage your inventory.
          </p>
          <div className="flex justify-center gap-3 animate-fadeInUp stagger-3">
            <div className="glass-light rounded-xl px-4 py-2"><span className="text-xs text-green-400">Available</span></div>
            <div className="glass-light rounded-xl px-4 py-2"><span className="text-xs text-orange-400">Checked Out</span></div>
            <div className="glass-light rounded-xl px-4 py-2"><span className="text-xs text-red-400">Maintenance</span></div>
          </div>
        </div>
      )
    },
    {
      title: "Rotas & Scheduling",
      subtitle: "Know when you're serving",
      icon: "📅",
      content: (
        <div className="space-y-6 text-center">
          <div className="text-7xl animate-float">📅</div>
          <p className="text-lg text-slate-300 animate-fadeInUp stagger-2">
            View your assignments, accept or decline rotas, and plan ahead.
          </p>
          <div className="space-y-2 animate-fadeInUp stagger-3 text-left">
            {['PTZ Cam Op', 'Back Cam Op', 'Mixing Op', 'Photographer', 'Projection'].map((role, i) => (
              <div key={role} className="glass-light rounded-lg px-4 py-2 flex items-center gap-3" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-sm text-slate-300">{role}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "You're All Set!",
      subtitle: "Let's get started",
      icon: "🎉",
      content: (
        <div className="space-y-6 text-center">
          <div className="text-7xl animate-bounce">🎉</div>
          <p className="text-lg text-slate-300 animate-fadeInUp stagger-2">
            {selectedMember && selectedMember.id !== 'new'
              ? `Welcome back, ${selectedMember.name}! Your profile has been linked.`
              : "You're ready to use TEN MediaHQ. Click below to enter your dashboard."}
          </p>
          <div className="animate-fadeInUp stagger-3">
            <div className="inline-flex items-center gap-2 glass-light rounded-full px-6 py-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm text-green-400">All systems ready</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  const canProceed = () => {
    if (currentStep === 1) return selectedMember !== null;
    if (currentStep === 2) return selectedTeams.length > 0;
    return true;
  };

  const goToStep = (step) => {
    setAnimating(true);
    setTimeout(() => {
      setCurrentStep(step);
      setAnimating(false);
    }, 200);
  };

  const handleNext = async () => {
    if (!canProceed()) return;

    if (currentStep < steps.length - 1) {
      goToStep(currentStep + 1);
    } else {
      localStorage.setItem('onboarding_complete', 'true');
      localStorage.setItem('selected_teams', JSON.stringify(selectedTeams));

      if (user && !demoMode) {
        try {
          if (selectedMember && selectedMember.id !== 'new') {
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

            if (setProfile) {
              setProfile({
                ...selectedMember,
                id: user.id,
                email: user.email,
                onboarding_completed: true,
                teams: selectedTeams,
                primary_team: selectedTeams[0] || 'envoy_nation'
              });
            }
          } else {
            await supabase
              .from('profiles')
              .update({
                onboarding_completed: true,
                teams: selectedTeams.length > 0 ? selectedTeams : ['envoy_nation'],
                primary_team: selectedTeams[0] || 'envoy_nation'
              })
              .eq('id', user.id);

            if (setProfile && profile) {
              setProfile({ ...profile, onboarding_completed: true, teams: selectedTeams, primary_team: selectedTeams[0] || 'envoy_nation' });
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
        await supabase.from('profiles').update({ onboarding_completed: true }).eq('id', user.id);
      } catch (err) {
        console.log('Could not save onboarding to database:', err);
      }
    }
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 particles-bg">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                idx <= currentStep
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-sm shadow-blue-500/50'
                  : 'bg-slate-700/50'
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div className={`glass rounded-2xl p-8 shadow-2xl transition-all duration-300 ${animating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          {/* Step indicator */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 text-sm font-medium">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-2xl">{steps[currentStep].icon}</span>
          </div>

          {/* Title with gradient */}
          <h1 className="text-3xl font-bold gradient-text mb-2 animate-fadeIn">
            {steps[currentStep].title}
          </h1>
          <p className="text-slate-400 mb-8 animate-fadeInUp stagger-1">
            {steps[currentStep].subtitle}
          </p>

          {/* Content */}
          <div className="mb-8" key={currentStep}>
            {steps[currentStep].content}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={() => goToStep(currentStep - 1)}
                className="px-6 py-3.5 bg-slate-800/80 text-slate-300 rounded-xl hover:bg-slate-700 transition-all btn-animate border border-slate-700"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              data-testid="onboarding-next-btn"
              className={`flex-1 px-6 py-3.5 rounded-xl font-medium transition-all shadow-lg ${
                canProceed()
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 btn-animate btn-gradient shadow-blue-500/25'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              {currentStep === steps.length - 1 ? 'Enter Dashboard ✨' : 'Continue →'}
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
        <div className="text-center mt-6 opacity-50 animate-fadeInUp" style={{animationDelay: '0.5s'}}>
          <span className="text-white font-bold text-lg">TEN</span>
          <span className="text-slate-400 ml-1">MediaHQ</span>
        </div>
      </div>
    </div>
  );
}
