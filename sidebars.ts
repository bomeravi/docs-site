import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';
import fs from 'fs';
import path from 'path';

// Runs in Node.js at build time — no browser APIs or JSX.
// Edit dev-docs/_sidebar.md to control sidebar order for both Docsify and Docusaurus.

type SidebarEntry =
  | string
  | {type: 'doc'; id: string; label: string}
  | {type: 'category'; label: string; items: SidebarEntry[]};

function parseSidebarMd(filePath: string): SidebarEntry[] {
  const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
  const result: SidebarEntry[] = [];
  const containers: Record<number, SidebarEntry[]> = {[-1]: result};

  for (const line of lines) {
    if (!line.trim().startsWith('-')) continue;

    const spaces = line.match(/^(\s*)/)?.[1].length ?? 0;
    const level = spaces / 2;
    const text = line.trim().slice(1).trim();
    const linkMatch = text.match(/^\[(.+?)\]\((.+?)\)$/);
    const parent = containers[level - 1];

    if (!parent) continue;

    if (linkMatch) {
      // Docusaurus strips leading numeric prefix (e.g. "01-") from filename IDs
      const segments = linkMatch[2].replace(/^\//, '').replace(/\.md$/i, '').split('/');
      segments[segments.length - 1] = segments[segments.length - 1].replace(/^\d+-/, '');
      // Use the label from _sidebar.md so "Overview", "Git Setup", etc. appear exactly as written
      parent.push({type: 'doc', id: segments.join('/'), label: linkMatch[1]});
    } else {
      const items: SidebarEntry[] = [];
      parent.push({type: 'category', label: text, items});
      containers[level] = items;
    }
  }

  return result;
}

const sidebars: SidebarsConfig = {
  tutorialSidebar: parseSidebarMd(path.resolve('docs/_sidebar.md')),
};

export default sidebars;
