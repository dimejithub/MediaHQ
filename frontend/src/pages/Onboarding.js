import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/App';

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTeams, setSelectedTeams] = useState([]);

  const toggleTeam = (teamId) => {
    setSelectedTeams(prev => 
      prev.includes(teamId) 
        ? prev.filter(t => t !== teamId)
        : [...prev, teamId]
    );
  };

  const TeamSelectionContent = () => (
    <div className="space-y-6">
      <div className="text-6xl animate-float">👥</div>
      <p className="text-lg text-slate-300 leading-relaxed">
        Which team(s) are you volunteering for? Select all that apply.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {/* Envoy Nation Team */}
        <button
          onClick={() => toggleTeam('envoy_nation')}
          className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
            selectedTeams.includes('envoy_nation')
              ? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/20'
              : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
              selectedTeams.includes('envoy_nation') ? 'bg-blue-500' : 'bg-slate-700'
            }`}>
              🔵
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Envoy Nation</h3>
              <p className="text-slate-400 text-sm">Sunday Services</p>
            </div>
          </div>
          <p className="text-slate-400 text-sm">
            The main church media team serving Sunday morning worship services at 11:00 AM.
          </p>
          {selectedTeams.includes('envoy_nation') && (
            <div className="mt-3 flex items-center gap-2 text-blue-400 text-sm">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Selected
            </div>
          )}
        </button>

        {/* The Commissioned Envoy Team */}
        <button
          onClick={() => toggleTeam('e_nation')}
          className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
            selectedTeams.includes('e_nation')
              ? 'border-green-500 bg-green-500/20 shadow-lg shadow-green-500/20'
              : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
              selectedTeams.includes('e_nation') ? 'bg-green-500' : 'bg-slate-700'
            }`}>
              🟢
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">The Commissioned Envoy</h3>
              <p className="text-slate-400 text-sm">Sunday Afternoon</p>
            </div>
          </div>
          <p className="text-slate-400 text-sm">
            E-Nation media team serving The Commissioned Envoy service at 2:00 PM on Sundays.
          </p>
          {selectedTeams.includes('e_nation') && (
            <div className="mt-3 flex items-center gap-2 text-green-400 text-sm">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Selected
            </div>
          )}
        </button>
      </div>

      {selectedTeams.length === 2 && (
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-xl border border-blue-500/20">
          <p className="text-slate-300 text-sm text-center">
            🙏 <span className="font-semibold">Amazing!</span> Thank you for serving both teams. Your dedication is truly appreciated!
          </p>
        </div>
      )}

      {selectedTeams.length === 0 && (
        <p className="text-slate-500 text-sm text-center mt-4">
          Please select at least one team to continue
        </p>
      )}
    </div>
  );

  const steps = [
    {
      title: "Welcome to TEN MediaHQ",
      subtitle: "The Envoy Nation Media Hub",
      content: (
        <div className="space-y-6">
          <div className="text-6xl animate-float">🎬</div>
          <p className="text-lg text-slate-300 leading-relaxed">
            You are part of something extraordinary. TEN Media exists to capture, preserve, and share 
            the moments where heaven touches earth in our services.
          </p>
          <p className="text-slate-400">
            Every camera angle you choose, every sound you balance, every graphic you display - 
            it all contributes to spreading the Gospel beyond our four walls.
          </p>
        </div>
      )
    },
    {
      title: "Choose Your Team",
      subtitle: "Where will you serve?",
      content: <TeamSelectionContent />,
      requiresSelection: true
    },
    {
      title: "Your Sacrifice Matters",
      subtitle: "More than you know",
      content: (
        <div className="space-y-6">
          <div className="text-6xl animate-float">💎</div>
          <p className="text-lg text-slate-300 leading-relaxed">
            While others worship, you serve. While others sit, you stand. While others rest, you work.
            This is not just volunteering - this is <span className="text-blue-400 font-semibold">kingdom service</span>.
          </p>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-slate-800/50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-blue-400">1000+</p>
              <p className="text-xs text-slate-400">Lives reached weekly</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-purple-400">50+</p>
              <p className="text-xs text-slate-400">Countries watching</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-green-400">∞</p>
              <p className="text-xs text-slate-400">Eternal impact</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Excellence is Our Standard",
      subtitle: "Not perfection, but dedication",
      content: (
        <div className="space-y-6">
          <div className="text-6xl animate-float">🏆</div>
          <p className="text-lg text-slate-300 leading-relaxed">
            We don't serve because we're the best at what we do. We become the best because of 
            <span className="text-amber-400 font-semibold"> Who we serve</span>.
          </p>
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-500/20">
            <p className="text-slate-300 italic text-lg">
              "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters"
            </p>
            <p className="text-slate-500 text-sm mt-2">— Colossians 3:23</p>
          </div>
        </div>
      )
    },
    {
      title: "Our Commitments",
      subtitle: "What we promise to each other",
      content: (
        <div className="space-y-4">
          <div className="text-5xl animate-float">🤝</div>
          <div className="space-y-3 text-left max-w-md mx-auto">
            {[
              { icon: "✋", text: "Attend Tuesday standups - they keep us unified" },
              { icon: "🎯", text: "Arrive 30 minutes before service starts" },
              { icon: "📱", text: "Respond to rota assignments within 24 hours" },
              { icon: "🔧", text: "Report equipment issues immediately" },
              { icon: "📖", text: "Complete assigned training modules" },
              { icon: "🙏", text: "Support and cover for each other" },
              { icon: "⭐", text: "Give our best, every single time" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg hover-lift animate-fadeInUp" style={{animationDelay: `${idx * 0.1}s`}}>
                <span className="text-xl">{item.icon}</span>
                <span className="text-slate-300 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "Ready to Serve?",
      subtitle: user?.name ? `Let's go, ${user.name.split(' ')[0]}!` : "Let's go!",
      content: (
        <div className="space-y-6">
          <div className="text-6xl animate-bounce">🚀</div>
          <p className="text-lg text-slate-300 leading-relaxed">
            You are now part of the TEN Media family. Your sacrifice, your time, your talent - 
            it all matters. Welcome to the team!
          </p>
          
          {/* Show selected teams */}
          <div className="flex justify-center gap-3">
            {selectedTeams.includes('envoy_nation') && (
              <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium border border-blue-500/30">
                🔵 Envoy Nation
              </span>
            )}
            {selectedTeams.includes('e_nation') && (
              <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm font-medium border border-green-500/30">
                🟢 The Commissioned Envoy
              </span>
            )}
          </div>
          
          <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-6 border border-green-500/30">
            <p className="text-white font-semibold text-lg mb-2">Your Mission:</p>
            <p className="text-slate-300">
              Capture moments that change lives. Broadcast hope to the nations. 
              Serve with excellence. Be the hands and feet of this commission.
            </p>
          </div>
        </div>
      )
    }
  ];

  const canProceed = () => {
    const step = steps[currentStep];
    if (step.requiresSelection) {
      return selectedTeams.length > 0;
    }
    return true;
  };

  const handleNext = () => {
    if (!canProceed()) return;
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save team selection and mark onboarding complete
      localStorage.setItem('onboarding_complete', 'true');
      localStorage.setItem('selected_teams', JSON.stringify(selectedTeams));
      navigate('/dashboard');
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_complete', 'true');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 particles-bg overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl morph-bg"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl morph-bg" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-green-500/5 rounded-full blur-2xl animate-float"></div>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                idx <= currentStep ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Content Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-8 border border-slate-800 shadow-2xl animate-scaleIn">
          <div className="text-center space-y-4 mb-8">
            <p className="text-sm text-blue-400 uppercase tracking-wider font-medium">
              Step {currentStep + 1} of {steps.length}
            </p>
            <h1 className="text-3xl font-bold text-white gradient-text-shine">
              {steps[currentStep].title}
            </h1>
            <p className="text-slate-400">{steps[currentStep].subtitle}</p>
          </div>

          <div className="text-center py-6 min-h-[300px] flex items-center justify-center">
            <div className="animate-fadeIn w-full" key={currentStep}>
              {steps[currentStep].content}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800">
            <button
              onClick={handleSkip}
              className="text-slate-500 hover:text-slate-300 transition-colors text-sm"
            >
              Skip intro
            </button>
            
            <div className="flex gap-3">
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-6 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`px-8 py-2.5 rounded-lg font-medium transition-all btn-animate hover-lift ${
                  canProceed()
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
                    : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                }`}
              >
                {currentStep === steps.length - 1 ? "Enter Dashboard" : "Continue"}
              </button>
            </div>
          </div>
        </div>

        {/* TEN Logo */}
        <div className="text-center mt-8 opacity-50">
          <span className="text-white font-bold">TEN</span>
          <span className="text-slate-400 ml-1">MediaHQ</span>
        </div>
      </div>
    </div>
  );
}
