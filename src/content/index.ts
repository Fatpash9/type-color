import { loadPalette, subscribePalette } from '../lib/storage';
import { isOriginDisabled } from '../lib/settings';
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
  if (!text || !/[0-9A-Za-z]/.test(text)) return;
  const parent = node.parentNode;
  if (!parent || !parent.isConnected) return;

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

function collectTextNodes(root: Node, out: Text[]): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      if (isSkippable(n.parentElement)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let n: Node | null;
  while ((n = walker.nextNode())) out.push(n as Text);
}

const queue: Text[] = [];
let cursor = 0;
let scheduled = false;
let observer: MutationObserver | null = null;
const OBSERVER_OPTS: MutationObserverInit = {
  childList: true,
  subtree: true,
  characterData: true,
};

const FRAME_BUDGET_MS = 8;

function enqueueTextNode(t: Text): void {
  if (isSkippable(t.parentElement)) return;
  queue.push(t);
}

function schedule(): void {
  if (scheduled) return;
  if (cursor >= queue.length) return;
  scheduled = true;
  const cb = (deadline?: IdleDeadline): void => {
    scheduled = false;
    processChunk(deadline);
  };
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(cb, { timeout: 200 });
  } else {
    setTimeout(() => cb(), 0);
  }
}

function processChunk(deadline?: IdleDeadline): void {
  if (cursor >= queue.length) {
    queue.length = 0;
    cursor = 0;
    return;
  }
  observer?.disconnect();
  const start = performance.now();
  while (cursor < queue.length) {
    const node = queue[cursor++]!;
    if (node.isConnected) recolorTextNode(node);
    if ((cursor & 63) === 0) {
      const idle = deadline ? deadline.timeRemaining() : 50;
      if (idle <= 0 || performance.now() - start > FRAME_BUDGET_MS) break;
    }
  }
  if (observer && document.body) {
    observer.observe(document.body, OBSERVER_OPTS);
  }
  if (cursor < queue.length) {
    schedule();
  } else {
    queue.length = 0;
    cursor = 0;
  }
}

function startObserver(): void {
  observer = new MutationObserver((records) => {
    for (const rec of records) {
      if (rec.type === 'characterData') {
        const target = rec.target as Text;
        if (target.nodeType === Node.TEXT_NODE) enqueueTextNode(target);
      } else if (rec.type === 'childList') {
        for (const n of rec.addedNodes) {
          if (n.nodeType === Node.TEXT_NODE) {
            enqueueTextNode(n as Text);
          } else if (n.nodeType === Node.ELEMENT_NODE) {
            collectTextNodes(n, queue);
          }
        }
      }
    }
    schedule();
  });
  observer.observe(document.body, OBSERVER_OPTS);
}

async function main(): Promise<void> {
  const root = document.documentElement;
  if (root.hasAttribute(ROOT_MARKER)) return;
  root.setAttribute(ROOT_MARKER, '');
  if (await isOriginDisabled(location.origin)) return;
  const palette = await loadPalette();
  setPaletteStyle(palette);
  subscribePalette(setPaletteStyle);
  if (!document.body) return;
  collectTextNodes(document.body, queue);
  startObserver();
  schedule();
}

void main();
