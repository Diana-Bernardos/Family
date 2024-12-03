import React from 'react';
import './Members.css';

const MembersList = ({ members, onDeleteMember, onSelectMember }) => {
  return (
    <div className="members-list">
      {members.map(member => (
        <div key={member.id} className="member-card">
          <img 
            src={member.photo_url || '/placeholder.png'} 
            alt={member.name}
            onClick={() => onSelectMember(member.id)}
          />
          <div className="member-info">
            <h3>{member.name}</h3>
            <div className="member-actions">
              <button onClick={() => onSelectMember(member.id)}>Ver</button>
              <button onClick={() => onDeleteMember(member.id)}>Eliminar</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MembersList;