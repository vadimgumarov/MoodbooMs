/**
 * History Module
 * 
 * Cycle history tracking and statistics
 */

import React from 'react';
import { useModules } from '../core/contexts';
import { MODULE_IDS } from '../core/modules/types';
import HistoryView from '../components/HistoryView';

const HistoryModule = ({ cycleHistory, currentCycleStart, onPeriodStart }) => {
  const { isModuleEnabled } = useModules();
  
  // Check if history module is enabled
  if (!isModuleEnabled(MODULE_IDS.HISTORY)) {
    return null;
  }

  return (
    <div role="tabpanel" id="history-panel" aria-labelledby="history-tab" tabIndex={0}>
      <HistoryView 
        cycleHistory={cycleHistory}
        currentCycleStart={currentCycleStart}
        onPeriodStart={onPeriodStart}
      />
    </div>
  );
};

export default HistoryModule;