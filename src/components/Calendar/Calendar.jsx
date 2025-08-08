import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
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
  getDate,
  parse,
  isValid
} from 'date-fns';
import { 
  calculateCurrentDay, 
  getFertilityLevel,
  getCurrentPhase,
  getCalendarPredictions
} from '../../utils/cycleCalculations';
import { useMode } from '../../core/contexts/SimpleModeContext';
import PeriodNavigation from './PeriodNavigation';

const Calendar = ({ cycleStartDate, cycleLength = 28, onDateSelect, cycleHistory = [] }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [focusedDate, setFocusedDate] = useState(null);
  const [dateInputValue, setDateInputValue] = useState('');
  const [dateInputError, setDateInputError] = useState('');
  const today = new Date();
  const { isKingMode } = useMode();
  const calendarRef = useRef(null);
  const dateInputRef = useRef(null);

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

  // Get predictions for highlighting
  const predictions = useMemo(() => {
    if (!cycleStartDate) return null;
    return getCalendarPredictions(cycleStartDate, cycleLength, cycleHistory);
  }, [cycleStartDate, cycleLength, cycleHistory]);

  // Check if a date is a prediction
  const getPredictionInfo = (date) => {
    if (!predictions) return null;
    
    const { ovulation, nextPeriod } = predictions;
    
    if (isSameDay(date, ovulation.date)) {
      return ovulation;
    }
    
    if (isSameDay(date, nextPeriod.date)) {
      return nextPeriod;
    }
    
    return null;
  };

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
    const now = new Date();
    setCurrentMonth(now);
    setFocusedDate(now);
    // Optionally select today's date
    if (onDateSelect) {
      onDateSelect(now);
    }
    // Clear date input
    setDateInputValue('');
    setDateInputError('');
  };

  // Handler for date input
  const handleDateInputSubmit = (e) => {
    e.preventDefault();
    
    // Try to parse the date in various formats
    const formats = ['MM/dd/yyyy', 'M/d/yyyy', 'MM-dd-yyyy', 'M-d-yyyy'];
    let parsedDate = null;
    
    for (const formatStr of formats) {
      const attemptedDate = parse(dateInputValue, formatStr, new Date());
      if (isValid(attemptedDate)) {
        parsedDate = attemptedDate;
        break;
      }
    }
    
    if (parsedDate) {
      // Valid date - jump to it
      setCurrentMonth(startOfMonth(parsedDate));
      setFocusedDate(parsedDate);
      if (onDateSelect) {
        onDateSelect(parsedDate);
      }
      setDateInputError('');
      // Clear input after successful jump
      setDateInputValue('');
    } else {
      // Invalid date - show error
      setDateInputError('Please enter a valid date (MM/DD/YYYY)');
    }
  };

  const handleDateInputChange = (e) => {
    setDateInputValue(e.target.value);
    // Clear error when user starts typing
    if (dateInputError) {
      setDateInputError('');
    }
  };

  // Handler for period navigation
  const handleNavigateToPeriod = useCallback((periodDate) => {
    // Debounce rapid navigation to prevent re-render loops (Exit Code 15 fix)
    setTimeout(() => {
      setCurrentMonth(new Date(periodDate));
      setFocusedDate(new Date(periodDate));
      // Select the period date
      if (onDateSelect) {
        onDateSelect(new Date(periodDate));
      }
    }, 100); // Small delay to prevent rapid updates
  }, [onDateSelect]);

  // Keyboard navigation handlers
  const handleKeyDown = useCallback((e) => {
    // Handle 'T' key for Today button
    if (e.key === 't' || e.key === 'T') {
      e.preventDefault();
      goToToday();
      return;
    }

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
  }, [focusedDate, currentMonth, onDateSelect, goToToday]);

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
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
        <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
          <button
            onClick={goToToday}
            className="px-3 py-1 text-tiny bg-primary text-white rounded hover:bg-primary-dark transition-colors font-medium"
            aria-label="Go to today (Press T)"
            title="Go to today (Press T)"
          >
            Today
          </button>
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-surface rounded-full transition-colors sm:inline-flex hidden"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Month Dropdown */}
          <select
            value={currentMonth.getMonth()}
            onChange={(e) => {
              const newMonth = new Date(currentMonth);
              newMonth.setMonth(parseInt(e.target.value));
              setCurrentMonth(newMonth);
            }}
            className="px-3 py-1.5 text-sm sm:text-base font-medium bg-white border border-gray-300 rounded-md hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer appearance-none bg-no-repeat bg-[length:16px] bg-[right_8px_center] pr-8"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")` }}
            aria-label="Select month"
          >
            {[
              'January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'
            ].map((month, index) => (
              <option key={month} value={index}>
                {month}
              </option>
            ))}
          </select>

          {/* Year Dropdown */}
          <select
            value={currentMonth.getFullYear()}
            onChange={(e) => {
              const newMonth = new Date(currentMonth);
              newMonth.setFullYear(parseInt(e.target.value));
              setCurrentMonth(newMonth);
            }}
            className="px-3 py-1.5 text-sm sm:text-base font-medium bg-white border border-gray-300 rounded-md hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer appearance-none bg-no-repeat bg-[length:16px] bg-[right_8px_center] pr-8"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")` }}
            aria-label="Select year"
          >
            {(() => {
              const currentYear = new Date().getFullYear();
              const years = [];
              for (let year = currentYear - 5; year <= currentYear + 2; year++) {
                years.push(year);
              }
              return years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ));
            })()}
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-surface rounded-full transition-colors inline-flex sm:hidden"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-surface rounded-full transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Date Jump Input */}
      <div className="mb-4">
        <form onSubmit={handleDateInputSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <input
              ref={dateInputRef}
              type="text"
              value={dateInputValue}
              onChange={handleDateInputChange}
              placeholder="Jump to date (MM/DD/YYYY)"
              className={`w-full px-3 py-1.5 pl-8 text-small border rounded-md transition-colors ${
                dateInputError 
                  ? 'border-error focus:border-error focus:ring-error/20' 
                  : 'border-gray-300 focus:border-primary focus:ring-primary/20'
              } focus:outline-none focus:ring-2`}
              aria-label="Jump to specific date"
              aria-invalid={!!dateInputError}
              aria-describedby={dateInputError ? "date-error" : undefined}
            />
            <CalendarIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-surface hover:bg-gray-200 text-small rounded-md transition-colors"
            disabled={!dateInputValue}
          >
            Go
          </button>
        </form>
        {dateInputError && (
          <p id="date-error" className="mt-1 text-tiny text-error">
            {dateInputError}
          </p>
        )}
      </div>

      {/* Period Navigation */}
      <div className="flex justify-center mb-4">
        <PeriodNavigation
          cycleStartDate={cycleStartDate}
          cycleLength={cycleLength}
          cycleHistory={cycleHistory}
          onNavigateToPeriod={handleNavigateToPeriod}
        />
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
          const predictionInfo = getPredictionInfo(day);

          // Build prediction styling
          let predictionStyle = '';
          let predictionIndicator = null;
          let ariaLabel = `${format(day, 'EEEE, MMMM d, yyyy')}${cycleDay ? `, cycle day ${cycleDay}` : ''}`;
          
          if (predictionInfo && isCurrentMonth) {
            const confidenceClass = {
              'high': 'border-2 border-dashed border-primary',
              'medium': 'border-2 border-dashed border-warning',
              'low': 'border-2 border-dashed border-text-muted'
            }[predictionInfo.confidence];
            
            predictionStyle = confidenceClass;
            
            if (predictionInfo.type === 'ovulation') {
              predictionIndicator = (
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-success border border-white text-tiny flex items-center justify-center">
                  <span className="text-white font-bold text-[8px]">O</span>
                </div>
              );
              ariaLabel += `, predicted ovulation (${predictionInfo.confidence} confidence)`;
            } else if (predictionInfo.type === 'period') {
              predictionIndicator = (
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-error border border-white text-tiny flex items-center justify-center">
                  <span className="text-white font-bold text-[8px]">P</span>
                </div>
              );
              ariaLabel += `, predicted period start (${predictionInfo.confidence} confidence)`;
            }
          }

          return (
            <button
              key={index}
              onClick={() => onDateSelect && onDateSelect(day)}
              onFocus={() => setFocusedDate(day)}
              className={`
                relative p-2 h-14 rounded-lg transition-all flex flex-col items-center justify-center
                ${isCurrentMonth ? '' : 'opacity-40'}
                ${isToday ? 'ring-2 ring-primary font-bold shadow-lg bg-gradient-to-br from-primary/10 to-primary/5' : ''}
                ${isFocused ? 'ring-2 ring-offset-2 z-10' : ''}
                ${fertilityColor}
                ${predictionStyle}
                hover:opacity-80 hover:scale-105
                focus:outline-none
              `}
              disabled={!isCurrentMonth}
              tabIndex={-1}
              role="gridcell"
              aria-selected={isFocused}
              aria-label={ariaLabel}
            >
              <div className="text-base font-semibold leading-tight">
                {getDate(day)}
              </div>
              {cycleDay && isCurrentMonth && (
                <div className="text-tiny text-text-muted mt-0.5">
                  D{cycleDay}
                </div>
              )}
              {isToday && isCurrentMonth && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-bold text-primary">
                  TODAY
                </div>
              )}
              {predictionIndicator}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 space-y-3">
        <h3 className="text-small font-medium text-text-primary">
          {isKingMode ? "Threat Level Monitor" : "My Cycle Map"}
        </h3>
        
        {/* Fertility Legend */}
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

        {/* Predictions Legend */}
        {predictions && (
          <div className="border-t pt-3">
            <h4 className="text-small font-medium text-text-primary mb-2">
              {isKingMode ? "Intelligence Predictions" : "My Predictions"}
            </h4>
            <div className="grid grid-cols-1 gap-2 text-tiny">
              <div className="flex items-center space-x-2">
                <div className="relative w-6 h-6 border-2 border-dashed border-primary rounded flex-shrink-0 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-success"></div>
                </div>
                <span className="break-words">
                  {isKingMode ? "Predicted High-Risk Window" : "Predicted Ovulation"}
                  {predictions.ovulation.confidence === 'high' && " (High Confidence)"}
                  {predictions.ovulation.confidence === 'low' && " (Low Confidence)"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative w-6 h-6 border-2 border-dashed border-primary rounded flex-shrink-0 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-error"></div>
                </div>
                <span className="break-words">
                  {isKingMode ? "Predicted Code Red Alert" : "Predicted Next Period"}
                  {predictions.nextPeriod.confidence === 'high' && " (High Confidence)"}
                  {predictions.nextPeriod.confidence === 'low' && " (Low Confidence)"}
                </span>
              </div>
              <div className="text-text-muted text-[11px] mt-1">
                Dotted borders indicate predictions. Confidence based on cycle regularity.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;