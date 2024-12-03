
import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { events } from '../../services/api';
import AddEventModal from './AddEventModal';
import './Calendar.css';

const MemberCalendar = ({ memberId }) => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [memberEvents, setMemberEvents] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    if (memberId) {
      fetchMemberEvents();
    }
  }, [memberId]);

  const fetchMemberEvents = async () => {
    try {
      const response = await events.getMemberEvents(memberId);
      setMemberEvents(response.data);
    } catch (error) {
      console.error('Error fetching member events:', error);
    }
  };

  const handleAddEvent = async (eventData) => {
    try {
      await events.create({ ...eventData, member_id: memberId });
      fetchMemberEvents();
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      try {
        await events.delete(eventId);
        fetchMemberEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const renderCalendar = () => {
    const startOfMonth = currentDate.startOf('month');
    const daysInMonth = currentDate.daysInMonth();
    const startDay = startOfMonth.day();

    const calendarDays = [];
    
    // Add empty days at start
    for (let i = 0; i < startDay; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Add month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = currentDate.date(day);
      const dayEvents = memberEvents.filter(event => 
        dayjs(event.date).format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
      );

      calendarDays.push(
        <div key={day} className="calendar-day" onClick={() => {
          setSelectedDate(date);
          setIsAddModalOpen(true);
        }}>
          <span className="day-number">{day}</span>
          <div className="day-events">
            {dayEvents.map(event => (
              <div 
                key={event.id} 
                className="event-item"
                style={{ backgroundColor: event.color || '#007bff' }}
              >
                <span>{event.title}</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteEvent(event.id);
                  }}
                  className="delete-event"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return calendarDays;
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={() => setCurrentDate(currentDate.subtract(1, 'month'))}>
          &lt;
        </button>
        <h2>{currentDate.format('MMMM YYYY')}</h2>
        <button onClick={() => setCurrentDate(currentDate.add(1, 'month'))}>
          &gt;
        </button>
      </div>

      <div className="calendar-weekdays">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
          <div key={day} className="weekday">{day}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {renderCalendar()}
      </div>

      <AddEventModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddEvent}
        selectedDate={selectedDate}
      />
    </div>
  );
};
export default MemberCalendar;