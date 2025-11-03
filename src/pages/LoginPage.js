// ✅ All imports must be here at the top
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';
import logo from '../assets/logo.png';

function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        // ✅ Save to localStorage for future use
        localStorage.setItem("token", data.token);
        localStorage.setItem("email", data.email); // Add this
        localStorage.setItem("role", data.role);

        alert('✅ Login successful!');
        switch (data.role) {
          case 'Admin':
            navigate('/admin-dashboard');
            break;
          case 'Seller':
            navigate('/seller-dashboard');
            break;
          case 'Buyer':
            navigate('/buyer-dashboard');
            break;
          case 'Government Authority':
            navigate('/gov-dashboard');
            break;
          default:
            alert('Unknown role');
        }
      } else {
        alert('❌ ' + data.error);
      }
    } catch (error) {
      alert('❌ Backend error. Check console.');
      console.error(error);
    }
  };

  return (
    <div className="login-container">
      <div className="form-card">
        <div className="logo-inside-card">
          <img src={logo} alt="Logo" className="logo-img" />
        </div>
        <h2>Login</h2>
        <p>Access your LandBlockify account</p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Login</button>
        </form>
      </div>

      <div className="footer-text">© 2025 LandBlockify. Secure and Transparent.</div>
    </div>
  );
}

export default LoginPage;
