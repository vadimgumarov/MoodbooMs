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
import ContextMenu from './ContextMenu';

const Calendar = ({ cycleStartDate, cycleLength = 28, onDateSelect, cycleHistory = [] }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [focusedDate, setFocusedDate] = useState(null);
  const [dateInputValue, setDateInputValue] = useState('');
  const [dateInputError, setDateInputError] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [contextMenu, setContextMenu] = useState(null);
  const [dateNotes, setDateNotes] = useState({});
  const today = new Date();
  const { isKingMode } = useMode();
  const calendarRef = useRef(null);
  const dateInputRef = useRef(null);
  const calendarGridRef = useRef(null);
  
  // Swipe gesture state
  const swipeState = useRef({
    isActive: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    startTime: 0,
    hasMoved: false
  });

  // Navigation handlers with animation
  const previousMonth = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentMonth(subMonths(currentMonth, 1));
    setTimeout(() => setIsAnimating(false), 300);
  };
  
  const nextMonth = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentMonth(addMonths(currentMonth, 1));
    setTimeout(() => setIsAnimating(false), 300);
  };

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

  // Swipe gesture handlers
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    swipeState.current = {
      isActive: true,
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      startTime: Date.now(),
      hasMoved: false
    };
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!swipeState.current.isActive) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - swipeState.current.startX;
    const deltaY = touch.clientY - swipeState.current.startY;
    
    // Check if this is a horizontal swipe
    if (!swipeState.current.hasMoved && Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      swipeState.current.hasMoved = true;
      e.preventDefault(); // Prevent scrolling
    }

    if (swipeState.current.hasMoved) {
      swipeState.current.currentX = touch.clientX;
      
      // Calculate swipe offset with resistance
      const maxOffset = 100;
      const resistance = 0.5;
      const offset = Math.max(-maxOffset, Math.min(maxOffset, deltaX * resistance));
      setSwipeOffset(offset);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!swipeState.current.isActive || !swipeState.current.hasMoved) {
      swipeState.current.isActive = false;
      setSwipeOffset(0);
      return;
    }

    const deltaX = swipeState.current.currentX - swipeState.current.startX;
    const deltaTime = Date.now() - swipeState.current.startTime;
    const velocity = Math.abs(deltaX) / deltaTime;
    
    // Determine if swipe is significant enough to navigate
    const shouldNavigate = Math.abs(deltaX) > 50 || velocity > 0.3;
    
    if (shouldNavigate) {
      if (deltaX > 0) {
        previousMonth(); // Swipe right = previous month
      } else {
        nextMonth(); // Swipe left = next month
      }
    }

    // Reset state with smooth transition
    swipeState.current.isActive = false;
    
    // Smooth reset of offset
    setTimeout(() => {
      setSwipeOffset(0);
    }, 50);
  }, [previousMonth, nextMonth]);

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

  // Focus management and touch events
  useEffect(() => {
    const calendar = calendarRef.current;
    const calendarGrid = calendarGridRef.current;
    if (!calendar || !calendarGrid) return;

    calendar.addEventListener('keydown', handleKeyDown);
    calendarGrid.addEventListener('touchstart', handleTouchStart, { passive: false });
    calendarGrid.addEventListener('touchmove', handleTouchMove, { passive: false });
    calendarGrid.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      calendar.removeEventListener('keydown', handleKeyDown);
      calendarGrid.removeEventListener('touchstart', handleTouchStart);
      calendarGrid.removeEventListener('touchmove', handleTouchMove);
      calendarGrid.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleKeyDown, handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Set initial focus when calendar mounts
  useEffect(() => {
    if (!focusedDate) {
      setFocusedDate(today);
    }
  }, [today, focusedDate]);

  // Load date notes from electron store on mount
  useEffect(() => {
    const loadDateNotes = async () => {
      try {
        if (window.electronAPI?.store?.get) {
          const savedNotes = await window.electronAPI.store.get('dateNotes');
          if (savedNotes && typeof savedNotes === 'object') {
            setDateNotes(savedNotes);
          }
        }
      } catch (error) {
        console.error('Failed to load date notes:', error);
      }
    };

    loadDateNotes();
  }, []);

  // Save date notes to electron store whenever they change
  useEffect(() => {
    const saveDateNotes = async () => {
      try {
        if (window.electronAPI?.store?.set && Object.keys(dateNotes).length > 0) {
          await window.electronAPI.store.set({ key: 'dateNotes', value: dateNotes });
        }
      } catch (error) {
        console.error('Failed to save date notes:', error);
      }
    };

    // Only save if we have notes (avoid saving empty object on initial load)
    if (Object.keys(dateNotes).length > 0) {
      saveDateNotes();
    }
  }, [dateNotes]);

  // Context menu handlers
  const handleContextMenu = useCallback((e, date) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenu({
      date,
      x: e.clientX,
      y: e.clientY
    });
  }, []);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleMarkPeriodStart = useCallback((date) => {
    console.log('Mark as period start:', date);
    // This would typically call a parent function to update cycle start date
    // For now, we'll just log it
  }, []);

  const handleAddNote = useCallback((date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const currentNote = dateNotes[dateKey] || '';
    const newNote = prompt('Add a note for this date:', currentNote);
    
    if (newNote !== null) {
      if (newNote.trim() === '') {
        // Remove note if empty
        setDateNotes(prev => {
          const updated = { ...prev };
          delete updated[dateKey];
          return updated;
        });
      } else {
        // Add or update note
        setDateNotes(prev => ({
          ...prev,
          [dateKey]: newNote.trim()
        }));
      }
      console.log('Note updated for', date, ':', newNote.trim() || '(removed)');
    }
  }, [dateNotes]);

  const handleSetReminder = useCallback((date) => {
    console.log('Set reminder for:', date);
    // This would typically open a reminder modal
    alert(`Reminder functionality for ${format(date, 'MM/dd/yyyy')} coming soon!`);
  }, []);

  const handleCopyDate = useCallback((dateString) => {
    console.log('Date copied:', dateString);
    // Show a brief success message
    alert(`Date ${dateString} copied to clipboard!`);
  }, []);

  return (
    <div className="p-3">
      {/* Compact Calendar Header - all in one row */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <button
          onClick={goToToday}
          className="px-2.5 py-1 text-xs bg-primary text-white rounded hover:bg-primary-dark transition-colors font-medium"
          aria-label="Go to today"
          title="Go to today (Press T)"
        >
          Today
        </button>
        
        <div className="flex items-center gap-1">
          <button
            onClick={previousMonth}
            className="p-1 hover:bg-surface rounded transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          {/* Month Dropdown */}
          <select
            value={currentMonth.getMonth()}
            onChange={(e) => {
              const newMonth = new Date(currentMonth);
              newMonth.setMonth(parseInt(e.target.value));
              setCurrentMonth(newMonth);
            }}
            className="px-2 py-1 text-xs font-medium bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded hover:border-primary focus:border-primary focus:outline-none cursor-pointer"
            aria-label="Select month"
          >
            {[
              'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
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
            className="px-2 py-1 text-xs font-medium bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded hover:border-primary focus:border-primary focus:outline-none cursor-pointer"
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
          
          <button
            onClick={nextMonth}
            className="p-1 hover:bg-surface rounded transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>


      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
          <div key={day} className="text-center text-[10px] font-medium text-text-secondary py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div 
        ref={calendarRef}
        className="relative overflow-hidden"
        role="grid"
        aria-label="Calendar"
        tabIndex={0}
      >
        <div 
          ref={calendarGridRef}
          className={`grid grid-cols-7 gap-0.5 transition-transform duration-300 ease-out ${
            isAnimating ? 'transition-transform' : ''
          }`}
          style={{
            transform: `translateX(${swipeOffset}px)`,
          }}
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
              onContextMenu={(e) => handleContextMenu(e, day)}
              onFocus={() => setFocusedDate(day)}
              className={`
                relative p-1 h-11 rounded transition-all flex flex-col items-center justify-center
                ${isCurrentMonth ? '' : 'opacity-40'}
                ${isToday ? 'ring-1 ring-primary font-bold' : ''}
                ${isFocused ? 'ring-1 ring-offset-1 z-10' : ''}
                ${fertilityColor}
                ${predictionStyle}
                hover:opacity-80
                focus:outline-none
              `}
              disabled={!isCurrentMonth}
              tabIndex={-1}
              role="gridcell"
              aria-selected={isFocused}
              aria-label={ariaLabel}
            >
              <div className="text-sm font-medium leading-tight">
                {getDate(day)}
              </div>
              {cycleDay && isCurrentMonth && (
                <div className="text-[9px] text-text-muted">
                  D{cycleDay}
                </div>
              )}
              {/* Note indicator */}
              {dateNotes[format(day, 'yyyy-MM-dd')] && isCurrentMonth && (
                <div className="absolute -top-1 -left-1 w-3 h-3 rounded-full bg-primary border border-white text-tiny flex items-center justify-center">
                  <span className="text-white font-bold text-[8px]">N</span>
                </div>
              )}
              {predictionIndicator}
            </button>
          );
        })}
        </div>
        
        {/* Swipe indicator */}
        {Math.abs(swipeOffset) > 20 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg backdrop-blur-sm">
            <div className="bg-white/90 px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
              <span className="text-sm font-medium">
                {swipeOffset > 0 ? '← Previous Month' : 'Next Month →'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Period Navigation - Compact */}
      <div className="mt-3 mb-2">
        <PeriodNavigation
          cycleStartDate={cycleStartDate}
          cycleLength={cycleLength}
          cycleHistory={cycleHistory}
          onNavigateToPeriod={handleNavigateToPeriod}
        />
      </div>

      {/* Date Jump Input - Below Calendar */}
      <div className="mb-3">
        <form onSubmit={handleDateInputSubmit} className="flex gap-1.5">
          <div className="flex-1 relative">
            <input
              ref={dateInputRef}
              type="text"
              value={dateInputValue}
              onChange={handleDateInputChange}
              placeholder="Jump to date (MM/DD/YYYY)"
              className={`w-full px-2.5 py-1 pl-7 text-xs border rounded transition-colors ${
                dateInputError 
                  ? 'border-error focus:border-error focus:ring-error/20' 
                  : 'border-gray-300 focus:border-primary focus:ring-primary/20'
              } focus:outline-none focus:ring-1`}
              aria-label="Jump to specific date"
              aria-invalid={!!dateInputError}
              aria-describedby={dateInputError ? "date-error" : undefined}
            />
            <CalendarIcon className="absolute left-2 top-[50%] -translate-y-[50%] w-3 h-3 text-gray-400" />
          </div>
          <button
            type="submit"
            className="px-2.5 py-1 bg-surface hover:bg-gray-200 text-xs rounded transition-colors"
            disabled={!dateInputValue}
          >
            Go
          </button>
        </form>
        {dateInputError && (
          <p id="date-error" className="mt-1 text-[10px] text-error">
            {dateInputError}
          </p>
        )}
      </div>

      {/* Legend */}
      <div className="mt-3 space-y-3">
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

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          date={contextMenu.date}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={handleCloseContextMenu}
          onMarkPeriodStart={handleMarkPeriodStart}
          onAddNote={handleAddNote}
          onSetReminder={handleSetReminder}
          onCopyDate={handleCopyDate}
          hasNote={!!dateNotes[format(contextMenu.date, 'yyyy-MM-dd')]}
        />
      )}
    </div>
  );
};

export default Calendar;