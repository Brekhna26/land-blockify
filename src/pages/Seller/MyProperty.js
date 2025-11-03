import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './MyProperty.css';

export default function MyProperty({ ownerName }) {
  const [properties, setProperties] = useState([]);
  const [selected, setSelected] = useState(null);
  const detailRef = useRef(null);



  useEffect(() => {
  console.log("Fetching for owner:", ownerName);
  axios.get(`http://localhost:3001/api/seller/my-properties?ownerName=${encodeURIComponent(ownerName)}`)
    .then(res => setProperties(res.data))
    .catch(err => console.error("❌ Error fetching seller properties:", err));
}, [ownerName]);


  // ✅ Hide full-view on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (detailRef.current && !detailRef.current.contains(event.target)) {
        setSelected(null);
      }
    };

    if (selected) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selected]);

  return (
    <div className="my-property-container">
      <h2 className="my-property-title">My Registered Lands</h2>

      <table className="property-table">
        <thead>
          <tr>
            <th>Property ID</th>
            <th>Location</th>
            <th>Type</th>
            <th>Area</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((prop) => (
            <tr key={prop.id} className="property-row">
              <td>{prop.propertyId}</td>
              <td>{prop.location}</td>
              <td>{prop.propertyType}</td>
              <td>{prop.landArea}</td>
              <td>
                <span className={`status-badge ${prop.status}`}>{prop.status}</span>
              </td>
              <td>
                <button className="details-btn" onClick={() => setSelected(prop)}>View Details</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <div ref={detailRef} className="property-detail">
          <h3>Details for Property ID: {selected.propertyId}</h3>
          <p><strong>Owner:</strong> {selected.ownerName}</p>
          <p><strong>Location:</strong> {selected.location}</p>
          <p><strong>Type:</strong> {selected.propertyType}</p>
          <p><strong>Area:</strong> {selected.landArea}</p>
          <p><strong>Status:</strong> <span className={`status-badge ${selected.status}`}>{selected.status}</span></p>
          <p><strong>Legal Description:</strong> {selected.legalDescription || 'N/A'}</p>
          <a
            href={`http://localhost:3001${selected.documentPath}`}
            target="_blank"
            rel="noopener noreferrer"
            className="view-doc-link"
          >
            View Uploaded Document
          </a>
        </div>
      )}
    </div>
  );
}
