import React from 'react';
import './MembersList.css';

const MembersList = ({ members, onDeleteMember, onSelectMember }) => {
  return (
    <div className="members-container">
      <h2 className="members-title">Miembros</h2>
      <div className="members-scroll">
        {members.map(member => (
          <div 
            key={member.id}
            className="member-card"
            onClick={() => onSelectMember(member.id)}
          >
            <div className="member-photo-container">
              <img 
                src={member.photo_url || '/placeholder.png'} 
                alt={member.name} 
                className="member-photo"
              />
            </div>
            <h3 className="member-name">{member.name}</h3>
            <button 
              className="delete-member"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteMember(member.id);
              }}
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MembersList;