import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/App';

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to TEN Media",
      subtitle: "The Envoy Nation Media Commission",
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
      title: "You Are The Commission",
      subtitle: "Envoy Nation depends on you",
      content: (
        <div className="space-y-6">
          <div className="text-6xl animate-float">🌍</div>
          <p className="text-lg text-slate-300 leading-relaxed">
            The Envoy Nation is commissioned to take the Gospel to the ends of the earth. 
            <span className="text-green-400 font-semibold"> You make that possible</span>.
          </p>
          <p className="text-slate-400">
            Every time you show up for a Tuesday standup, every Sunday you operate the camera, 
            every service you manage the livestream - you are fulfilling the Great Commission.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-6">
            <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">Photographers</span>
            <span className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium">Videographers</span>
            <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">Sound Engineers</span>
            <span className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-full text-sm font-medium">Projectionists</span>
            <span className="px-4 py-2 bg-pink-500/20 text-pink-400 rounded-full text-sm font-medium">Livestream Operators</span>
            <span className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-full text-sm font-medium">Editors</span>
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

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Mark onboarding as complete and navigate to dashboard
      localStorage.setItem('onboarding_complete', 'true');
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
            <div className="animate-fadeIn" key={currentStep}>
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
                className="px-8 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all btn-animate hover-lift"
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
