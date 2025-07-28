import { useState, useEffect, useCallback } from 'react';
import { useStore } from './useStore';
import { 
  calculateCurrentDay, 
  getCurrentPhase, 
  getFertilityLevel,
  predictNextPeriod 
} from '../utils/cycleCalculations';
import { getDetailedPhaseInfo } from '../utils/phaseDetection';
import { addCycleToHistory } from '../utils/cycleHistory';

/**
 * Custom hook to manage cycle data and calculations
 * Provides a high-level interface for cycle tracking functionality
 */
export function useCycleData() {
  const { value: cycleData, setValue: setCycleData, loading: cycleLoading } = useStore('cycleData', {
    startDate: null,
    cycleLength: 28,
    history: []
  });

  const [currentDay, setCurrentDay] = useState(1);
  const [currentPhase, setCurrentPhase] = useState('');
  const [fertilityLevel, setFertilityLevel] = useState('');
  const [detailedPhaseInfo, setDetailedPhaseInfo] = useState(null);
  const [nextPeriodDate, setNextPeriodDate] = useState(null);

  // Calculate cycle information whenever data changes
  useEffect(() => {
    if (!cycleData?.startDate || cycleLoading) return;

    const startDate = new Date(cycleData.startDate);
    const today = new Date();
    
    // Calculate current day in cycle
    const day = calculateCurrentDay(startDate, today, cycleData.cycleLength);
    setCurrentDay(day);

    // Get phase information
    const phase = getCurrentPhase(day, cycleData.cycleLength);
    setCurrentPhase(phase);

    // Get fertility level
    const fertility = getFertilityLevel(day, cycleData.cycleLength);
    setFertilityLevel(fertility);

    // Get detailed phase info
    const detailed = getDetailedPhaseInfo(day, cycleData.cycleLength);
    setDetailedPhaseInfo(detailed);

    // Calculate next period date
    const nextPeriod = predictNextPeriod(startDate, cycleData.cycleLength);
    setNextPeriodDate(nextPeriod);
  }, [cycleData, cycleLoading]);

  // Update cycle start date
  const updateStartDate = useCallback(async (newStartDate) => {
    const updatedData = {
      ...cycleData,
      startDate: newStartDate instanceof Date ? newStartDate.toISOString() : newStartDate
    };
    await setCycleData(updatedData);
  }, [cycleData, setCycleData]);

  // Update cycle length
  const updateCycleLength = useCallback(async (newLength) => {
    const updatedData = {
      ...cycleData,
      cycleLength: newLength
    };
    await setCycleData(updatedData);
  }, [cycleData, setCycleData]);

  // Mark new period start
  const markNewPeriodStart = useCallback(async (newStartDate) => {
    const startDate = newStartDate instanceof Date ? newStartDate : new Date(newStartDate);
    
    // Add current cycle to history if we have a previous start date
    if (cycleData.startDate) {
      const updatedHistory = addCycleToHistory(
        cycleData.history || [],
        cycleData.startDate,
        cycleData.cycleLength
      );
      
      const updatedData = {
        ...cycleData,
        startDate: startDate.toISOString(),
        history: updatedHistory
      };
      
      await setCycleData(updatedData);
    } else {
      // First time setup
      await updateStartDate(startDate);
    }
  }, [cycleData, setCycleData, updateStartDate]);

  // Get cycle progress percentage
  const getCycleProgress = useCallback(() => {
    if (!cycleData?.cycleLength) return 0;
    return Math.round((currentDay / cycleData.cycleLength) * 100);
  }, [currentDay, cycleData]);

  // Get days until next period
  const getDaysUntilNextPeriod = useCallback(() => {
    if (!cycleData?.cycleLength) return 0;
    return cycleData.cycleLength - currentDay + 1;
  }, [currentDay, cycleData]);

  return {
    // Data
    cycleData,
    currentDay,
    currentPhase,
    fertilityLevel,
    detailedPhaseInfo,
    nextPeriodDate,
    
    // Actions
    updateStartDate,
    updateCycleLength,
    markNewPeriodStart,
    
    // Computed values
    getCycleProgress,
    getDaysUntilNextPeriod,
    
    // State
    loading: cycleLoading,
    isInitialized: !!cycleData?.startDate
  };
}