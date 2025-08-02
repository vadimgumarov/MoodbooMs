import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  getDate
} from 'date-fns';
import { 
  calculateCurrentDay, 
  getFertilityLevel,
  getCurrentPhase 
} from '../../utils/cycleCalculations';
import { useMode } from '../../core/contexts/SimpleModeContext';

const Calendar = ({ cycleStartDate, cycleLength = 28, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [focusedDate, setFocusedDate] = useState(null);
  const today = new Date();
  const { isKingMode } = useMode();
  const calendarRef = useRef(null);

  // Navigation handlers
  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  }, [currentMonth]);

  // Get fertility color for a specific date
  const getFertilityColor = (date) => {
    if (!cycleStartDate) return 'bg-surface';
    
    const cycleDay = calculateCurrentDay(cycleStartDate, date, cycleLength);
    const fertilityLevel = getFertilityLevel(cycleDay, cycleLength);
    const phase = getCurrentPhase(cycleDay, cycleLength);

    // Color mapping based on fertility level and phase
    if (phase === 'menstrual') return 'bg-error text-white';
    
    switch (fertilityLevel) {
      case 'very-low':
        return 'bg-error/80 text-white';
      case 'low':
        return 'bg-warning/30';
      case 'medium':
        return 'bg-surface';
      case 'high':
        return 'bg-success/30';
      case 'very-high':
        return 'bg-success text-white';
      default:
        return 'bg-surface';
    }
  };

  // Handler for Today button
  const goToToday = () => {
    setCurrentMonth(new Date());
    setFocusedDate(today);
    // Clear any selected date by calling onDateSelect with null
    if (onDateSelect) {
      onDateSelect(null);
    }
  };

  // Keyboard navigation handlers
  const handleKeyDown = useCallback((e) => {
    if (!focusedDate) return;

    let newFocusedDate = new Date(focusedDate);
    let monthChanged = false;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        newFocusedDate = addDays(focusedDate, -1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        newFocusedDate = addDays(focusedDate, 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        newFocusedDate = addDays(focusedDate, -7);
        break;
      case 'ArrowDown':
        e.preventDefault();
        newFocusedDate = addDays(focusedDate, 7);
        break;
      case 'Home':
        e.preventDefault();
        newFocusedDate = startOfMonth(currentMonth);
        break;
      case 'End':
        e.preventDefault();
        newFocusedDate = endOfMonth(currentMonth);
        break;
      case 'PageUp':
        e.preventDefault();
        if (e.shiftKey) {
          // Shift+PageUp = previous year
          newFocusedDate = addMonths(focusedDate, -12);
        } else {
          // PageUp = previous month
          newFocusedDate = subMonths(focusedDate, 1);
        }
        monthChanged = true;
        break;
      case 'PageDown':
        e.preventDefault();
        if (e.shiftKey) {
          // Shift+PageDown = next year
          newFocusedDate = addMonths(focusedDate, 12);
        } else {
          // PageDown = next month
          newFocusedDate = addMonths(focusedDate, 1);
        }
        monthChanged = true;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (onDateSelect && isSameMonth(focusedDate, currentMonth)) {
          onDateSelect(focusedDate);
        }
        return;
      case 'Escape':
        e.preventDefault();
        setFocusedDate(null);
        if (onDateSelect) {
          onDateSelect(null);
        }
        return;
      default:
        return;
    }

    // Update focused date
    setFocusedDate(newFocusedDate);

    // Change month if necessary
    if (monthChanged || !isSameMonth(newFocusedDate, currentMonth)) {
      setCurrentMonth(startOfMonth(newFocusedDate));
    }
  }, [focusedDate, currentMonth, onDateSelect]);

  // Focus management
  useEffect(() => {
    const calendar = calendarRef.current;
    if (!calendar) return;

    calendar.addEventListener('keydown', handleKeyDown);
    
    return () => {
      calendar.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Set initial focus when calendar mounts
  useEffect(() => {
    if (!focusedDate) {
      setFocusedDate(today);
    }
  }, [today, focusedDate]);

  return (
    <div className="p-4">
      {/* Calendar Header with integrated Today button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-2 py-1 text-tiny bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
            aria-label="Go to today"
          >
            Today
          </button>
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-surface rounded-full transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
        
        <h2 className="text-base font-medium">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-surface rounded-full transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-tiny font-medium text-text-secondary py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div 
        ref={calendarRef}
        className="grid grid-cols-7 gap-1"
        role="grid"
        aria-label="Calendar"
        tabIndex={0}
      >
        {calendarDays.map((day, index) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, today);
          const isFocused = focusedDate && isSameDay(day, focusedDate);
          const cycleDay = cycleStartDate ? 
            calculateCurrentDay(cycleStartDate, day, cycleLength) : null;
          const fertilityColor = getFertilityColor(day);

          return (
            <button
              key={index}
              onClick={() => onDateSelect && onDateSelect(day)}
              onFocus={() => setFocusedDate(day)}
              className={`
                relative p-2 h-14 rounded-lg transition-all flex flex-col items-center justify-center
                ${isCurrentMonth ? '' : 'opacity-40'}
                ${isToday ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                ${isFocused ? 'ring-2 ring-primary ring-offset-2 z-10' : ''}
                ${fertilityColor}
                hover:opacity-80 hover:scale-105
                focus:outline-none
              `}
              disabled={!isCurrentMonth}
              tabIndex={-1}
              role="gridcell"
              aria-selected={isFocused}
              aria-label={`${format(day, 'EEEE, MMMM d, yyyy')}${cycleDay ? `, cycle day ${cycleDay}` : ''}`}
            >
              <div className="text-base font-semibold leading-tight">
                {getDate(day)}
              </div>
              {cycleDay && isCurrentMonth && (
                <div className="text-tiny text-text-muted mt-0.5">
                  D{cycleDay}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 space-y-2">
        <h3 className="text-small font-medium text-text-primary">
          {isKingMode ? "Threat Level Monitor" : "My Cycle Map"}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-tiny">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-error rounded flex-shrink-0"></div>
            <span className="break-words">{isKingMode ? "Code Red - Maximum Alert" : "The Red Wedding"}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-warning/30 rounded flex-shrink-0"></div>
            <span className="break-words">{isKingMode ? "Safe Zone - Low Risk" : "Chill Zone"}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-surface rounded flex-shrink-0"></div>
            <span className="break-words">{isKingMode ? "Caution - Moderate Risk" : "Feeling Good"}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-success/30 rounded flex-shrink-0"></div>
            <span className="break-words">{isKingMode ? "High Alert - Energy Surge" : "Peak Power"}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-success rounded flex-shrink-0"></div>
            <span className="break-words">{isKingMode ? "Critical - Peak Fertility" : "I'm Invincible Mode"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;