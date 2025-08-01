/**
 * Calendar Module
 * 
 * Monthly calendar view with fertility tracking
 */

import React, { useState } from 'react';
import { useModules } from '../core/contexts';
import { MODULE_IDS } from '../core/modules/types';
import Calendar from '../components/Calendar/Calendar';
import PhaseDetail from '../components/PhaseDetail';

const CalendarModule = ({ cycleData, testMode, testDays }) => {
  const { isModuleEnabled } = useModules();
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Check if calendar module is enabled
  if (!isModuleEnabled(MODULE_IDS.CALENDAR)) {
    return null;
  }

  // Calculate the effective start date based on test mode
  const effectiveStartDate = testMode 
    ? new Date(new Date().getTime() - testDays * 24 * 60 * 60 * 1000) 
    : cycleData.startDate;

  return (
    <div className="space-y-4" role="tabpanel" id="calendar-panel" aria-labelledby="calendar-tab" tabIndex={0}>
      <Calendar 
        cycleStartDate={effectiveStartDate}
        cycleLength={cycleData.cycleLength}
        onDateSelect={setSelectedDate}
      />
      
      {/* PhaseDetail is conditional on both calendar being enabled AND phase detail module */}
      {selectedDate && isModuleEnabled(MODULE_IDS.PHASE_DETAIL) && (
        <div className="border-t pt-4">
          <PhaseDetail
            selectedDate={selectedDate}
            cycleStartDate={effectiveStartDate}
            cycleLength={cycleData.cycleLength}
          />
        </div>
      )}
    </div>
  );
};

export default CalendarModule;