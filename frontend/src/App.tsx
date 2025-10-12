import './App.css'

function App() {
  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="nav">
            <div className="logo">Grounded Conversations</div>
            <nav className="nav-links">
              <a href="#features">Features</a>
              <a href="#how-it-works">How it Works</a>
              <a href="#contact">Contact</a>
            </nav>
            <div className="auth-buttons">
              <button className="btn-login">Sign In</button>
              <button className="btn-register">Get Started</button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-main">
            <div className="hero-content">
              <h1 className="hero-title">Grounded Conversations</h1>
              <p className="hero-subtitle">
                AI-powered mental health chatbot providing 24/7 support 
                based on DSM-5 standards
              </p>
              <button className="btn-cta">
                <span className="btn-icon">💬</span>
                Start Consulting Now
              </button>
              
              <div className="hero-stats">
                <div className="stat">
                  <div className="stat-number">10K+</div>
                  <div className="stat-label">Happy Users</div>
                </div>
                <div className="stat">
                  <div className="stat-number">24/7</div>
                  <div className="stat-label">Available</div>
                </div>
                <div className="stat">
                  <div className="stat-number">100%</div>
                  <div className="stat-label">Confidential</div>
                </div>
              </div>
            </div>
            
            <div className="hero-visual">
              <div className="chat-preview">
                <div className="chat-header">
                  <div className="chat-avatar">🤖</div>
                  <div className="chat-info">
                    <div className="chat-name">AI Therapist</div>
                    <div className="chat-status">● Online</div>
                  </div>
                </div>
                <div className="chat-messages">
                  <div className="message ai-message">
                    <div className="message-avatar">🤖</div>
                    <div className="message-content">
                      Hello! I'm here to provide you with professional mental health support. How are you feeling today?
                    </div>
                  </div>
                  <div className="message user-message">
                    <div className="message-content">
                      I've been feeling anxious lately and having trouble sleeping.
                    </div>
                    <div className="message-avatar">👤</div>
                  </div>
                  <div className="message ai-message">
                    <div className="message-avatar">🤖</div>
                    <div className="message-content">
                      I understand. Anxiety can indeed affect your sleep patterns. Let's explore some techniques that might help...
                    </div>
                  </div>
                </div>
                <div className="chat-input">
                  <input type="text" placeholder="Type your message..." />
                  <button>Send</button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="hero-features">
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>DSM-5 Standards</h3>
              <p>Based on international diagnostic guidelines</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⏰</div>
              <h3>24/7 Support</h3>
              <p>Always available when you need us</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Complete Privacy</h3>
              <p>Your information is absolutely secure</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="features" className="why-choose">
        <div className="container">
          <h2 className="section-title">Why Choose Grounded Conversations?</h2>
          <p className="section-subtitle">The most advanced AI mental health counseling solution available today</p>
          
          <div className="features-grid">
            <div className="feature-box">
              <div className="feature-box-icon">🧠</div>
              <h3>Smart AI</h3>
              <p>Advanced AI technology that understands and analyzes psychology</p>
            </div>
            <div className="feature-box">
              <div className="feature-box-icon">👤</div>
              <h3>Personal Counseling</h3>
              <p>Personalized advice tailored to each individual</p>
            </div>
            <div className="feature-box highlighted">
              <div className="feature-box-icon">🔐</div>
              <h3>Safe & Private</h3>
              <p>Data is encrypted and completely secure</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          
          <div className="steps">
            <div className="step">
              <div className="step-number">01</div>
              <h3>Start the Conversation</h3>
              <p>Share your feelings and concerns with us</p>
            </div>
            <div className="step">
              <div className="step-number">02</div>
              <h3>AI Analysis & Understanding</h3>
              <p>System analyzes based on DSM-5 standards</p>
            </div>
            <div className="step">
              <div className="step-number">03</div>
              <h3>Receive Personal Advice</h3>
              <p>Get counseling tailored to your situation</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mental Health Section */}
      <section className="mental-health">
        <div className="container">
          <div className="mental-health-content">
            <div className="mental-health-text">
              <h2>Mental Health Matters</h2>
              <p>
                Grounded Conversations helps you take care of your mental 
                health in a scientific and effective way.
              </p>
              <ul className="benefits-list">
                <li>✅ Science-based counseling approach</li>
                <li>✅ Unlimited 24/7 support</li>
                <li>✅ Complete information security</li>
              </ul>
            </div>
            <div className="mental-health-image">
              <div className="placeholder-image">
                📚 Peaceful Learning Space
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Start Your Mental Health Journey?</h2>
          <p>
            Let Grounded Conversations accompany you on your path to 
            better mental health and wellbeing.
          </p>
          <button className="btn-cta">
            <span className="btn-icon">💬</span>
            Start Free Consultation
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>Grounded Conversations</h3>
              <p>
                Smart AI mental health chatbot providing 24/7 mental health 
                support based on DSM-5 and WHO standards.
              </p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Links</h4>
                <ul>
                  <li><a href="#features">Features</a></li>
                  <li><a href="#how-it-works">How it Works</a></li>
                  <li><a href="#contact">Contact</a></li>
                </ul>
              </div>
              <div className="footer-column">
                <h4>Support</h4>
                <ul>
                  <li><a href="#help">Help Center</a></li>
                  <li><a href="#contact">Contact</a></li>
                  <li><a href="#privacy">Privacy Policy</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2024 Grounded Conversations. All rights reserved.</p>
            <p>Powered by Readdy</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
