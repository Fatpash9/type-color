const DIGIT_CLASS = 'tc-d';
const ROOT_MARKER = 'data-tc-active';

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
    if (el.classList?.contains(DIGIT_CLASS)) return true;
    el = el.parentElement;
  }
  return false;
}

function recolorTextNode(node: Text): void {
  const text = node.nodeValue;
  if (!text || !/\d/.test(text)) return;
  const parent = node.parentNode;
  if (!parent) return;

  const frag = document.createDocumentFragment();
  let buf = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (ch >= '0' && ch <= '9') {
      if (buf) {
        frag.appendChild(document.createTextNode(buf));
        buf = '';
      }
      const span = document.createElement('span');
      span.className = DIGIT_CLASS;
      span.textContent = ch;
      frag.appendChild(span);
    } else {
      buf += ch;
    }
  }
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

function injectStyle(): void {
  const style = document.createElement('style');
  style.setAttribute('data-tc-style', '');
  style.textContent = `.${DIGIT_CLASS} { color: red; }`;
  document.documentElement.appendChild(style);
}

function main(): void {
  const root = document.documentElement;
  if (root.hasAttribute(ROOT_MARKER)) return;
  root.setAttribute(ROOT_MARKER, '');
  injectStyle();
  if (document.body) walk(document.body);
}

main();
