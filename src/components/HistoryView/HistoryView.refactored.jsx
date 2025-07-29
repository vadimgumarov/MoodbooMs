/**
 * HistoryView - Refactored with Mode Abstraction Layer
 * 
 * This component displays cycle history and statistics using
 * the new mode abstraction layer for cleaner mode-specific text.
 */

import React, { useMemo } from 'react';
import { Calendar, Activity, TrendingUp, BarChart3, RefreshCw } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { 
  calculateAverageCycleLength, 
  getCycleRegularity,
  predictNextPeriod,
  getCycleStats
} from '../../utils/cycleHistory';
import { 
  useModeAwareProps,
  ModeText,
  ModeConditional 
} from '../../core/components/abstractions';
import { getComponentText } from '../../core/components/config/ComponentModeConfig';

const HistoryView = ({ cycleHistory, currentCycleStart, onPeriodStart }) => {
  const modeProps = useModeAwareProps();
  const { currentMode } = modeProps;
  
  // Calculate statistics
  const stats = useMemo(() => {
    if (!cycleHistory || cycleHistory.length === 0) {
      return {
        averageLength: 28,
        regularity: 'unknown',
        shortestCycle: '-',
        longestCycle: '-',
        cycleCount: 0
      };
    }
    
    const cycleStats = getCycleStats(cycleHistory);
    const avgLength = calculateAverageCycleLength(cycleHistory);
    const regularity = getCycleRegularity(cycleHistory);
    
    return {
      averageLength: Math.round(avgLength),
      regularity: regularity,
      shortestCycle: cycleStats.shortest || '-',
      longestCycle: cycleStats.longest || '-',
      cycleCount: cycleHistory.length
    };
  }, [cycleHistory]);
  
  // Predict next period
  const nextPeriodDate = useMemo(() => {
    if (!currentCycleStart || stats.cycleCount === 0) return null;
    return predictNextPeriod(currentCycleStart, cycleHistory);
  }, [currentCycleStart, cycleHistory, stats.cycleCount]);
  
  // Get regularity text based on mode
  const getRegularityText = (regularity) => {
    const regularityMap = {
      'very-regular': getComponentText('HistoryView', currentMode, 'predictablePattern'),
      'regular': getComponentText('HistoryView', currentMode, 'mostlyRegular'),
      'irregular': getComponentText('HistoryView', currentMode, 'variablePattern'),
      'very-irregular': getComponentText('HistoryView', currentMode, 'unpredictable'),
      'unknown': getComponentText('HistoryView', currentMode, 'calculating')
    };
    
    return regularityMap[regularity] || regularity;
  };
  
  const handlePeriodStart = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    onPeriodStart(today);
  };
  
  return (
    <div className="space-y-4">
      {/* Stats Overview */}
      <div className="bg-purple-50 rounded-lg p-4">
        <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          {getComponentText('HistoryView', currentMode, 'title')}
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded p-3">
            <p className="text-sm text-gray-600">
              {getComponentText('HistoryView', currentMode, 'averageLabel')}
            </p>
            <p className="text-xl font-bold text-purple-900">{stats.averageLength} days</p>
          </div>
          
          <div className="bg-white rounded p-3">
            <Activity className="w-4 h-4 text-gray-500 mb-1" />
            <p className="text-sm text-gray-600">
              {getComponentText('HistoryView', currentMode, 'patternLabel')}
            </p>
            <p className="text-sm font-medium text-purple-900">
              {getRegularityText(stats.regularity)}
            </p>
          </div>
          
          <div className="bg-white rounded p-3">
            <TrendingUp className="w-4 h-4 text-gray-500 mb-1 rotate-180" />
            <p className="text-sm text-gray-600">
              {getComponentText('HistoryView', currentMode, 'shortestLabel')}
            </p>
            <p className="text-sm font-medium text-purple-900">{stats.shortestCycle} days</p>
          </div>
          
          <div className="bg-white rounded p-3">
            <TrendingUp className="w-4 h-4 text-gray-500 mb-1" />
            <p className="text-sm text-gray-600">
              {getComponentText('HistoryView', currentMode, 'longestLabel')}
            </p>
            <p className="text-sm font-medium text-purple-900">{stats.longestCycle} days</p>
          </div>
        </div>
      </div>
      
      {/* Period Start Button */}
      <div className="bg-red-50 rounded-lg p-4">
        <button
          onClick={handlePeriodStart}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          <ModeText 
            queenText="Period Started Today"
            kingText="Mark Period Start"
          />
        </button>
        
        {nextPeriodDate && (
          <div className="mt-3 p-3 bg-white rounded">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-blue-900">
                {getComponentText('HistoryView', currentMode, 'nextPeriodLabel')}
              </p>
              <p className="text-sm font-bold text-blue-900">
                {format(nextPeriodDate, 'MMM d')}
              </p>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {Math.ceil((nextPeriodDate - new Date()) / (1000 * 60 * 60 * 24))} days away
            </p>
          </div>
        )}
      </div>
      
      {/* Recent History */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          {getComponentText('HistoryView', currentMode, 'recentTitle')}
        </h3>
        
        {cycleHistory && cycleHistory.length > 0 ? (
          <div className="space-y-2">
            {cycleHistory.slice(-5).reverse().map((cycle, index) => (
              <div key={index} className="bg-white rounded p-3 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">
                    {format(new Date(cycle.startDate), 'MMM d, yyyy')}
                  </p>
                  <p className="text-xs text-gray-600">
                    {cycle.actualLength || cycle.length} days
                  </p>
                </div>
                {cycle.notes && (
                  <p className="text-xs text-gray-500">{cycle.notes}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <p>{getComponentText('HistoryView', currentMode, 'noHistoryMessage')}</p>
            <p className="text-sm mt-1">
              {getComponentText('HistoryView', currentMode, 'startTrackingMessage')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;