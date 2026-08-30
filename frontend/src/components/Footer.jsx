import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <strong style={{ color: 'var(--text-primary)' }}>ASCLEPIUS</strong> — Biomedical Relationship Intelligence Platform
        </div>
        <div className="footer-sources">
          <span>Open Targets</span>
          <span>·</span>
          <span>ChEMBL</span>
        </div>
      </div>
    </footer>
  );
}
