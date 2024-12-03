import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { events } from '../../services/api';
import './Calendar.css';

const FamilyCalendar = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [calendarEvents, setCalendarEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      const response = await events.getFamilyEvents();
      setCalendarEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const daysInMonth = () => {
    const firstDay = currentDate.startOf('month').day();
    const totalDays = currentDate.daysInMonth();
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= totalDays; day++) {
      const date = currentDate.date(day);
      const dayEvents = calendarEvents.filter(event => 
        dayjs(event.date).format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
      );

      days.push(
        <div key={day} className={`calendar-day ${dayEvents.length ? 'has-events' : ''}`}>
          <span className="day-number">{day}</span>
          <div className="day-events">
            {dayEvents.map(event => (
              <div 
                key={event.id} 
                className="event-item"
                style={{ backgroundColor: event.color || '#007bff' }}
              >
                {event.title}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button onClick={() => setCurrentDate(prev => prev.subtract(1, 'month'))}>
          ←
        </button>
        <h2>{currentDate.format('MMMM YYYY')}</h2>
        <button onClick={() => setCurrentDate(prev => prev.add(1, 'month'))}>
          →
        </button>
      </div>
      <div className="calendar-weekdays">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
          <div key={day} className="weekday">{day}</div>
        ))}
      </div>
      <div className="calendar-grid">
        {daysInMonth()}
      </div>
    </div>
  );
};

export default FamilyCalendar;