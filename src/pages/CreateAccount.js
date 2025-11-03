import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/CreateAccount.css';
import logo from '../assets/logo.png';

function CreateAccount() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3001/api/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert('✅ Account created successfully!');
        navigate('/login');
      } else {
        alert('❌ Failed: ' + data.error);
      }
    } catch (err) {
      alert('❌ Error connecting to backend');
      console.error(err);
    }
  };

  return (
    <div className="create-account-container">
      <div className="form-card">
        <div className="logo-inside-card">
          <img src={logo} alt="Logo" className="logo-img" />
        </div>

        <h2>Create an Account</h2>
        <p>Join Landblockify to manage your land assets securely.</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
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
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="">Select Role</option>
            <option value="Buyer">Buyer</option>
            <option value="Seller">Seller</option>
            <option value="Admin">Admin</option>
            <option value="Government Authority">Government Authority</option>
          </select>

          <button type="submit">Create Account</button>
        </form>

        <div className="login-link">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>

      <div className="footer-text">
        © 2025 LandBlockify. Secure and Transparent.
      </div>
    </div>
  );
}

export default CreateAccount;
