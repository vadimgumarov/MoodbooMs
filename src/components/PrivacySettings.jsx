import React, { useState, useEffect } from 'react';
import { Shield, Eye, BarChart, AlertCircle, ExternalLink } from 'lucide-react';

const PrivacySettings = ({ preferences, onUpdate }) => {
  const [analytics, setAnalytics] = useState(preferences?.analytics !== false);
  const [errorTracking, setErrorTracking] = useState(preferences?.errorTracking !== false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const changed = 
      analytics !== (preferences?.analytics !== false) ||
      errorTracking !== (preferences?.errorTracking !== false);
    setHasChanges(changed);
  }, [analytics, errorTracking, preferences]);

  const handleSave = () => {
    onUpdate({
      ...preferences,
      analytics,
      errorTracking,
    });
    setHasChanges(false);
  };

  const handleReset = () => {
    setAnalytics(preferences?.analytics !== false);
    setErrorTracking(preferences?.errorTracking !== false);
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 text-gray-700">
        <Shield className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Privacy Settings</h3>
      </div>

      {/* Privacy Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Eye className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Your privacy matters to us</p>
            <p className="text-blue-700">
              We never collect personal health data. All analytics are anonymous and help us improve the app. 
              You can opt out at any time.
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Toggle */}
      <div className="border rounded-lg p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            <BarChart className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
            <div>
              <label htmlFor="analytics" className="font-medium text-gray-900 cursor-pointer">
                Anonymous Usage Analytics
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Help us understand how the app is used to make improvements. No personal data is collected.
              </p>
              <div className="mt-2 text-xs text-gray-500">
                <p className="font-medium mb-1">What we collect:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Feature usage (e.g., "calendar viewed")</li>
                  <li>App performance metrics</li>
                  <li>Anonymous device information</li>
                </ul>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                <p className="font-medium mb-1">What we DON'T collect:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Your cycle data or health information</li>
                  <li>Personal identifiers (name, email, etc.)</li>
                  <li>Location data</li>
                </ul>
              </div>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              id="analytics"
              className="sr-only peer"
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Error Tracking Toggle */}
      <div className="border rounded-lg p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
            <div>
              <label htmlFor="errorTracking" className="font-medium text-gray-900 cursor-pointer">
                Automatic Error Reporting
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Automatically report app crashes and errors to help us fix issues quickly.
              </p>
              <div className="mt-2 text-xs text-gray-500">
                <p className="font-medium mb-1">What gets reported:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Error messages and stack traces</li>
                  <li>App version and platform</li>
                  <li>Anonymous session ID</li>
                </ul>
              </div>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              id="errorTracking"
              className="sr-only peer"
              checked={errorTracking}
              onChange={(e) => setErrorTracking(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Privacy Policy Link */}
      <div className="pt-2">
        <a 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            // In production, this would open the privacy policy
            if (window.electronAPI?.shell?.openExternal) {
              window.electronAPI.shell.openExternal('https://moodbooms.com/privacy');
            }
          }}
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
        >
          <span>Read our full Privacy Policy</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Save/Reset Buttons */}
      {hasChanges && (
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      )}

      {/* Data Rights */}
      <div className="border-t pt-4 mt-6">
        <h4 className="font-medium text-gray-900 mb-2">Your Data Rights</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <p>You have the right to:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Opt out of all data collection at any time</li>
            <li>Request deletion of any collected data</li>
            <li>Export your app data for portability</li>
            <li>Know exactly what data we collect and why</li>
          </ul>
          <p className="mt-3">
            For data requests or questions, contact us at privacy@moodbooms.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings;