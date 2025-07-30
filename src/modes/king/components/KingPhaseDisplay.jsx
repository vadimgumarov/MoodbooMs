import React from 'react';
import { 
  AlertTriangle, 
  Shield, 
  AlertOctagon, 
  ShieldAlert,
  Activity,
  TrendingUp,
  TrendingDown,
  Gauge,
  Coffee, 
  Cookie, 
  IceCream, 
  Candy, 
  Soup, 
  Apple, 
  Fish, 
  Salad, 
  Milk, 
  Cherry, 
  Wheat, 
  Carrot, 
  Egg, 
  Nut, 
  Banana
} from 'lucide-react';
import { kingPhrases, kingPhaseNames } from '../config/phrases';
import { getPhaseColor, getDangerLevel } from '../config/theme';
import { getAlertLevel, getMoodIndicator } from '../config/personality';

const foodIconMap = {
  'Coffee': Coffee,
  'Cookie': Cookie,
  'IceCream': IceCream,
  'Candy': Candy,
  'Soup': Soup,
  'Apple': Apple,
  'Fish': Fish,
  'Salad': Salad,
  'Milk': Milk,
  'Cherry': Cherry,
  'Wheat': Wheat,
  'Carrot': Carrot,
  'Egg': Egg,
  'Nut': Nut,
  'Banana': Banana
};

const KingPhaseDisplay = ({ phase, mood, craving, fertility }) => {
  const phaseKey = phase.phase;
  const phaseData = kingPhrases[phaseKey];
  const phaseName = kingPhaseNames[phaseKey];
  
  // Add safety checks
  if (!phaseData) {
    console.error('KingPhaseDisplay: Invalid phase key:', phaseKey);
    return <div>Error: Invalid phase</div>;
  }
  
  const dangerLevel = getDangerLevel(phaseKey);
  const alertLevel = getAlertLevel(phaseKey);
  const phaseColor = getPhaseColor(phaseKey);
  
  // Get craving icon
  const CravingIcon = craving && foodIconMap[craving.icon] ? foodIconMap[craving.icon] : Coffee;
  
  // Calculate threat level based on phase
  const threatLevelMap = {
    menstrual: 95,
    follicular: 20,
    ovulation: 40,
    luteal: 60,
    lateLuteal: 75,
    premenstrual: 90
  };
  const threatLevel = threatLevelMap[phaseKey] || 50;
  
  return (
    <div className="space-y-3">
      {/* Threat Assessment Card */}
      <div className="rounded-lg overflow-hidden" style={{ 
        backgroundColor: 'var(--king-surface)',
        border: `2px solid ${phaseColor}`
      }}>
        {/* Header */}
        <div className="p-3" style={{ backgroundColor: phaseColor }}>
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <ShieldAlert size={20} />
              <span className="font-bold text-small">THREAT ASSESSMENT</span>
            </div>
            <span className="text-tiny font-medium px-2 py-1 rounded bg-black bg-opacity-20">
              {alertLevel.toUpperCase()}
            </span>
          </div>
        </div>
        
        {/* Phase Info */}
        <div className="p-4">
          <h3 className="text-heading font-bold mb-2" style={{ color: phaseColor }}>
            {phaseName}
          </h3>
          <p className="text-small mb-3" style={{ color: 'var(--king-text-secondary)' }}>
            {phaseData.description}
          </p>
          
          {/* Threat Meter */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-tiny font-medium" style={{ color: 'var(--king-text-secondary)' }}>
                THREAT LEVEL
              </span>
              <span className="text-small font-bold" style={{ color: phaseColor }}>
                {threatLevel}%
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--king-card)' }}>
              <div 
                className="h-full transition-all duration-500 rounded-full"
                style={{ 
                  width: `${threatLevel}%`,
                  backgroundColor: phaseColor
                }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Status Report */}
      <div className="grid grid-cols-2 gap-3">
        {/* Current Situation */}
        <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--king-surface)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Activity size={16} style={{ color: 'var(--king-warning)' }} />
            <span className="text-tiny font-medium" style={{ color: 'var(--king-text-secondary)' }}>
              SITUATION REPORT
            </span>
          </div>
          <p className="text-small" style={{ color: 'var(--king-text)' }}>
            {mood}
          </p>
        </div>
        
        {/* Mood Indicator */}
        <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--king-surface)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Gauge size={16} style={{ color: 'var(--king-accent)' }} />
            <span className="text-tiny font-medium" style={{ color: 'var(--king-text-secondary)' }}>
              MOOD STATUS
            </span>
          </div>
          <p className="text-small font-medium" style={{ color: 'var(--king-text)' }}>
            {getMoodIndicator(phaseKey)}
          </p>
        </div>
      </div>
      
      {/* Strategic Response */}
      <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--king-surface)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Shield size={18} style={{ color: 'var(--king-secondary)' }} />
          <span className="text-small font-bold" style={{ color: 'var(--king-text)' }}>
            STRATEGIC RESPONSE
          </span>
        </div>
        
        {/* Recommended Action */}
        {craving && (
          <div className="flex items-center gap-3 p-3 rounded" style={{ 
            backgroundColor: 'var(--king-card)',
            border: '1px solid var(--king-border)'
          }}>
            <CravingIcon size={20} style={{ color: 'var(--king-accent)' }} />
            <div className="flex-1">
              <p className="text-tiny font-medium mb-1" style={{ color: 'var(--king-text-secondary)' }}>
                PRIORITY OFFERING
              </p>
              <p className="text-small" style={{ color: 'var(--king-text)' }}>
                {craving.text}
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Critical Alert for dangerous phases */}
      {(phaseKey === 'menstrual' || phaseKey === 'premenstrual') && (
        <div className="p-3 rounded-lg border-2 animate-pulse" style={{ 
          backgroundColor: 'rgba(220, 38, 38, 0.1)',
          borderColor: 'var(--king-danger)'
        }}>
          <div className="flex items-center gap-2">
            <AlertOctagon size={20} style={{ color: 'var(--king-danger)' }} />
            <div className="flex-1">
              <p className="text-small font-bold" style={{ color: 'var(--king-danger)' }}>
                ⚠️ HIGH ALERT STATUS
              </p>
              <p className="text-tiny mt-1" style={{ color: 'var(--king-text)' }}>
                Exercise extreme caution. Deploy emergency snack reserves.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KingPhaseDisplay;