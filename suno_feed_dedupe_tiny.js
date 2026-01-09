(function () {
  const ROW_SELECTOR = 'div.group[role="row"]';
  const WRAPPER_ID = '__split_wrapper__';

  // Left panel (moved rows / your “clone column”)
  const RIGHT_ID = '__dedupe_panel__';

  // Right panel (original list container lives here)
  const ORIGINAL_ID = '__original_panel__';
  const STYLE_ID = '__split_styles__';

  let lastRun = 0;
  const COOLDOWN_MS = 300;

  // 🔒 PERSISTENT STATE
  const promotedAuthors = new Set();

  // ✅ running counter for moved items
  let movedCounter = 0;

  // ✅ how tiny to make the ORIGINAL column (right side)
  const ORIGINAL_ZOOM = 0.05; // super tiny now and on right

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* Only affects the ORIGINAL column (right). Moved rows in the left panel won't be affected. */
      #${ORIGINAL_ID} {
        transform-origin: top left;
      }
    `;
    document.head.appendChild(style);
  }

  function getAuthor(row) {
    const a = row.querySelector('a[href^="/@"]');
    return a ? a.textContent.trim() : null;
  }

  // Detect "already liked" using the class difference you showed:
  // unliked Like button => text-foreground-inactive
  // liked Like button   => text-foreground-primary
  function isAlreadyLiked(row) {
    const buttons = Array.from(row.querySelectorAll('button[aria-label]'));
    for (const btn of buttons) {
      const label = (btn.getAttribute('aria-label') || '').trim().toLowerCase();
      const isLike = (label === 'like' || label.endsWith(': like')) && !label.includes('dislike');
      if (!isLike) continue;

      const cn = btn.className || '';
      const hasPrimary = cn.includes('text-foreground-primary');
      const hasInactive = cn.includes('text-foreground-inactive');

      if (hasPrimary && !hasInactive) return true;
      if (hasInactive && !hasPrimary) return false;

      // Unknown state: play it safe and treat as already liked (do not move)
      return true;
    }

    // If there's no like button found, don't move it (safer)
    return true;
  }

  function setupSplit(container) {
    if (document.getElementById(WRAPPER_ID)) return;

    ensureStyles();

    const wrapper = document.createElement('div');
    wrapper.id = WRAPPER_ID;
    wrapper.style.display = 'flex';
    wrapper.style.width = '100%';
    wrapper.style.gap = '12px';

    // ✅ LEFT = moved items panel
    const left = document.createElement('div');
    left.id = RIGHT_ID;
    left.style.flex = '1 1 75%';
    left.style.minWidth = '0';
    left.style.paddingRight = '12px';
    left.style.borderRight = '1px solid rgba(0,0,0,0.15)';

    // ✅ RIGHT = original list (tiny)
    const right = document.createElement('div');
    right.id = ORIGINAL_ID;
    right.style.flex = '1 1 25%';
    right.style.minWidth = '0';

    // Make ORIGINAL column tiny WITHOUT affecting moved rows:
    // Prefer zoom (Chrome) because it shrinks layout too; fallback to transform scale.
    if ('zoom' in right.style) {
      right.style.zoom = String(ORIGINAL_ZOOM);
    } else {
      right.style.transform = `scale(${ORIGINAL_ZOOM})`;
    }

    const parent = container.parentNode;
    parent.insertBefore(wrapper, container);

    // IMPORTANT: original container goes into the RIGHT column now
    right.appendChild(container);

    // Order: moved panel LEFT, original RIGHT
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

  // replace the "picture" spot with an item number badge
  function injectItemNumber(row, num) {
    if (row.querySelector('[data-ncz-index-badge="true"]')) return;

    const badge = document.createElement('span');
    badge.dataset.nczIndexBadge = 'true';
    badge.textContent = String(num);

    badge.style.display = 'inline-flex';
    badge.style.alignItems = 'center';
    badge.style.justifyContent = 'center';
    badge.style.fontWeight = '700';
    badge.style.borderRadius = '9999px';
    badge.style.userSelect = 'none';
    badge.style.flex = '0 0 auto';
    badge.style.lineHeight = '1';
    badge.style.background = 'rgba(0,0,0,0.08)';
    badge.style.border = '1px solid rgba(0,0,0,0.15)';
    badge.style.padding = '0';
    badge.style.minWidth = '28px';
    badge.style.height = '28px';

    const img =
      row.querySelector('img[alt*="avatar" i]') ||
      row.querySelector('img[class*="rounded" i]') ||
      row.querySelector('img');

    if (img && img.parentElement) {
      const r = img.getBoundingClientRect();
      const size = Math.max(24, Math.round(Math.max(r.width, r.height)) || 28);
      badge.style.width = size + 'px';
      badge.style.height = size + 'px';
      img.replaceWith(badge);
      return;
    }

    const firstCell =
      row.querySelector('[role="gridcell"], [role="cell"]') ||
      row.firstElementChild ||
      row;

    badge.style.marginRight = '10px';
    firstCell.insertBefore(badge, firstCell.firstChild);
  }

  function rebuildRightPanel() {
    const leftPanel = document.getElementById(RIGHT_ID);
    if (!leftPanel) return;

    const rows = Array.from(document.querySelectorAll(ROW_SELECTOR));

    rows.forEach(row => {
      if (row.dataset.placeholder === 'true') return;
      if (row.dataset.moved === 'true') return;

      // only move if NOT already liked
      if (isAlreadyLiked(row)) return;

      const author = getAuthor(row);
      if (!author) return;

      // Only first time ever for this author
      if (promotedAuthors.has(author)) return;
      promotedAuthors.add(author);

      movedCounter += 1;
      row.dataset.itemNumber = String(movedCounter);
      injectItemNumber(row, movedCounter);

      const placeholder = makePlaceholder(row);
      row.parentNode.insertBefore(placeholder, row);

      row.dataset.moved = 'true';
      // ✅ moved rows go to LEFT panel now
      leftPanel.appendChild(row);
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
