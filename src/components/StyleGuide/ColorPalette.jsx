import React from 'react';
import { tokens } from '../../design-system';
import { useMode } from '../../core/contexts/SimpleModeContext';

function ColorPalette() {
  const { currentMode } = useMode();
  const theme = tokens.themes[currentMode];
  
  const colorGroups = [
    {
      title: 'Primary Colors',
      colors: [
        { name: 'Primary', var: '--color-primary', value: theme.colors.primary },
        { name: 'Primary Light', var: '--color-primary-light', value: theme.colors.primaryLight },
        { name: 'Primary Dark', var: '--color-primary-dark', value: theme.colors.primaryDark },
      ]
    },
    {
      title: 'UI Colors',
      colors: [
        { name: 'Background', var: '--color-background', value: theme.colors.background },
        { name: 'Surface', var: '--color-surface', value: theme.colors.surface },
        { name: 'Border', var: '--color-border', value: theme.colors.border },
        { name: 'Accent', var: '--color-accent', value: theme.colors.accent },
      ]
    },
    {
      title: 'Text Colors',
      colors: [
        { name: 'Text Primary', var: '--color-text-primary', value: theme.colors.text.primary },
        { name: 'Text Secondary', var: '--color-text-secondary', value: theme.colors.text.secondary },
        { name: 'Text Muted', var: '--color-text-muted', value: theme.colors.text.muted },
      ]
    },
    {
      title: 'Semantic Colors',
      colors: [
        { name: 'Success', var: '--color-success', value: theme.colors.success },
        { name: 'Warning', var: '--color-warning', value: theme.colors.warning },
        { name: 'Error', var: '--color-error', value: theme.colors.error },
      ]
    },
    {
      title: 'Cycle Phase Colors',
      colors: Object.entries(tokens.phaseColors).map(([phase, color]) => ({
        name: phase.charAt(0).toUpperCase() + phase.slice(1),
        value: color,
        direct: true
      }))
    }
  ];
  
  return (
    <div className="space-y-lg">
      <h2 className="text-title font-semibold text-text-primary">
        Color Palette - {currentMode === 'queen' ? 'Queen' : 'King'} Mode
      </h2>
      
      {colorGroups.map(group => (
        <div key={group.title}>
          <h3 className="text-heading font-medium text-text-primary mb-md">
            {group.title}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-md">
            {group.colors.map(color => (
              <ColorSwatch key={color.name} {...color} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ColorSwatch({ name, var: cssVar, value, direct }) {
  return (
    <div className="space-y-xs">
      <div 
        className="h-16 rounded-md shadow-sm border border-border"
        style={{ backgroundColor: value }}
      />
      <div className="text-small">
        <p className="font-medium text-text-primary">{name}</p>
        {cssVar && (
          <p className="text-tiny text-text-muted font-mono">
            var({cssVar})
          </p>
        )}
        <p className="text-tiny text-text-secondary">{value}</p>
      </div>
    </div>
  );
}

export default ColorPalette;