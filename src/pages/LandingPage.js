import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/PageStyles.css';
import landImage from '../assets/land.jpg';
import logoImage from '../assets/dashlogo.png';
const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
 <nav className="navbar">
  <div className="logo-section">
    <img src={logoImage} alt="LandBlockify Logo" className="logo-img" />
  </div>
  <button className="login-button" onClick={() => navigate('/create-account')}>
    Login / Sign Up
  </button>
</nav>

      <div className="hero-section">
        <h1>Secure & Transparent Land Registry</h1>
        <p className="hero-description">
          LandBlockify leverages modern technology to provide a trustworthy
          platform for land registration, ownership tracking, and transaction
          management.
        </p>
        <button className="get-started-button" onClick={() => navigate('/create-account')}>
          Get Started
        </button>
      </div>

      <div className="image-section">
        <img src={landImage} alt="Land" className="land-image" />
      </div>

      {/* Why Choose Section */}
      <section className="why-choose-section">
        <h2 className="why-heading">Why Choose LandBlockify?</h2>
        <div className="cards-container">
          <div className="feature-card">
            <i className="fa-solid fa-shield-halved feature-icon"></i>
            <h3>Enhanced Security</h3>
            <p>
              Robust security measures to protect your valuable land data and prevent fraud.
            </p>
          </div>
          <div className="feature-card">
            <i className="fa-solid fa-house feature-icon"></i>
            <h3>Streamlined Processes</h3>
            <p>
              Simplified registration and transaction workflows for efficiency and ease of use.
            </p>
          </div>
          <div className="feature-card">
            <i className="fa-solid fa-circle-check feature-icon"></i>
            <h3>Verified Transactions</h3>
            <p>
              Transparent and auditable transaction logs, approved by authorized entities.
            </p>
          </div>
        </div>
      </section>
           

      {/* Footer Section */}
      <footer className="footer-section">
        <p>© 2025 LandBlockify. All rights reserved.</p>
        <p className="footer-subtext">Innovating Land Management</p>
      </footer>
    </div>

      
   
  );
};

export default LandingPage;
