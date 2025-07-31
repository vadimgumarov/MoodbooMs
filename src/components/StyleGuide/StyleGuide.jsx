import React, { useState } from 'react';
import { useMode } from '../../core/contexts/SimpleModeContext';
import { tokens } from '../../design-system';
import ColorPalette from './ColorPalette';
import TypographyShowcase from './TypographyShowcase';
import SpacingGuide from './SpacingGuide';
import ComponentExamples from './ComponentExamples';

/**
 * Interactive Style Guide
 * Shows all design tokens and patterns in use
 */
function StyleGuide() {
  const { currentMode, toggleMode } = useMode();
  const [activeTab, setActiveTab] = useState('colors');
  
  const tabs = [
    { id: 'colors', label: 'Colors' },
    { id: 'typography', label: 'Typography' },
    { id: 'spacing', label: 'Spacing' },
    { id: 'components', label: 'Components' },
  ];
  
  return (
    <div className="p-lg min-h-screen bg-background">
      {/* Header */}
      <div className="mb-xl">
        <h1 className="text-display font-bold text-text-primary mb-sm">
          MoodBooMs Style Guide
        </h1>
        <p className="text-body text-text-secondary mb-md">
          Design tokens and component patterns
        </p>
        
        {/* Mode Toggle */}
        <div className="flex items-center gap-md">
          <span className="text-small text-text-secondary">Current Mode:</span>
          <button
            onClick={toggleMode}
            className="px-md py-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
          >
            {currentMode === 'queen' ? '👑 Queen Mode' : '🤴 King Mode'}
          </button>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex gap-sm mb-lg border-b border-border">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-md py-sm text-body font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-primary border-b-2 border-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      
      {/* Content */}
      <div className="bg-surface rounded-lg p-lg">
        {activeTab === 'colors' && <ColorPalette />}
        {activeTab === 'typography' && <TypographyShowcase />}
        {activeTab === 'spacing' && <SpacingGuide />}
        {activeTab === 'components' && <ComponentExamples />}
      </div>
    </div>
  );
}

export default StyleGuide;