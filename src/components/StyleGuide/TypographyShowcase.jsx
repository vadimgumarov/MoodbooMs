import React from 'react';
import { tokens } from '../../design-system';

function TypographyShowcase() {
  const textSamples = [
    {
      name: 'Display',
      className: 'text-display',
      size: '2.5rem (40px)',
      weight: '700 (bold)',
      sample: 'The quick brown fox',
      usage: 'Major headings, hero text'
    },
    {
      name: 'Title',
      className: 'text-title',
      size: '1.875rem (30px)',
      weight: '600 (semibold)',
      sample: 'The quick brown fox jumps',
      usage: 'Section titles, page headers'
    },
    {
      name: 'Heading',
      className: 'text-heading',
      size: '1.25rem (20px)',
      weight: '600 (semibold)',
      sample: 'The quick brown fox jumps over',
      usage: 'Component headings, subsections'
    },
    {
      name: 'Body',
      className: 'text-body',
      size: '1rem (16px)',
      weight: '400 (normal)',
      sample: 'The quick brown fox jumps over the lazy dog',
      usage: 'Main content, paragraphs'
    },
    {
      name: 'Small',
      className: 'text-small',
      size: '0.875rem (14px)',
      weight: '400 (normal)',
      sample: 'The quick brown fox jumps over the lazy dog',
      usage: 'Secondary text, captions'
    },
    {
      name: 'Tiny',
      className: 'text-tiny',
      size: '0.75rem (12px)',
      weight: '400 (normal)',
      sample: 'The quick brown fox jumps over the lazy dog',
      usage: 'Labels, metadata'
    }
  ];
  
  return (
    <div className="space-y-lg">
      <h2 className="text-title text-text-primary mb-lg">
        Typography Scale
      </h2>
      
      {/* Font Family */}
      <div className="mb-xl">
        <h3 className="text-heading text-text-primary mb-md">
          Font Family
        </h3>
        <div className="bg-background p-md rounded border border-border">
          <p className="text-body text-text-secondary mb-sm">Sans-serif (System fonts):</p>
          <code className="text-tiny text-text-muted font-mono block">
            {tokens.typography.fontFamily.sans}
          </code>
        </div>
      </div>
      
      {/* Type Scale */}
      <div>
        <h3 className="text-heading text-text-primary mb-md">
          Type Scale
        </h3>
        <div className="space-y-md">
          {textSamples.map(sample => (
            <div key={sample.name} className="border-b border-border pb-md">
              <div className="flex flex-col lg:flex-row lg:items-baseline lg:justify-between gap-md">
                <div className="flex-1">
                  <p className={`${sample.className} text-text-primary`}>
                    {sample.sample}
                  </p>
                </div>
                <div className="flex-shrink-0 text-small text-text-secondary">
                  <span className="font-medium">{sample.name}</span>
                  <span className="mx-sm">•</span>
                  <span>{sample.size}</span>
                  <span className="mx-sm">•</span>
                  <span>Weight {sample.weight}</span>
                </div>
              </div>
              <p className="text-tiny text-text-muted mt-xs">
                Usage: {sample.usage}
              </p>
              <code className="text-tiny font-mono text-accent mt-xs inline-block">
                className="{sample.className}"
              </code>
            </div>
          ))}
        </div>
      </div>
      
      {/* Font Weights */}
      <div>
        <h3 className="text-heading text-text-primary mb-md">
          Font Weights
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
          {[
            { name: 'normal', value: '400' },
            { name: 'medium', value: '500' },
            { name: 'semibold', value: '600' },
            { name: 'bold', value: '700' }
          ].map(({ name, value }) => (
            <div key={name} className="text-center">
              <p 
                className="text-body text-text-primary mb-xs"
                style={{ fontWeight: value }}
              >
                Aa
              </p>
              <p className="text-small text-text-secondary capitalize">{name}</p>
              <p className="text-tiny text-text-muted">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TypographyShowcase;