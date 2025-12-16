(function () {
  const ROW_SELECTOR = 'div.group[role="row"]';
  const WRAPPER_ID = '__split_wrapper__';
  const RIGHT_ID = '__dedupe_panel__';

  let lastRun = 0;
  const COOLDOWN_MS = 300;

  // 🔒 PERSISTENT STATE
  const promotedAuthors = new Set();

  function getAuthor(row) {
    const a = row.querySelector('a[href^="/@"]');
    return a ? a.textContent.trim() : null;
  }

  function setupSplit(container) {
    if (document.getElementById(WRAPPER_ID)) return;

    const wrapper = document.createElement('div');
    wrapper.id = WRAPPER_ID;
    wrapper.style.display = 'flex';
    wrapper.style.width = '100%';

    const left = document.createElement('div');
    left.style.flex = '1 1 65%';
    left.style.minWidth = '0';

    const right = document.createElement('div');
    right.id = RIGHT_ID;
    right.style.flex = '1 1 35%';
    right.style.minWidth = '0';
    right.style.paddingLeft = '12px';
    right.style.borderLeft = '1px solid rgba(0,0,0,0.15)';

    const parent = container.parentNode;
    parent.insertBefore(wrapper, container);

    left.appendChild(container);
    wrapper.appendChild(left);
    wrapper.appendChild(right);
  }

  function makePlaceholder(fromRow) {
    const ph = document.createElement(fromRow.tagName);
    ph.className = fromRow.className;
    ph.style.height = fromRow.getBoundingClientRect().height + 'px';
    ph.style.visibility = 'hidden';
    ph.dataset.placeholder = 'true';
    return ph;
  }

  function rebuildRightPanel() {
    const right = document.getElementById(RIGHT_ID);
    if (!right) return;

    const rows = Array.from(document.querySelectorAll(ROW_SELECTOR));

    rows.forEach(row => {
      // Skip placeholders and already-moved rows
      if (row.dataset.placeholder === 'true') return;
      if (row.dataset.moved === 'true') return;

      const author = getAuthor(row);
      if (!author) return;

      // 🔒 CRITICAL FIX
      if (promotedAuthors.has(author)) return;

      // First time EVER for this author
      promotedAuthors.add(author);

      const placeholder = makePlaceholder(row);
      row.parentNode.insertBefore(placeholder, row);

      row.dataset.moved = 'true';
      right.appendChild(row);
    });
  }

  document.addEventListener('keydown', e => {
    if (e.code !== 'Space') return;

    const now = Date.now();
    if (now - lastRun < COOLDOWN_MS) return;
    lastRun = now;

    const firstRow = document.querySelector(ROW_SELECTOR);
    if (!firstRow) return;

    const container = firstRow.parentElement;
    setupSplit(container);
    rebuildRightPanel();
  });
})();
