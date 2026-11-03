import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { SafeMarkdown } from '../components/SafeMarkdown';

describe('PHASE 5: Security Audit - SafeMarkdown XSS Mitigation', () => {
  it('renders standard Markdown headings and formatting properly', () => {
    const content = '## Water Report Findings\n\n**Urgent:** Safe drinking water compromised across *14 wards*.\n\n`pH level: 9.4`';
    render(React.createElement(SafeMarkdown, { content }));

    expect(screen.getByText('Water Report Findings')).toBeDefined();
    expect(screen.getByText('Urgent:')).toBeDefined();
    expect(screen.getByText('14 wards')).toBeDefined();
    expect(screen.getByText('pH level: 9.4')).toBeDefined();
  });

  it('escapes malicious script tags and does not execute arbitrary JavaScript', () => {
    const malicious = 'Test content <script>alert("xss")</script><img src=x onerror=alert(1)>';
    const { container } = render(React.createElement(SafeMarkdown, { content: malicious }));

    // Script tags must not be rendered as HTML elements
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
  });

  it('blocks dangerous javascript: pseudo-protocol in links', () => {
    const maliciousLink = '[Click for report](javascript:alert("hacked"))';
    const { container } = render(React.createElement(SafeMarkdown, { content: maliciousLink }));

    // Must not create an anchor with javascript: href
    const anchor = container.querySelector('a');
    expect(anchor).toBeNull();
  });

  it('permits safe https: and bzz: links', () => {
    const safeContent = '[Swarm Gateway](https://gateway.ethswarm.org) and [Native Feed](bzz://0xfcad/water)';
    const { container } = render(React.createElement(SafeMarkdown, { content: safeContent }));

    const anchors = container.querySelectorAll('a');
    expect(anchors.length).toBe(2);
    expect(anchors[0].getAttribute('href')).toBe('https://gateway.ethswarm.org');
    expect(anchors[1].getAttribute('href')).toBe('bzz://0xfcad/water');
  });
});
