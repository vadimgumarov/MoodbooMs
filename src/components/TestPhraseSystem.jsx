/**
 * Test component to demonstrate and verify the phrase configuration system
 */

import React, { useState, useEffect } from 'react';
import { getRandomPhrase, resetPhraseTracking, getUIText } from '../core/services/phrases/MigrationAdapter';
import phraseSystem from '../core/services/phrases';
import previewTool from '../core/services/phrases/PhrasePreviewTool';

function TestPhraseSystem() {
  const [initialized, setInitialized] = useState(false);
  const [testResults, setTestResults] = useState({});
  const [selectedMode, setSelectedMode] = useState('queen');
  const [selectedPhase, setSelectedPhase] = useState('menstrual');
  const [phrases, setPhrases] = useState([]);
  const [context, setContext] = useState({
    isWeekend: new Date().getDay() === 0 || new Date().getDay() === 6,
    isFirstDay: false,
    timePeriod: 'current'
  });

  useEffect(() => {
    // The migration adapter auto-initializes
    setTimeout(() => {
      setInitialized(true);
      runTests();
    }, 100);
  }, []);

  const runTests = () => {
    const results = {};
    
    // Test 1: Basic phrase retrieval
    try {
      const mood = getRandomPhrase('queen', 'menstrual', 'moods');
      results.basicRetrieval = { 
        status: 'pass', 
        message: `Got mood: "${mood.substring(0, 50)}..."` 
      };
    } catch (error) {
      results.basicRetrieval = { 
        status: 'fail', 
        message: error.message 
      };
    }

    // Test 2: Craving retrieval
    try {
      const craving = getRandomPhrase('queen', 'menstrual', 'cravings');
      results.cravingRetrieval = { 
        status: 'pass', 
        message: `Got craving: ${craving.icon} - ${craving.text}` 
      };
    } catch (error) {
      results.cravingRetrieval = { 
        status: 'fail', 
        message: error.message 
      };
    }

    // Test 3: UI text retrieval
    try {
      const uiText = getUIText('queen', 'tabs', 'mood');
      results.uiText = { 
        status: uiText ? 'pass' : 'warning', 
        message: `UI text: "${uiText || 'Not found'}"` 
      };
    } catch (error) {
      results.uiText = { 
        status: 'fail', 
        message: error.message 
      };
    }

    // Test 4: Phase coverage validation
    try {
      const coverage = previewTool.validateCoverage(selectedMode);
      results.coverage = { 
        status: coverage.valid ? 'pass' : 'warning', 
        message: coverage.valid 
          ? 'All phases have adequate coverage' 
          : `Issues: ${coverage.issues.join(', ')}` 
      };
    } catch (error) {
      results.coverage = { 
        status: 'fail', 
        message: error.message 
      };
    }

    // Test 5: Phrase distribution
    try {
      const distribution = previewTool.testDistribution(selectedMode, selectedPhase, 'moods', 20);
      results.distribution = { 
        status: 'pass', 
        message: `${distribution.totalUnique} unique phrases in 20 calls` 
      };
    } catch (error) {
      results.distribution = { 
        status: 'fail', 
        message: error.message 
      };
    }

    setTestResults(results);
  };

  const fetchPhrases = () => {
    const newPhrases = [];
    
    // Get 5 moods with different contexts
    for (let i = 0; i < 5; i++) {
      const contextOverride = i === 0 && context.isFirstDay 
        ? { isFirstDay: true }
        : i === 1 && context.isWeekend 
        ? { currentTime: new Date() }
        : {};
        
      const mood = getRandomPhrase(selectedMode, selectedPhase, 'moods');
      const craving = getRandomPhrase(selectedMode, selectedPhase, 'cravings');
      
      newPhrases.push({
        mood,
        craving,
        context: { ...context, ...contextOverride }
      });
    }
    
    setPhrases(newPhrases);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pass': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'fail': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (!initialized) {
    return <div className="p-4">Initializing phrase system...</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold mb-4">Phrase Configuration System Test</h2>
      
      {/* Test Results */}
      <div className="bg-gray-100 rounded-lg p-4">
        <h3 className="font-semibold mb-2">System Tests</h3>
        <div className="space-y-2">
          {Object.entries(testResults).map(([test, result]) => (
            <div key={test} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: getStatusColor(result.status) }}
              />
              <span className="text-sm">
                <strong>{test}:</strong> {result.message}
              </span>
            </div>
          ))}
        </div>
        <button
          onClick={runTests}
          className="mt-3 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          Re-run Tests
        </button>
      </div>

      {/* Interactive Test */}
      <div className="bg-gray-100 rounded-lg p-4">
        <h3 className="font-semibold mb-2">Interactive Phrase Test</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Mode</label>
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="w-full px-3 py-1 border rounded"
            >
              <option value="queen">Queen</option>
              <option value="king">King</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Phase</label>
            <select
              value={selectedPhase}
              onChange={(e) => setSelectedPhase(e.target.value)}
              className="w-full px-3 py-1 border rounded"
            >
              <option value="menstrual">Menstrual</option>
              <option value="follicular">Follicular</option>
              <option value="ovulation">Ovulation</option>
              <option value="luteal">Luteal</option>
              <option value="lateLuteal">Late Luteal</option>
              <option value="premenstrual">Premenstrual</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-4 mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={context.isFirstDay}
              onChange={(e) => setContext({ ...context, isFirstDay: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm">First Day</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={context.isWeekend}
              onChange={(e) => setContext({ ...context, isWeekend: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm">Weekend</span>
          </label>
        </div>

        <button
          onClick={fetchPhrases}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Get Phrases
        </button>

        {phrases.length > 0 && (
          <div className="mt-4 space-y-3">
            {phrases.map((item, index) => (
              <div key={index} className="border-l-4 border-purple-400 pl-3">
                <div className="text-sm">
                  <strong>Mood:</strong> {item.mood}
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Craving:</strong> {item.craving.icon} - {item.craving.text}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reset Options */}
      <div className="bg-gray-100 rounded-lg p-4">
        <h3 className="font-semibold mb-2">Management Options</h3>
        <div className="space-x-2">
          <button
            onClick={() => {
              resetPhraseTracking(selectedMode);
              alert(`Phrase history cleared for ${selectedMode} mode`);
            }}
            className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
          >
            Clear History
          </button>
          <button
            onClick={() => {
              const preview = previewTool.previewPhase(selectedMode, selectedPhase);
              console.log('Phase Preview:', preview);
              alert(`Phase preview logged to console. Total moods: ${preview?.totalMoods || 0}`);
            }}
            className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
          >
            Preview Phase
          </button>
        </div>
      </div>
    </div>
  );
}

export default TestPhraseSystem;