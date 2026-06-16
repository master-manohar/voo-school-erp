import React from 'react';
import { FiX, FiTerminal } from 'react-icons/fi';

export default function BuildPromptModal({ isOpen, onClose, title, prompt }) {
  if (!isOpen) return null;

  return (
    <div className="loading-screen" style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', zIndex: 9999 }}>
      <div className="glass-card" style={{ width: '90%', maxWidth: '600px', padding: 'var(--space-xl)', position: 'relative' }}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="btn btn-ghost btn-icon" 
          style={{ position: 'absolute', top: 'var(--space-md)', right: 'var(--space-md)' }}
        >
          <FiX size={24} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
          <div className="btn-icon-sm" style={{ background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiTerminal />
          </div>
          <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, margin: 0 }}>Build: {title}</h2>
        </div>

        {/* Modal Body */}
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
          This function is currently a skeleton in the interactive prototype. Once fully built, the backend will process the logic using the following system prompt constraint:
        </p>

        <div style={{ 
          background: '#000', 
          padding: 'var(--space-md)', 
          borderRadius: 'var(--radius-sm)', 
          border: '1px solid var(--glass-border)',
          fontFamily: 'monospace',
          color: '#10B981',
          lineHeight: 1.5,
          whiteSpace: 'pre-wrap',
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          {'>'} {prompt}
        </div>

        {/* Footer actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)', marginTop: 'var(--space-lg)' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary" onClick={() => {
            alert('This will trigger the AI code generation to build this module in the real application!');
            onClose();
          }}>
            Simulate Build
          </button>
        </div>

      </div>
    </div>
  );
}
