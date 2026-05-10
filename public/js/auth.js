// Shared auth module — include on any page that needs gated content/actions.
//
// Usage:
//   await AuthState.init()         — checks session, applies locked/unlocked DOM state
//   AuthState.require(fn)          — runs fn if authenticated, else shows modal first
//   AuthState.logout()             — clears session, reloads page
//   AuthState.isAuth               — boolean getter
//
// DOM conventions:
//   .auth-show                     — visible only when authenticated
//   .auth-hide                     — visible only when NOT authenticated (lock placeholders)
//   [data-needs-auth]              — click intercepted; modal shown if not authenticated
//   [data-auth-btn]                — switches between "🔒 Login" and "Sign Out" text

window.AuthState = (() => {
  let _authed = false;
  let _pending = null;

  // ── DOM state ────────────────────────────────────────────────────────────────
  function applyState() {
    document.querySelectorAll('.auth-show').forEach(el => {
      el.style.display = _authed ? '' : 'none';
    });
    document.querySelectorAll('.auth-hide').forEach(el => {
      el.style.display = _authed ? 'none' : '';
    });
    document.querySelectorAll('[data-auth-btn]').forEach(btn => {
      if (_authed) {
        btn.textContent = 'Sign Out';
        btn.onclick = () => AuthState.logout();
      } else {
        btn.textContent = '🔒 Login';
        btn.onclick = () => AuthState.require(() => {});
      }
    });
  }

  // ── Global click interceptor for [data-needs-auth] ──────────────────────────
  let _bypassNext = false;
  document.addEventListener('click', (e) => {
    if (_bypassNext || _authed) return;
    const el = e.target.closest('[data-needs-auth]');
    if (!el) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    AuthState.require(() => {
      _bypassNext = true;
      el.click();
      _bypassNext = false;
    });
  }, true);

  // ── Modal ────────────────────────────────────────────────────────────────────
  function ensureModal() {
    if (document.getElementById('_auth-modal')) return;
    const overlay = document.createElement('div');
    overlay.id = '_auth-modal';
    overlay.style.cssText = [
      'position:fixed;inset:0;z-index:99999',
      'display:none;align-items:center;justify-content:center',
      'background:rgba(0,0,0,0.72);backdrop-filter:blur(5px)',
    ].join(';');
    overlay.innerHTML = `
      <div style="
        background:#14161c;border:1px solid rgba(255,255,255,0.13);border-radius:12px;
        padding:2rem;width:100%;max-width:320px;margin:1rem;
        box-shadow:0 24px 64px rgba(0,0,0,0.6);
      ">
        <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:1.15rem;color:#e2dfd8;margin-bottom:0.2rem">
          BLR <span style="color:#f97316">→</span> LEH
        </div>
        <div style="font-size:0.6rem;letter-spacing:0.16em;text-transform:uppercase;color:#5a6270;margin-bottom:1.5rem;font-family:monospace">
          Owner Access Required
        </div>
        <div style="font-size:0.6rem;letter-spacing:0.12em;text-transform:uppercase;color:#8a93a0;margin-bottom:0.4rem;font-family:monospace">
          Passphrase
        </div>
        <input id="_auth-input" type="password" placeholder="Enter passphrase"
          autocomplete="current-password" style="
            display:block;width:100%;
            background:#1c1e27;border:1px solid rgba(255,255,255,0.13);border-radius:6px;
            padding:0.7rem 0.9rem;color:#e2dfd8;outline:none;
            font-family:monospace;font-size:0.9rem;letter-spacing:0.1em;
            margin-bottom:0.75rem;box-sizing:border-box;
          ">
        <div id="_auth-err" style="
          display:none;background:rgba(248,113,113,0.08);
          border:1px solid rgba(248,113,113,0.28);border-radius:5px;
          padding:0.4rem 0.7rem;color:#f87171;font-size:0.7rem;
          font-family:monospace;margin-bottom:0.75rem;
        "></div>
        <button id="_auth-submit" style="
          display:block;width:100%;background:#f97316;color:#fff;border:none;
          border-radius:6px;padding:0.7rem;cursor:pointer;
          font-family:monospace;font-size:0.72rem;letter-spacing:0.1em;text-transform:uppercase;
          margin-bottom:0.4rem;
        ">Enter</button>
        <button id="_auth-cancel" style="
          display:block;width:100%;background:transparent;color:#5a6270;border:none;
          padding:0.4rem;cursor:pointer;font-family:monospace;font-size:0.65rem;
        ">Cancel</button>
      </div>`;
    document.body.appendChild(overlay);

    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
    document.getElementById('_auth-submit').addEventListener('click', submit);
    document.getElementById('_auth-cancel').addEventListener('click', closeModal);
    document.getElementById('_auth-input').addEventListener('keydown', e => {
      if (e.key === 'Enter') submit();
      if (e.key === 'Escape') closeModal();
    });
  }

  function showModal() {
    ensureModal();
    const overlay = document.getElementById('_auth-modal');
    const input   = document.getElementById('_auth-input');
    const err     = document.getElementById('_auth-err');
    const btn     = document.getElementById('_auth-submit');
    overlay.style.display = 'flex';
    input.value = '';
    err.style.display = 'none';
    btn.disabled = false;
    btn.textContent = 'Enter';
    setTimeout(() => input.focus(), 60);
  }

  function closeModal() {
    const overlay = document.getElementById('_auth-modal');
    if (overlay) overlay.style.display = 'none';
    _pending = null;
  }

  async function submit() {
    const input = document.getElementById('_auth-input');
    const err   = document.getElementById('_auth-err');
    const btn   = document.getElementById('_auth-submit');
    const passphrase = input.value.trim();
    if (!passphrase) return;

    btn.disabled = true;
    btn.textContent = 'Checking…';
    err.style.display = 'none';

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passphrase }),
      });
      if (res.ok) {
        _authed = true;
        closeModal();
        applyState();
        const cb = _pending;
        _pending = null;
        if (typeof cb === 'function') cb();
      } else {
        const data = await res.json().catch(() => ({}));
        err.textContent = data.error || 'Wrong passphrase';
        err.style.display = 'block';
        btn.disabled = false;
        btn.textContent = 'Enter';
        input.select();
      }
    } catch (_) {
      err.textContent = 'Network error — try again';
      err.style.display = 'block';
      btn.disabled = false;
      btn.textContent = 'Enter';
    }
  }

  // ── Public API ───────────────────────────────────────────────────────────────
  async function init() {
    try {
      const res = await fetch('/api/me');
      _authed = res.ok;
    } catch (_) {
      _authed = false;
    }
    applyState();
    return _authed;
  }

  function require(callback) {
    if (_authed) { if (typeof callback === 'function') callback(); return; }
    _pending = typeof callback === 'function' ? callback : null;
    showModal();
  }

  async function logout() {
    try { await fetch('/api/logout', { method: 'POST' }); } catch (_) {}
    _authed = false;
    window.location.reload();
  }

  return {
    init,
    require,
    logout,
    get isAuth() { return _authed; },
  };
})();
