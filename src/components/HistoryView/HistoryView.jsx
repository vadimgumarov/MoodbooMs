import React, { useState } from 'react';
import { format, differenceInDays } from 'date-fns';
import { 
  Calendar, 
  TrendingUp, 
  Activity,
  AlertCircle,
  BarChart2
} from 'lucide-react';
import { 
  calculateCycleStatistics, 
  getRecentCycles,
  predictNextCycleStart 
} from '../../utils/cycleHistory';
import { useFeedback } from '../../core/contexts/FeedbackContext';
import { LoadingSpinner } from '../feedback';

const HistoryView = ({ cycleHistory, currentCycleStart, onPeriodStart, isBadassMode = true }) => {
  const [isMarking, setIsMarking] = useState(false);
  const { showSuccess, showError } = useFeedback();
  const stats = calculateCycleStatistics(cycleHistory);
  const recentCycles = getRecentCycles(cycleHistory, 6);
  const nextPredicted = currentCycleStart ? 
    predictNextCycleStart(cycleHistory, currentCycleStart) : null;

  const getRegularityColor = (regularity) => {
    switch (regularity) {
      case 'very-regular':
        return 'text-success';
      case 'regular':
        return 'text-success';
      case 'somewhat-irregular':
        return 'text-warning';
      case 'irregular':
        return 'text-error';
      default:
        return 'text-secondary';
    }
  };

  const getRegularityText = (regularity) => {
    if (!isBadassMode) {
      switch (regularity) {
        case 'very-regular':
          return 'Very Regular';
        case 'regular':
          return 'Regular';
        case 'somewhat-irregular':
          return 'Somewhat Irregular';
        case 'irregular':
          return 'Irregular';
        default:
          return 'Calculating...';
      }
    } else {
      switch (regularity) {
        case 'very-regular':
          return isBadassMode ? 'Predictable Pattern' : 'Clockwork AF';
        case 'regular':
          return isBadassMode ? 'Mostly Regular' : 'Pretty Predictable';
        case 'somewhat-irregular':
          return isBadassMode ? 'Variable Pattern' : 'Kinda Wonky';
        case 'irregular':
          return isBadassMode ? 'Unpredictable' : 'Total Chaos';
        default:
          return isBadassMode ? 'Calculating...' : 'Still figuring this sh*t out...';
      }
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Statistics Overview */}
      <div className="bg-surface rounded-lg p-4">
        <h3 className="text-heading font-semibold mb-3 flex items-center">
          <BarChart2 className="w-5 h-5 mr-2" />
          {isBadassMode ? "Her Cycle Stats" : "My Stats"}
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-small text-secondary">{isBadassMode ? "Average Duration" : "My Average"}</p>
            <p className="text-title font-medium">
              {stats.averageLength || '--'} days
            </p>
          </div>
          
          <div>
            <p className="text-small text-secondary">{isBadassMode ? "Predictability" : "My Pattern"}</p>
            <p className={`text-heading font-medium ${getRegularityColor(stats.cycleRegularity)}`}>
              {getRegularityText(stats.cycleRegularity)}
            </p>
          </div>
          
          <div>
            <p className="text-small text-secondary">{isBadassMode ? "Shortest Cycle" : "Quickest Hell"}</p>
            <p className="text-heading">
              {stats.shortestCycle || '--'} days
            </p>
          </div>
          
          <div>
            <p className="text-small text-secondary">{isBadassMode ? "Longest Cycle" : "Longest Nightmare"}</p>
            <p className="text-heading">
              {stats.longestCycle || '--'} days
            </p>
          </div>
        </div>

        {stats.completedCycles > 0 && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-small text-gray-600">
              Based on {stats.completedCycles} completed cycles
              {stats.standardDeviation && ` (±${stats.standardDeviation} days)`}
            </p>
          </div>
        )}
      </div>

      {/* Next Period Prediction */}
      {nextPredicted && currentCycleStart && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-small font-medium text-blue-900">{isBadassMode ? "Next Code Red Alert" : "My Next Hell Week"}</p>
              <p className="text-heading text-blue-800">
                {format(nextPredicted, 'MMMM d, yyyy')}
              </p>
              <p className="text-tiny text-blue-700 mt-1">
                In {differenceInDays(nextPredicted, new Date())} days
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Cycles */}
      <div>
        <h3 className="text-heading font-semibold mb-3 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          {isBadassMode ? "Recent Incidents" : "My History"}
        </h3>
        
        {recentCycles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>{isBadassMode ? "No history recorded" : "No drama logged yet"}</p>
            <p className="text-small mt-1">{isBadassMode ? "Track her cycles here" : "Start tracking this sh*t"}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentCycles.map((cycle, index) => {
              const startDate = new Date(cycle.startDate);
              const isCurrentCycle = index === 0 && !cycle.actualLength;
              
              return (
                <div 
                  key={cycle.id}
                  className={`p-3 rounded-lg border ${
                    isCurrentCycle ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {format(startDate, 'MMM d, yyyy')}
                        {isCurrentCycle && (
                          <span className="ml-2 text-tiny bg-green-600 text-white px-2 py-1 rounded">
                            Current
                          </span>
                        )}
                      </p>
                      <p className="text-small text-gray-600">
                        {cycle.actualLength ? 
                          `${cycle.actualLength} days` : 
                          `Day ${differenceInDays(new Date(), startDate) + 1}`
                        }
                      </p>
                    </div>
                    
                    {cycle.actualLength && cycle.actualLength !== cycle.cycleLength && (
                      <div className="text-right">
                        <p className="text-tiny text-gray-500">
                          Expected: {cycle.cycleLength} days
                        </p>
                        <p className={`text-tiny font-medium ${
                          Math.abs(cycle.actualLength - cycle.cycleLength) > 5 ? 
                            'text-red-600' : 'text-yellow-600'
                        }`}>
                          {cycle.actualLength > cycle.cycleLength ? '+' : ''}
                          {cycle.actualLength - cycle.cycleLength} days
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Show notes or symptoms if any */}
                  {(Object.keys(cycle.notes || {}).length > 0 || 
                    Object.keys(cycle.symptoms || {}).length > 0) && (
                    <div className="mt-2 pt-2 border-t text-tiny text-gray-600">
                      <AlertCircle className="w-3 h-3 inline mr-1" />
                      {Object.keys(cycle.notes || {}).length} notes, 
                      {' '}{Object.keys(cycle.symptoms || {}).length} symptom entries
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mark New Period Button */}
      {cycleHistory.length > 0 && (
        <div className="pt-4">
          <button
            onClick={async () => {
              setIsMarking(true);
              try {
                await onPeriodStart();
                showSuccess('Period start marked successfully!');
              } catch (error) {
                showError('Failed to mark period start. Please try again.');
              } finally {
                setIsMarking(false);
              }
            }}
            disabled={isMarking}
            className="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
          >
            {isMarking ? (
              <LoadingSpinner size="small" inline />
            ) : (
              'Mark New Period Start'
            )}
          </button>
          <p className="text-tiny text-gray-500 text-center mt-2">
            Use this when your period starts earlier or later than expected
          </p>
        </div>
      )}
    </div>
  );
};

export default HistoryView;