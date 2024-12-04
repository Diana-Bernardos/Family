

import React from 'react';
import './MembersList.css';

const MembersList = ({ members, onDeleteMember, onSelectMember }) => {
  return (
    <div className="members-container">
      <h2 className="members-title">Miembros</h2>
      <div className="members-grid">
        {members.map(member => (
          <div key={member.id} className="member-photo-wrapper">
            <div className="photo-container">
              <img 
                src={member.photo_url || '/placeholder.png'} 
                alt={member.name} 
                className="member-photo" 
                onClick={() => onSelectMember(member.id)}
              />
              <button 
                className="delete-button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`¿Estás seguro de eliminar a ${member.name}?`)) {
                    onDeleteMember(member.id);
                  }
                }}
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
            <span className="member-name">{member.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MembersList;