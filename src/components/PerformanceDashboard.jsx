// Performance monitoring dashboard for development
import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Clock, Cpu, HardDrive, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import performanceMonitor, { getPerformanceReport } from '../utils/performance';

const PerformanceDashboard = ({ isVisible = true }) => {
  const [metrics, setMetrics] = useState(null);
  const [isLive, setIsLive] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);

  const refreshMetrics = useCallback(async () => {
    try {
      const report = getPerformanceReport();
      
      // Add Electron metrics if available
      if (window.electronAPI?.performance) {
        const electronData = await window.electronAPI.performance.getData();
        report.electron = electronData;
      }
      
      setMetrics(report);
    } catch (error) {
      console.warn('Failed to fetch performance metrics:', error);
    }
  }, []);

  useEffect(() => {
    if (isVisible) {
      refreshMetrics();
      
      if (isLive) {
        const interval = setInterval(refreshMetrics, 2000);
        setRefreshInterval(interval);
        return () => clearInterval(interval);
      }
    }
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [isVisible, isLive, refreshMetrics]);

  const formatValue = (value, unit = 'ms') => {
    if (typeof value !== 'number') return 'N/A';
    
    if (unit === 'ms') {
      return `${value.toFixed(2)}ms`;
    } else if (unit === 'MB') {
      return `${(value / 1024 / 1024).toFixed(1)}MB`;
    } else if (unit === '%') {
      return `${value.toFixed(1)}%`;
    }
    return `${value} ${unit}`;
  };

  const getBudgetStatus = (metric, value, budget) => {
    if (!budget || typeof value !== 'number') return 'unknown';
    
    if (value <= budget * 0.8) return 'good';
    if (value <= budget) return 'warning';
    return 'violation';
  };

  const StatusIcon = ({ status }) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'violation':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 bg-gray-300 rounded-full" />;
    }
  };

  const MetricCard = ({ title, icon: Icon, value, unit, budget, description }) => {
    const status = getBudgetStatus(title, value, budget);
    
    return (
      <div 
        className={`p-4 rounded-lg border cursor-pointer transition-all ${
          selectedMetric === title 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => setSelectedMetric(selectedMetric === title ? null : title)}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">{title}</h3>
          </div>
          <StatusIcon status={status} />
        </div>
        
        <div className="text-2xl font-bold text-gray-900 mb-1">
          {formatValue(value, unit)}
        </div>
        
        {budget && (
          <div className="text-sm text-gray-500">
            Budget: {formatValue(budget, unit)}
          </div>
        )}
        
        {selectedMetric === title && description && (
          <div className="mt-2 pt-2 border-t text-sm text-gray-600">
            {description}
          </div>
        )}
      </div>
    );
  };

  const MemoryChart = ({ snapshots = [] }) => {
    if (!snapshots.length) return null;
    
    const maxValue = Math.max(...snapshots.map(s => s.heapUsed || 0));
    
    return (
      <div className="mt-4">
        <h4 className="font-medium mb-2">Memory Usage Over Time</h4>
        <div className="h-32 flex items-end gap-1">
          {snapshots.slice(-20).map((snapshot, i) => (
            <div
              key={i}
              className="bg-blue-500 min-w-[8px] rounded-t"
              style={{
                height: `${(snapshot.heapUsed / maxValue) * 100}%`,
                opacity: 0.6 + (i / snapshots.length) * 0.4
              }}
              title={`${snapshot.heapUsed}MB at ${new Date(snapshot.timestamp).toLocaleTimeString()}`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0MB</span>
          <span>{maxValue}MB</span>
        </div>
      </div>
    );
  };

  const ViolationsList = ({ violations = [] }) => {
    if (!violations.length) return null;
    
    return (
      <div className="mt-4">
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          Recent Budget Violations
        </h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {violations.slice(-10).map((violation, i) => (
            <div key={i} className="p-2 bg-red-50 rounded border border-red-200">
              <div className="font-medium text-red-800">{violation.metric}</div>
              <div className="text-sm text-red-600">
                {formatValue(violation.actual)} / {formatValue(violation.budget)} 
                ({violation.percentage}% of budget)
              </div>
              <div className="text-xs text-red-500">
                {new Date(violation.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!isVisible || process.env.NODE_ENV === 'production') {
    return null;
  }

  if (!metrics) {
    return (
      <div className="fixed bottom-4 right-4 p-4 bg-white rounded-lg shadow-lg border">
        <div className="animate-pulse">Loading performance data...</div>
      </div>
    );
  }

  const { memory, budgets } = metrics;
  const currentMemory = memory?.current || {};
  const violations = metrics.metrics?.['budget-violations'] || [];

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-[80vh] overflow-y-auto bg-white rounded-lg shadow-lg border z-50">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            <h2 className="font-bold text-gray-900">Performance Monitor</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLive(!isLive)}
              className={`px-2 py-1 text-xs rounded ${
                isLive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {isLive ? 'Live' : 'Paused'}
            </button>
            <button
              onClick={refreshMetrics}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-4 space-y-4">
        {/* Startup Performance */}
        {metrics.electron?.startup?.totalStartupTime && (
          <MetricCard
            title="Startup Time"
            icon={Clock}
            value={metrics.electron.startup.totalStartupTime}
            unit="ms"
            budget={budgets?.startup}
            description="Total time from app launch to interactive"
          />
        )}

        {/* Memory Usage */}
        <MetricCard
          title="Memory Usage"
          icon={HardDrive}
          value={currentMemory.heapUsed}
          unit="MB"
          budget={budgets?.memoryBaseline}
          description="Current heap memory usage"
        />

        {/* Recent Render Performance */}
        {metrics.renders?.length > 0 && (
          <MetricCard
            title="Latest Render"
            icon={Cpu}
            value={metrics.renders[metrics.renders.length - 1]?.duration}
            unit="ms"
            budget={budgets?.renderFrame}
            description={`${metrics.renders[metrics.renders.length - 1]?.component} render time`}
          />
        )}

        {/* Memory Chart */}
        {memory?.snapshots && (
          <MemoryChart snapshots={memory.snapshots} />
        )}

        {/* Violations */}
        {violations.length > 0 && (
          <ViolationsList violations={violations} />
        )}

        {/* Performance Tips */}
        <div className="mt-4 p-3 bg-blue-50 rounded">
          <h4 className="font-medium text-blue-800 mb-1">💡 Tips</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Keep renders under 16ms for 60fps</li>
            <li>• Use React.memo for expensive components</li>
            <li>• Monitor memory growth for leaks</li>
            <li>• Optimize large list rendering</li>
          </ul>
        </div>

        {/* Debug Info */}
        {selectedMetric && (
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <h4 className="font-medium mb-2">Debug Info</h4>
            <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-x-auto">
              {JSON.stringify(metrics.metrics[selectedMetric], null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceDashboard;