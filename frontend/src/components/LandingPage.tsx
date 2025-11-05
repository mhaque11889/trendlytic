import React from 'react';

export function LandingPage({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-yellow-400 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                  <polyline points="16 7 22 7 22 13"></polyline>
                </svg>
              </div>
              <span className="text-2xl font-bold text-gray-900">Trendlytic</span>
            </div>
            <button onClick={onLogin} className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg hover-scale">
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-pink-50 via-yellow-50 to-white">
        {/* Background Images */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-yellow-500/10 to-transparent"></div>
          <img
            src="https://images.unsplash.com/photo-1762279389002-7b6abd7bd6c6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwxfHxuZXR3b3JrJTIwZ3JhcGh8ZW58MHx8fHwxNzYyMzUwOTY1fDA&ixlib=rb-4.1.0&q=85"
            alt="Network graph"
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full mb-8 border border-pink-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
              <path d="M5 3v4"></path>
              <path d="M19 17v4"></path>
              <path d="M3 5h4"></path>
              <path d="M17 19h4"></path>
            </svg>
            <span className="text-sm font-medium text-gray-700">Research Trends Analysis Platform</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            <span className="gradient-text">Discover Hidden Patterns</span>
            <br />
            <span className="text-gray-900">in Research Trends</span>
          </h1>

          <div className="max-w-4xl mx-auto mb-12">
            <p className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-4">
              A comprehensive <strong className="text-pink-600">Trend Analysis module</strong> for Trendlytic that identifies patterns, emerging topics, and declining research areas by analyzing keyword frequency over time across academic papers.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button onClick={onLogin} className="btn-primary text-white px-8 py-4 text-lg rounded-lg inline-flex items-center gap-2">
              Get Started
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
            <button className="btn-outline bg-transparent px-8 py-4 text-lg rounded-lg">
              View Demo
            </button>
          </div>

          {/* Floating Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-pink-200 hover:border-pink-400 hover-scale">
              <div className="text-4xl font-bold text-pink-600 mb-2">10K+</div>
              <div className="text-gray-600">Research Papers Analyzed</div>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-yellow-200 hover:border-yellow-400 hover-scale">
              <div className="text-4xl font-bold text-yellow-600 mb-2">500+</div>
              <div className="text-gray-600">Trend Clusters Identified</div>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-pink-200 hover:border-pink-400 hover-scale">
              <div className="text-4xl font-bold text-pink-600 mb-2">95%</div>
              <div className="text-gray-600">Accuracy in Pattern Detection</div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-yellow-400/20 rounded-full blur-3xl animate-pulse"></div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-gray-900">Powerful </span>
              <span className="gradient-text">Modules</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to analyze research trends, discover patterns, and gain insights from academic literature.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="feature-card border-2 border-pink-200 hover:border-pink-400 rounded-xl p-6 cursor-pointer">
              <div className="icon-wrapper w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <line x1="10" y1="9" x2="8" y2="9"></line>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900">Paper Import & Analysis</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Seamlessly import research papers from CSV/XLSX formats. Extract authors, keywords, and metadata automatically.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="feature-card border-2 border-yellow-200 hover:border-yellow-400 rounded-xl p-6 cursor-pointer">
              <div className="icon-wrapper w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"></path>
                  <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900">Keyword Extraction</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Advanced NLP algorithms identify and extract key themes and topics from academic papers with high precision.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="feature-card border-2 border-pink-200 hover:border-pink-400 rounded-xl p-6 cursor-pointer">
              <div className="icon-wrapper w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <rect x="7" y="7" width="3" height="9"></rect>
                  <rect x="14" y="7" width="3" height="5"></rect>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900">Thematic Clustering</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Group related research papers into meaningful clusters based on shared topics and emerging trends.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="feature-card border-2 border-yellow-200 hover:border-yellow-400 rounded-xl p-6 cursor-pointer">
              <div className="icon-wrapper w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900">Connectivity Graphs</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Visualize relationships between research topics and authors through interactive network graphs.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="feature-card border-2 border-pink-200 hover:border-pink-400 rounded-xl p-6 cursor-pointer">
              <div className="icon-wrapper w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                  <polyline points="16 7 22 7 22 13"></polyline>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900">Trend Analysis</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Identify patterns, emerging topics, and declining research areas by analyzing keyword frequency over time.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="feature-card border-2 border-yellow-200 hover:border-yellow-400 rounded-xl p-6 cursor-pointer">
              <div className="icon-wrapper w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="20" x2="12" y2="10"></line>
                  <line x1="18" y1="20" x2="18" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="16"></line>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900">Interactive Visualizations</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Explore data through dynamic charts, graphs, and knowledge maps powered by vis-network technology.
              </p>
            </div>
          </div>

          {/* Additional Info Section */}
          <div className="mt-20 bg-gradient-to-br from-pink-50 to-yellow-50 rounded-3xl p-12 border-2 border-pink-200">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-3xl font-bold mb-4 text-gray-900">
                Built for Researchers, By Researchers
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                Trendlytic combines cutting-edge technology with academic research expertise. Our TypeScript monorepo architecture ensures reliability, while MongoDB provides scalable data storage. Interactive visualizations powered by vis-network make complex data accessible and actionable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 gap-12 mb-12">
            {/* Brand Section */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-yellow-400 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                    <polyline points="16 7 22 7 22 13"></polyline>
                  </svg>
                </div>
                <span className="text-2xl font-bold text-white">Trendlytic</span>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6 max-w-md">
                A comprehensive research trends analysis platform that helps you discover patterns, emerging topics, and insights from academic literature.
              </p>
              <div className="flex gap-4">
                <a href="#" className="social-icon w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </a>
                <a href="#" className="social-icon w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                    <path d="M9 18c-4.51 2-5-2-7-2"></path>
                  </svg>
                </a>
                <a href="#" className="social-icon w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                © 2025 Trendlytic. All rights reserved.
              </p>
              <div className="flex gap-6 text-sm">
                <a href="#" className="hover:text-pink-400 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-pink-400 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-pink-400 transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .hover-scale:hover {
          transform: scale(1.05);
        }

        .hover-scale {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .gradient-text {
          background: linear-gradient(to right, #ec4899, #f59e0b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .btn-primary {
          background: linear-gradient(to right, #ec4899, #db2777);
          transition: all 0.3s ease;
        }

        .btn-primary:hover {
          background: linear-gradient(to right, #db2777, #be185d);
          transform: scale(1.05);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .btn-outline {
          border: 2px solid #ec4899;
          color: #ec4899;
          transition: all 0.3s ease;
        }

        .btn-outline:hover {
          background-color: #fdf2f8;
          transform: scale(1.05);
        }

        .feature-card {
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          transform: scale(1.05);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .icon-wrapper {
          transition: transform 0.3s ease;
        }

        .feature-card:hover .icon-wrapper {
          transform: scale(1.1);
        }

        .backdrop-blur {
          backdrop-filter: blur(12px);
        }

        .social-icon {
          transition: all 0.3s ease;
        }

        .social-icon:hover {
          background-color: #ec4899 !important;
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}