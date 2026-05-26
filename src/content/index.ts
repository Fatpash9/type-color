import { loadPalette } from '../lib/storage';
import { GLYPHS, normalizeGlyph, type Palette } from '../lib/palette';

const SPAN_CLASS = 'tc-g';
const ROOT_MARKER = 'data-tc-active';
const STYLE_ID = 'tc-palette-style';

const SKIP_TAGS = new Set([
  'SCRIPT',
  'STYLE',
  'NOSCRIPT',
  'TEXTAREA',
  'INPUT',
  'CODE',
  'PRE',
  'KBD',
  'SAMP',
]);

function isSkippable(el: Element | null): boolean {
  while (el) {
    if (SKIP_TAGS.has(el.tagName)) return true;
    if ((el as HTMLElement).isContentEditable) return true;
    if (el.classList?.contains(SPAN_CLASS)) return true;
    el = el.parentElement;
  }
  return false;
}

function paletteToCss(palette: Palette): string {
  const rules: string[] = [];
  for (const g of GLYPHS) {
    rules.push(`.${SPAN_CLASS}-${g}{color:${palette[g]}}`);
  }
  return rules.join('');
}

function setPaletteStyle(palette: Palette): void {
  let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement('style');
    el.id = STYLE_ID;
    document.documentElement.appendChild(el);
  }
  el.textContent = paletteToCss(palette);
}

function recolorTextNode(node: Text): void {
  const text = node.nodeValue;
  if (!text) return;
  if (!/[0-9A-Za-z]/.test(text)) return;
  const parent = node.parentNode;
  if (!parent) return;

  const frag = document.createDocumentFragment();
  let buf = '';
  let touched = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    const g = normalizeGlyph(ch);
    if (g) {
      touched = true;
      if (buf) {
        frag.appendChild(document.createTextNode(buf));
        buf = '';
      }
      const span = document.createElement('span');
      span.className = `${SPAN_CLASS} ${SPAN_CLASS}-${g}`;
      span.textContent = ch;
      frag.appendChild(span);
    } else {
      buf += ch;
    }
  }
  if (!touched) return;
  if (buf) frag.appendChild(document.createTextNode(buf));
  parent.replaceChild(frag, node);
}

function walk(root: Node): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      if (isSkippable(n.parentElement)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const targets: Text[] = [];
  let n: Node | null;
  while ((n = walker.nextNode())) targets.push(n as Text);
  for (const t of targets) recolorTextNode(t);
}

async function main(): Promise<void> {
  const root = document.documentElement;
  if (root.hasAttribute(ROOT_MARKER)) return;
  root.setAttribute(ROOT_MARKER, '');
  const palette = await loadPalette();
  setPaletteStyle(palette);
  if (document.body) walk(document.body);
}

void main();
