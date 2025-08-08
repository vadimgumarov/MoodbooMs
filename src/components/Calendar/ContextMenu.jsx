import React, { useEffect, useRef } from 'react';
import { Calendar, Edit, Bell, Copy, DropletIcon } from 'lucide-react';
import { format } from 'date-fns';

const ContextMenu = ({ 
  date, 
  x, 
  y, 
  onClose, 
  onMarkPeriodStart,
  onAddNote,
  onSetReminder,
  onCopyDate,
  hasNote = false 
}) => {
  const menuRef = useRef(null);

  // Position menu to avoid screen edges
  useEffect(() => {
    if (!menuRef.current) return;
    
    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    let adjustedX = x;
    let adjustedY = y;
    
    // Adjust horizontal position
    if (x + rect.width > windowWidth - 20) {
      adjustedX = windowWidth - rect.width - 20;
    }
    if (adjustedX < 20) {
      adjustedX = 20;
    }
    
    // Adjust vertical position
    if (y + rect.height > windowHeight - 20) {
      adjustedY = y - rect.height;
    }
    if (adjustedY < 20) {
      adjustedY = 20;
    }
    
    menu.style.left = `${adjustedX}px`;
    menu.style.top = `${adjustedY}px`;
  }, [x, y]);

  // Handle clicks outside menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleMarkPeriodStart = () => {
    onMarkPeriodStart(date);
    onClose();
  };

  const handleAddNote = () => {
    onAddNote(date);
    onClose();
  };

  const handleSetReminder = () => {
    onSetReminder(date);
    onClose();
  };

  const handleCopyDate = async () => {
    const dateString = format(date, 'MM/dd/yyyy');
    try {
      await navigator.clipboard.writeText(dateString);
      console.log('Date copied to clipboard:', dateString);
    } catch (err) {
      console.error('Failed to copy date:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = dateString;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    onCopyDate(dateString);
    onClose();
  };

  const menuItems = [
    {
      icon: DropletIcon,
      label: 'Mark as Period Start',
      action: handleMarkPeriodStart,
      className: 'text-error hover:bg-error/10'
    },
    {
      icon: Edit,
      label: hasNote ? 'Edit Note' : 'Add Note',
      action: handleAddNote,
      className: 'text-primary hover:bg-primary/10'
    },
    {
      icon: Bell,
      label: 'Set Reminder',
      action: handleSetReminder,
      className: 'text-warning hover:bg-warning/10'
    },
    {
      icon: Copy,
      label: 'Copy Date',
      action: handleCopyDate,
      className: 'text-text-secondary hover:bg-surface'
    }
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl py-2 min-w-48 animate-in fade-in-50 zoom-in-95 duration-200"
      style={{
        left: x,
        top: y
      }}
      role="menu"
      aria-label={`Context menu for ${format(date, 'EEEE, MMMM d, yyyy')}`}
    >
      {/* Menu Header */}
      <div className="px-3 py-2 border-b border-gray-100">
        <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
          <Calendar className="w-4 h-4" />
          {format(date, 'MMM d, yyyy')}
        </div>
      </div>
      
      {/* Menu Items */}
      <div className="py-1">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={item.action}
              className={`w-full px-3 py-2 flex items-center gap-3 text-sm transition-colors ${item.className} text-left hover:bg-opacity-10`}
              role="menuitem"
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ContextMenu;