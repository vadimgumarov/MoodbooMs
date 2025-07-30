import React, { useState } from 'react';

function ComponentExamples() {
  const [toggleState, setToggleState] = useState(false);
  const [selectedTab, setSelectedTab] = useState('tab1');
  
  return (
    <div className="space-y-xl">
      <h2 className="text-title font-semibold text-text-primary">
        Component Patterns
      </h2>
      
      {/* Buttons */}
      <section>
        <h3 className="text-heading font-medium text-text-primary mb-md">
          Buttons
        </h3>
        <div className="space-y-md">
          <div className="flex flex-wrap gap-md">
            <button className="px-md py-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
              Primary Button
            </button>
            <button className="px-md py-sm bg-surface text-text-primary border border-border rounded-md hover:bg-background transition-colors">
              Secondary Button
            </button>
            <button className="px-md py-sm bg-error text-white rounded-md hover:opacity-90 transition-opacity">
              Danger Button
            </button>
            <button className="px-md py-sm bg-surface text-text-muted border border-border rounded-md opacity-50 cursor-not-allowed" disabled>
              Disabled Button
            </button>
          </div>
          <div className="bg-background p-sm rounded border border-border">
            <code className="text-tiny font-mono text-accent">
              className="px-md py-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
            </code>
          </div>
        </div>
      </section>
      
      {/* Form Elements */}
      <section>
        <h3 className="text-heading font-medium text-text-primary mb-md">
          Form Elements
        </h3>
        <div className="space-y-md max-w-md">
          <div>
            <label className="text-small font-medium text-text-primary block mb-xs">
              Text Input
            </label>
            <input
              type="text"
              placeholder="Enter text..."
              className="w-full px-sm py-xs border border-border rounded bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary"
            />
          </div>
          
          <div>
            <label className="text-small font-medium text-text-primary block mb-xs">
              Select
            </label>
            <select className="w-full px-sm py-xs border border-border rounded bg-surface text-text-primary focus:outline-none focus:border-primary">
              <option>Option 1</option>
              <option>Option 2</option>
              <option>Option 3</option>
            </select>
          </div>
          
          <div className="flex items-center gap-sm">
            <input type="checkbox" id="checkbox" className="rounded" />
            <label htmlFor="checkbox" className="text-small text-text-primary">
              Checkbox label
            </label>
          </div>
        </div>
      </section>
      
      {/* Toggle Switch */}
      <section>
        <h3 className="text-heading font-medium text-text-primary mb-md">
          Toggle Switch
        </h3>
        <div className="space-y-md">
          <button
            onClick={() => setToggleState(!toggleState)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              toggleState ? 'bg-primary' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                toggleState ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <p className="text-small text-text-secondary">
            State: {toggleState ? 'On' : 'Off'}
          </p>
        </div>
      </section>
      
      {/* Cards */}
      <section>
        <h3 className="text-heading font-medium text-text-primary mb-md">
          Cards
        </h3>
        <div className="grid md:grid-cols-2 gap-md">
          <div className="bg-surface p-md rounded-lg shadow-sm border border-border">
            <h4 className="text-body font-semibold text-text-primary mb-sm">
              Basic Card
            </h4>
            <p className="text-small text-text-secondary">
              A simple card with padding, border, and subtle shadow.
            </p>
          </div>
          
          <div className="bg-surface p-md rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h4 className="text-body font-semibold text-text-primary mb-sm">
              Interactive Card
            </h4>
            <p className="text-small text-text-secondary mb-md">
              Hover to see shadow transition.
            </p>
            <button className="text-small text-primary hover:text-primary-dark">
              Learn more →
            </button>
          </div>
        </div>
      </section>
      
      {/* Tabs */}
      <section>
        <h3 className="text-heading font-medium text-text-primary mb-md">
          Tab Navigation
        </h3>
        <div>
          <div className="flex border-b border-border">
            {['tab1', 'tab2', 'tab3'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-md py-sm text-small font-medium transition-colors ${
                  selectedTab === tab
                    ? 'text-primary border-b-2 border-primary -mb-px'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Tab {tab.slice(-1)}
              </button>
            ))}
          </div>
          <div className="p-md bg-surface rounded-b">
            <p className="text-body text-text-secondary">
              Content for {selectedTab}
            </p>
          </div>
        </div>
      </section>
      
      {/* Alerts */}
      <section>
        <h3 className="text-heading font-medium text-text-primary mb-md">
          Alerts / Messages
        </h3>
        <div className="space-y-sm">
          <div className="p-sm rounded bg-green-50 border border-green-200 text-green-800">
            <p className="text-small font-medium">Success!</p>
            <p className="text-small">Your changes have been saved.</p>
          </div>
          
          <div className="p-sm rounded bg-yellow-50 border border-yellow-200 text-yellow-800">
            <p className="text-small font-medium">Warning</p>
            <p className="text-small">Please review before proceeding.</p>
          </div>
          
          <div className="p-sm rounded bg-red-50 border border-red-200 text-red-800">
            <p className="text-small font-medium">Error</p>
            <p className="text-small">Something went wrong.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ComponentExamples;