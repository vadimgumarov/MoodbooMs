import React from 'react';
import { Contrast } from 'lucide-react';

const HighContrastToggle = ({ enabled, onChange }) => {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <span className="text-small text-text-secondary">High Contrast</span>
      <button
        role="switch"
        aria-checked={enabled}
        aria-label="Toggle high contrast mode"
        onClick={(e) => {
          e.preventDefault();
          onChange(!enabled);
        }}
        className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors ${
          enabled ? 'bg-primary' : 'bg-border'
        }`}
      >
        <span
          className={`${
            enabled ? 'translate-x-5' : 'translate-x-1'
          } inline-block h-4 w-4 transform rounded-full bg-white transition`}
        />
      </button>
      <Contrast className="w-4 h-4 text-text-secondary" aria-hidden="true" />
    </label>
  );
};

export default HighContrastToggle;