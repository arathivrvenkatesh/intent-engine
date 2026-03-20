import { useState, useEffect } from "react";
import { getEvents, deleteEvent } from "../services/localStore";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function CalendarView({ refreshTrigger }) {
  const [events, setEvents] = useState([]);
  const [today] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setEvents(getEvents());
  }, [refreshTrigger]);

  const handleDelete = (id) => {
    deleteEvent(id);
    setEvents(getEvents());
  };

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const calendarDays = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({ day: daysInPrevMonth - i, currentMonth: false });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const isToday = i === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
    const hasEvent = events.some(e => {
      if (e.reminderTime) {
        const d = new Date(e.reminderTime);
        return d.getDate() === i && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }
      return false;
    });
    calendarDays.push({ day: i, currentMonth: true, isToday, hasEvent });
  }

  const remaining = 42 - calendarDays.length;
  for (let i = 1; i <= remaining; i++) {
    calendarDays.push({ day: i, currentMonth: false });
  }

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const selectedEvents = selectedDate
    ? events.filter(e => {
        if (e.reminderTime) {
          const d = new Date(e.reminderTime);
          return d.getDate() === selectedDate.day && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        }
        return false;
      })
    : [];

  const CalendarGrid = () => (
    <div style={{ background: "white", borderRadius: "20px", border: "1px solid #FFD4C2", overflow: "hidden", boxShadow: "0 2px 12px rgba(255,160,122,0.1)" }}>
      {/* Header */}
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #FFE8DC" }}>
        <button onClick={prevMonth} style={{ width: "36px", height: "36px", borderRadius: "10px", border: "1px solid #FFD4C2", background: "#FFF5F0", cursor: "pointer", fontSize: "20px", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFA07A" }}>‹</button>
        <div style={{ textAlign: "center" }}>
          <h3 style={{ fontFamily: "'Syne'", fontSize: "18px", fontWeight: 800, color: "#3D1A0A" }}>{MONTHS[currentMonth]}</h3>
          <p style={{ fontSize: "12px", color: "#C4826A" }}>{currentYear}</p>
        </div>
        <button onClick={nextMonth} style={{ width: "36px", height: "36px", borderRadius: "10px", border: "1px solid #FFD4C2", background: "#FFF5F0", cursor: "pointer", fontSize: "20px", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFA07A" }}>›</button>
      </div>

      {/* Day names */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", padding: "10px 12px 0" }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: "10px", fontWeight: 700, color: "#C4826A", padding: "6px 0", fontFamily: "'JetBrains Mono'" }}>{d}</div>
        ))}
      </div>

      {/* Days */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", padding: "0 12px 12px", gap: "2px" }}>
        {calendarDays.map((d, i) => (
          <div
            key={i}
            onClick={() => d.currentMonth && setSelectedDate(d)}
            style={{
              aspectRatio: "1", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              borderRadius: "8px", cursor: d.currentMonth ? "pointer" : "default",
              background: d.isToday
                ? "linear-gradient(135deg, #FFA07A, #FF6B35)"
                : selectedDate?.day === d.day && d.currentMonth
                ? "#FFF0EB" : "transparent",
              border: selectedDate?.day === d.day && d.currentMonth && !d.isToday
                ? "1px solid #FFA07A" : "1px solid transparent",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { if (d.currentMonth && !d.isToday) e.currentTarget.style.background = "#FFF5F0"; }}
            onMouseLeave={(e) => { if (d.currentMonth && !d.isToday && selectedDate?.day !== d.day) e.currentTarget.style.background = "transparent"; }}
          >
            <span style={{ fontSize: isMobile ? "11px" : "13px", fontWeight: d.isToday ? 700 : d.currentMonth ? 500 : 400, color: d.isToday ? "white" : d.currentMonth ? "#3D1A0A" : "#E8C4B8" }}>
              {d.day}
            </span>
            {d.hasEvent && d.currentMonth && (
              <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: d.isToday ? "white" : "#FFA07A", marginTop: "1px" }} />
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ padding: "10px 20px", borderTop: "1px solid #FFE8DC", display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "linear-gradient(135deg, #FFA07A, #FF6B35)" }} />
          <span style={{ fontSize: "11px", color: "#C4826A" }}>Today</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#FFA07A" }} />
          <span style={{ fontSize: "11px", color: "#C4826A" }}>Has event</span>
        </div>
      </div>
    </div>
  );

  const EventsSidebar = () => (
    <div>
      {selectedDate ? (
        <div>
          <h3 style={{ fontFamily: "'Syne'", fontSize: "15px", fontWeight: 800, color: "#3D1A0A", marginBottom: "12px" }}>
            {MONTHS[currentMonth]} {selectedDate.day}, {currentYear}
          </h3>
          {selectedEvents.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {selectedEvents.map(event => (
                <div key={event.id} style={{ background: "white", borderRadius: "14px", border: "1px solid #FFD4C2", padding: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: "#3D1A0A", marginBottom: "6px" }}>{event.title}</p>
                    <button onClick={() => handleDelete(event.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#E8B4A0", fontSize: "14px" }}
                      onMouseEnter={(e) => e.currentTarget.style.color = "#ef4444"}
                      onMouseLeave={(e) => e.currentTarget.style.color = "#E8B4A0"}
                    >✕</button>
                  </div>
                  {event.time && <p style={{ fontSize: "11px", color: "#C4826A", marginBottom: "3px" }}>⏰ {event.time}</p>}
                  {event.location && <p style={{ fontSize: "11px", color: "#C4826A", marginBottom: "3px" }}>📍 {event.location}</p>}
                  {event.reminderEmail && (
                    <div style={{ marginTop: "8px", padding: "6px 10px", borderRadius: "8px", background: "#FFF5F0", border: "1px solid #FFD4C2" }}>
                      <p style={{ fontSize: "10px", color: "#FFA07A", fontWeight: 600 }}>🔔 {event.reminderEmail}</p>
                      <p style={{ fontSize: "10px", color: "#C4826A" }}>📅 {new Date(event.reminderTime).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "24px", background: "white", borderRadius: "14px", border: "1px solid #FFD4C2" }}>
              <p style={{ fontSize: "13px", color: "#C4826A" }}>No events on this day</p>
            </div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "32px 16px", background: "white", borderRadius: "14px", border: "1px solid #FFD4C2" }}>
          <div style={{ fontSize: "28px", marginBottom: "8px" }}>📅</div>
          <p style={{ fontSize: "13px", fontWeight: 600, color: "#3D1A0A", marginBottom: "4px" }}>Select a date</p>
          <p style={{ fontSize: "12px", color: "#C4826A" }}>Tap any date to see events</p>
        </div>
      )}

      {events.length > 0 && (
        <div style={{ marginTop: "16px" }}>
          <p style={{ fontSize: "11px", color: "#C4826A", fontFamily: "'JetBrains Mono'", letterSpacing: "0.08em", fontWeight: 600, marginBottom: "10px" }}>
            ALL EVENTS ({events.length})
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {events.map(event => (
              <div key={event.id} style={{ background: "white", borderRadius: "12px", border: "1px solid #FFD4C2", padding: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: "12px", fontWeight: 600, color: "#3D1A0A" }}>{event.title}</p>
                  <p style={{ fontSize: "11px", color: "#C4826A" }}>
                    {event.reminderTime ? new Date(event.reminderTime).toLocaleDateString() : event.date}
                    {event.time && ` · ${event.time}`}
                  </p>
                </div>
                <button onClick={() => handleDelete(event.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#E8B4A0", fontSize: "14px" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#ef4444"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "#E8B4A0"}
                >✕</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div>
      {isMobile ? (
        // Mobile: stack vertically
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <CalendarGrid />
          <EventsSidebar />
        </div>
      ) : (
        // Desktop: side by side
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "20px", alignItems: "start" }}>
          <CalendarGrid />
          <EventsSidebar />
        </div>
      )}
    </div>
  );
}