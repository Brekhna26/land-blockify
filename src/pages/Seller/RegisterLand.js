// src/pages/Seller/RegisterLand.js
import React, { useState, useEffect } from "react";
import "./RegisterLand.css";

const RegisterLand = () => {
  const [formData, setFormData] = useState({
    propertyId: "",
    ownerName: "",
    location: "",
    landArea: "",
    propertyType: "Residential",
    legalDescription: "",
    document: null,
  });

  useEffect(() => {
  const email = localStorage.getItem("email") || "Unknown";
  setFormData(prev => ({ ...prev, ownerName: email }));
}, []);


  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "document") {
      setFormData({ ...formData, document: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };



const handleSubmit = async (e) => {
  e.preventDefault();
  const formPayload = new FormData();
  for (const key in formData) {
    formPayload.append(key, formData[key]);
  }

  try {
    const res = await fetch("http://localhost:3001/api/register-land", {
      method: "POST",
      body: formPayload,
    });

    const data = await res.json();
    if (res.ok) {
      alert("Land Registered Successfully!");
      // Optional: Clear form
      setFormData({
        propertyId: "",
        ownerName: formData.ownerName,
        location: "",
        landArea: "",
        propertyType: "Residential",
        legalDescription: "",
        document: null,
      });
    } else {
      alert("Registration Failed: " + data.error);
    }
  } catch (err) {
    console.error("Error submitting land:", err);
    alert("Something went wrong!");
  }
};



  return (
    <div className="register-land-container">
      <h2>Register New Land Property</h2>
      <form onSubmit={handleSubmit} className="land-form">
        <label>
          Property ID:
          <input type="text" name="propertyId" value={formData.propertyId} onChange={handleChange} required />
        </label>

        <label>
          Owner’s Full Name:
          <input type="text" name="ownerName" value={formData.ownerName} readOnly />
        </label>

        <label>
          Location / Address:
          <textarea name="location" value={formData.location} onChange={handleChange} required />
        </label>

        <label>
          Land Area:
          <input type="text" name="landArea" value={formData.landArea} onChange={handleChange} required />
        </label>

        <label>
          Property Type:
          <select name="propertyType" value={formData.propertyType} onChange={handleChange}>
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
            <option value="Agricultural">Agricultural</option>
          </select>
        </label>

        <label>
          Legal Description (Optional):
          <textarea name="legalDescription" value={formData.legalDescription} onChange={handleChange} />
        </label>

        <label>
          Supporting Document:
          <input type="file" name="document" accept=".pdf,.jpg,.png" onChange={handleChange} required />
        </label>

        <button type="submit">Submit for Registration</button>
      </form>
    </div>
  );
};

export default RegisterLand;
