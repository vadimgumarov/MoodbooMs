import React from 'react';
import { tokens } from '../../design-system';

function SpacingGuide() {
  const spacingValues = Object.entries(tokens.spacing).filter(([key]) => key !== '0');
  
  return (
    <div className="space-y-lg">
      <h2 className="text-title font-semibold text-text-primary">
        Spacing System
      </h2>
      
      <p className="text-body text-text-secondary">
        Based on a 4px baseline for consistent spacing throughout the application.
      </p>
      
      {/* Spacing Scale */}
      <div>
        <h3 className="text-heading font-medium text-text-primary mb-md">
          Spacing Scale
        </h3>
        <div className="space-y-sm">
          {spacingValues.map(([name, value]) => (
            <div key={name} className="flex items-center gap-md">
              <span className="text-small font-mono text-text-secondary w-12">
                {name}
              </span>
              <span className="text-small text-text-muted w-16">
                {value}
              </span>
              <div className="flex-1 flex items-center">
                <div 
                  className="bg-primary h-8"
                  style={{ width: value }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Spacing Examples */}
      <div>
        <h3 className="text-heading font-medium text-text-primary mb-md">
          Common Patterns
        </h3>
        
        <div className="grid md:grid-cols-2 gap-lg">
          {/* Padding Example */}
          <div>
            <h4 className="text-body font-medium text-text-primary mb-sm">
              Padding
            </h4>
            <div className="space-y-sm">
              <div className="bg-surface border border-border inline-block">
                <div className="p-sm bg-primary/20">
                  <div className="bg-primary text-white px-sm py-xs text-small">p-sm</div>
                </div>
              </div>
              <div className="bg-surface border border-border inline-block">
                <div className="p-md bg-primary/20">
                  <div className="bg-primary text-white px-sm py-xs text-small">p-md</div>
                </div>
              </div>
              <div className="bg-surface border border-border inline-block">
                <div className="p-lg bg-primary/20">
                  <div className="bg-primary text-white px-sm py-xs text-small">p-lg</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Gap Example */}
          <div>
            <h4 className="text-body font-medium text-text-primary mb-sm">
              Gap / Space Between
            </h4>
            <div className="space-y-md">
              <div>
                <p className="text-tiny text-text-muted mb-xs">gap-sm</p>
                <div className="flex gap-sm">
                  <div className="bg-primary h-8 w-12 rounded" />
                  <div className="bg-primary h-8 w-12 rounded" />
                  <div className="bg-primary h-8 w-12 rounded" />
                </div>
              </div>
              <div>
                <p className="text-tiny text-text-muted mb-xs">gap-md</p>
                <div className="flex gap-md">
                  <div className="bg-primary h-8 w-12 rounded" />
                  <div className="bg-primary h-8 w-12 rounded" />
                  <div className="bg-primary h-8 w-12 rounded" />
                </div>
              </div>
              <div>
                <p className="text-tiny text-text-muted mb-xs">gap-lg</p>
                <div className="flex gap-lg">
                  <div className="bg-primary h-8 w-12 rounded" />
                  <div className="bg-primary h-8 w-12 rounded" />
                  <div className="bg-primary h-8 w-12 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Usage Guidelines */}
      <div className="bg-background p-md rounded border border-border">
        <h4 className="text-body font-medium text-text-primary mb-sm">
          Usage Guidelines
        </h4>
        <ul className="space-y-xs text-small text-text-secondary">
          <li>• Use <code className="font-mono text-accent">xs</code> (4px) for tight spacing between related elements</li>
          <li>• Use <code className="font-mono text-accent">sm</code> (8px) for spacing within components</li>
          <li>• Use <code className="font-mono text-accent">md</code> (16px) for general component padding</li>
          <li>• Use <code className="font-mono text-accent">lg</code> (24px) for section spacing</li>
          <li>• Use <code className="font-mono text-accent">xl</code> (32px) and above for major layout divisions</li>
        </ul>
      </div>
    </div>
  );
}

export default SpacingGuide;