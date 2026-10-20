/**
 * Give headings the same id docsify would, so in-page links written for the
 * docsify site (e.g. `#_1-install`, `#part-a-surviving-an-az-outage`) also
 * work here. Mirrors docsify@4 `slugify` applied to marked's heading HTML.
 */

// Same punctuation set docsify strips.
const PUNCTUATION = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g;

// marked HTML-escapes heading text before docsify slugifies it.
const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

function headingText(node) {
  if (node.type === 'html' || node.type.startsWith('mdx')) return '';
  if (typeof node.value === 'string') return node.value;
  return (node.children || []).map(headingText).join('');
}

function docsifySlug(text) {
  return text
    .replace(/[&<>"']/g, (c) => ESCAPES[c])
    .trim()
    .toLowerCase()
    .replace(PUNCTUATION, '')
    .replace(/\s/g, '-')
    .replace(/-+/g, '-')
    .replace(/^(\d)/, '_$1');
}

function visitHeadings(node, fn) {
  if (node.type === 'heading') fn(node);
  (node.children || []).forEach((child) => visitHeadings(child, fn));
}

module.exports = function docsifyHeadingIds() {
  return (tree) => {
    visitHeadings(tree, (heading) => {
      const text = headingText(heading);
      // Leave explicit `{#custom-id}` headings to Docusaurus.
      if (/\{#[^}]+\}\s*$/.test(text)) return;
      const id = docsifySlug(text);
      if (!id) return;
      heading.data = heading.data || {};
      heading.data.hProperties = { ...heading.data.hProperties, id };
    });
  };
};
