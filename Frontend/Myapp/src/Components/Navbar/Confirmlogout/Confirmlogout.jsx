import React from 'react'
import "./Confirmlogout.css";


function Confirmlogout({ onLogout, onCancel }) {
  return (
    <div className="logout-container">
      <div className="logout-card">
        <h2>Logging Out</h2>
        <p>Are you sure you want to end your session?</p>
        <div className="button-group">
        
          <button className="logout-button confirm" onClick={onLogout}>
            Yes, Log Out
          </button>
          <button className="logout-button cancel" onClick={onCancel}>
            Stay Logged In
          </button>
        </div>
      </div>
    </div>
  );
}

export default Confirmlogout;