import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  FaMapMarkerAlt, FaUser, FaHome,
  FaRulerCombined, FaCalendarAlt, FaFileAlt
} from 'react-icons/fa';
import './Marketplace.css'; // Same CSS file use karo

export default function AdminMarketplace() {
  const [properties, setProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:3001/api/marketplace/admin-lands")
      .then(res => setProperties(res.data))
      .catch(err => console.error("❌ Error fetching properties:", err));
  }, []);

  const filteredProperties = properties.filter((prop) => {
    const term = searchTerm.toLowerCase();
    return (
      prop.location?.toLowerCase().includes(term) ||
      prop.ownerName?.toLowerCase().includes(term) ||
      prop.propertyType?.toLowerCase().includes(term)
    );
  });

  // ======= SINGLE PROPERTY FULL-VIEW =======
  if (selectedProperty) {
    return (
      <div className="land-marketplace">
        <button className="back-btn" onClick={() => setSelectedProperty(null)}>← Back to Marketplace</button>
        <div className="property-full-detail">
          <img
            src={`http://localhost:3001${selectedProperty.documentPath}`}
            alt="property"
            className="property-full-img"
          />
          <div className="property-full-content">
            <h2>Property ID: {selectedProperty.propertyId}</h2>
            <p><FaMapMarkerAlt /> <strong>Location:</strong> {selectedProperty.location}</p>
            <p><FaUser /> <strong>Owner:</strong> {selectedProperty.ownerName}</p>
            <p><FaHome /> <strong>Type:</strong> {selectedProperty.propertyType}</p>
            <p><FaRulerCombined /> <strong>Area:</strong> {selectedProperty.landArea}</p>
            <p><FaCalendarAlt /> <strong>Registered:</strong> {new Date(selectedProperty.created_at).toLocaleDateString()}</p>
            <p><FaCalendarAlt /> <strong>Status:</strong> <span className={`badge ${selectedProperty.status}`}>{selectedProperty.status}</span></p>
            <p><strong>Legal Description:</strong><br /> {selectedProperty.legalDescription || 'N/A'}</p>
            <a
              href={`http://localhost:3001${selectedProperty.documentPath}`}
              target="_blank"
              rel="noopener noreferrer"
              className="view-doc-link"
            >
              <FaFileAlt /> View Uploaded Document
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ======= MAIN LISTING VIEW =======
  return (
    <div className="land-marketplace">
      <div className="header">
        <h1>Admin Marketplace</h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by location, owner or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button>Filters</button>
        </div>
      </div>

      {filteredProperties.length === 0 ? (
        <p>No matching lands found.</p>
      ) : (
        <div className="property-list">
          {filteredProperties.map((prop) => (
            <div key={prop.id} className="property-card">
              <img src={`http://localhost:3001${prop.documentPath}`} alt="property" />
              <div className="card-content">
                <h3>Property ID: {prop.propertyId}</h3>
                <p><FaMapMarkerAlt /> {prop.location}</p>
                <p><FaUser /> <strong>Owner:</strong> {prop.ownerName}</p>
                <p><FaHome /> <strong>Type:</strong> {prop.propertyType}</p>
                <p><FaRulerCombined /> <strong>Area:</strong> {prop.landArea}</p>
                <p><FaCalendarAlt /> <strong>Registered:</strong> {new Date(prop.created_at).toLocaleDateString()}</p>
                <p><FaCalendarAlt /> <strong>Status:</strong> <span className={`badge ${prop.status}`}>{prop.status}</span></p>
              </div>
              <button className="details-btn" onClick={() => setSelectedProperty(prop)}>
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
