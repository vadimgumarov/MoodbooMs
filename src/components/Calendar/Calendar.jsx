import React, { useState, useMemo } from 'react';
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
  const today = new Date();
  const { isKingMode } = useMode();

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
    if (!cycleStartDate) return 'bg-gray-100';
    
    const cycleDay = calculateCurrentDay(cycleStartDate, date, cycleLength);
    const fertilityLevel = getFertilityLevel(cycleDay, cycleLength);
    const phase = getCurrentPhase(cycleDay, cycleLength);

    // Color mapping based on fertility level and phase
    if (phase === 'menstrual') return 'bg-red-500 text-white';
    
    switch (fertilityLevel) {
      case 'very-low':
        return 'bg-red-400 text-white';
      case 'low':
        return 'bg-yellow-200';
      case 'medium':
        return 'bg-gray-300';
      case 'high':
        return 'bg-green-300';
      case 'very-high':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <div className="p-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, today);
          const cycleDay = cycleStartDate ? 
            calculateCurrentDay(cycleStartDate, day, cycleLength) : null;
          const fertilityColor = getFertilityColor(day);

          return (
            <button
              key={index}
              onClick={() => onDateSelect && onDateSelect(day)}
              className={`
                relative p-2 h-12 rounded-lg transition-all
                ${isCurrentMonth ? '' : 'opacity-40'}
                ${isToday ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                ${fertilityColor}
                hover:opacity-80 hover:scale-105
              `}
              disabled={!isCurrentMonth}
            >
              <div className="text-sm font-medium">
                {getDate(day)}
              </div>
              {cycleDay && isCurrentMonth && (
                <div className="text-xs opacity-75">
                  D{cycleDay}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 space-y-2">
        <h3 className="text-sm font-medium text-gray-700">
          {isKingMode ? "Threat Level Monitor" : "My Cycle Map"}
        </h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>{isKingMode ? "Code Red - Maximum Alert" : "The Red Wedding"}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-200 rounded"></div>
            <span>{isKingMode ? "Safe Zone - Low Risk" : "Chill Zone"}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            <span>{isKingMode ? "Caution - Moderate Risk" : "Feeling Good"}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-300 rounded"></div>
            <span>{isKingMode ? "High Alert - Energy Surge" : "Peak Power"}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>{isKingMode ? "Critical - Peak Fertility" : "I'm Invincible Mode"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;