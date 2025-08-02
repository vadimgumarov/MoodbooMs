import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { useMode } from '../../core/contexts/SimpleModeContext';
import { getPeriodNavigationInfo } from '../../utils/cycleCalculations';
import Tooltip from '../feedback/Tooltip';

const PeriodNavigation = ({ 
  cycleStartDate, 
  cycleLength, 
  cycleHistory, 
  onNavigateToPeriod,
  className = '' 
}) => {
  const { isKingMode } = useMode();

  // Get navigation info (memoized to prevent recalculation on every render)
  const navigationInfo = useMemo(() => {
    return cycleStartDate ? 
      getPeriodNavigationInfo(cycleStartDate, cycleLength, cycleHistory) : 
      null;
  }, [cycleStartDate, cycleLength, cycleHistory]);

  if (!navigationInfo) {
    return null;
  }

  const { next, previous } = navigationInfo;

  // Mode-specific text
  const getButtonText = (type) => {
    if (isKingMode) {
      return type === 'next' ? 'Next Alert' : 'Previous Alert';
    }
    return type === 'next' ? 'Next Period' : 'Previous Period';
  };

  // Generate tooltip content
  const getTooltipContent = (info, type) => {
    const dateStr = format(info.date, 'MMM d, yyyy');
    const source = info.basedOnHistory ? 
      `Based on ${info.cycleLength}-day average` : 
      `Predicted (${info.cycleLength}-day cycle)`;
    
    return `${dateStr}\n${source}`;
  };

  const handlePreviousPeriod = () => {
    if (onNavigateToPeriod && previous.date) {
      onNavigateToPeriod(previous.date);
    }
  };

  const handleNextPeriod = () => {
    if (onNavigateToPeriod && next.date) {
      onNavigateToPeriod(next.date);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Tooltip 
        content={getTooltipContent(previous, 'previous')}
        position="bottom"
      >
        <button
          onClick={handlePreviousPeriod}
          className="flex items-center gap-1 px-3 py-1.5 text-tiny bg-surface hover:bg-surface/80 rounded-lg transition-colors"
          aria-label={`Navigate to ${getButtonText('previous').toLowerCase()}`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{getButtonText('previous')}</span>
        </button>
      </Tooltip>

      <Tooltip 
        content={getTooltipContent(next, 'next')}
        position="bottom"
      >
        <button
          onClick={handleNextPeriod}
          className="flex items-center gap-1 px-3 py-1.5 text-tiny bg-surface hover:bg-surface/80 rounded-lg transition-colors"
          aria-label={`Navigate to ${getButtonText('next').toLowerCase()}`}
        >
          <span>{getButtonText('next')}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </Tooltip>
    </div>
  );
};

export default PeriodNavigation;