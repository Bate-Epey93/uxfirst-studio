/* ═══════════════════════════════════════════════════════════════
   UX-FIRST STUDIO — STORAGE (deep module, spec §6)
   ───────────────────────────────────────────────────────────────
   A simple async interface over IndexedDB. Nothing outside this
   file touches IndexedDB APIs. Handles the one-time migration
   from the file-based version's localStorage, fresh-install demo
   seeding, versioned export/import, per-project snapshots, and
   the persistence grant.

   Data format versioning (backup .json files):
   · schemaVersion 1 — the original localStorage shape (no
     version field in backups).
   · schemaVersion 2 — same project object shape, stored in
     IndexedDB; backups carry "schemaVersion": 2.
   importAll() accepts both, so every backup ever made restores.
   Snapshots are a device-local safety net and are deliberately
   NOT part of backups (they'd bloat every file).

   IndexedDB layout (DB version 2):
   · projects  — keyPath id; the project object unchanged.
   · meta      — keyPath key; activeId, view, activeStation,
     demoSeeded, lastBackup, schemaVersion, plus device-local
     keys (visits, iosHintDismissed, persistAsked,
     liveBackupHandle, contentPack).
   · snapshots — keyPath id (autoIncrement), index projectId;
     records { projectId, ts, kind, label, project }.
   ═══════════════════════════════════════════════════════════════ */

const Store = (() => {
  const DB_NAME = "uxfs-" + CONFIG.storageKey;   // per-fork isolation
  const DB_VERSION = 2;                          // v2 adds the snapshots store
  const SCHEMA_VERSION = 2;
  const SNAPSHOT_CAP = 30;                       // per project; oldest autos pruned first
  // meta keys that never leave the device (handles aren't JSON; the rest is per-install state)
  const LOCAL_ONLY_META = ["liveBackupHandle", "visits", "iosHintDismissed", "persistAsked"];
  let db = null;

  function open() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const d = req.result;
        if (!d.objectStoreNames.contains("projects")) d.createObjectStore("projects", { keyPath: "id" });
        if (!d.objectStoreNames.contains("meta")) d.createObjectStore("meta", { keyPath: "key" });
        if (!d.objectStoreNames.contains("snapshots")) {
          const s = d.createObjectStore("snapshots", { keyPath: "id", autoIncrement: true });
          s.createIndex("projectId", "projectId");
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  // Run fn(...stores) inside one readwrite transaction; resolves on commit.
  function write(storeNames, fn) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeNames, "readwrite");
      fn(...storeNames.map(n => tx.objectStore(n)));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }

  function reqAsPromise(req) {
    return new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  function readAll(storeName) {
    return reqAsPromise(db.transaction(storeName).objectStore(storeName).getAll());
  }

  async function getMetaMap() {
    const rows = await readAll("meta");
    const m = {};
    rows.forEach(r => { m[r.key] = r.value; });
    return m;
  }

  function putState(projects, meta, { clear } = {}) {
    return write(["projects", "meta"], (ps, ms) => {
      if (clear) { ps.clear(); ms.clear(); }
      Object.entries(projects || {}).forEach(([id, p]) => ps.put({ id, ...p }));
      Object.entries(meta || {}).forEach(([key, value]) => {
        if (value !== undefined) ms.put({ key, value });
      });
    });
  }

  function validate(state) {
    if (!state || typeof state !== "object" || !state.projects || typeof state.projects !== "object")
      throw new Error("not a Studio backup");
    // v1 files carry no schemaVersion; reject only unknown future versions
    if (state.schemaVersion != null && state.schemaVersion > SCHEMA_VERSION)
      throw new Error("backup from a newer version");
  }

  function metaFrom(state) {
    return {
      activeId: state.activeId,
      view: state.view,
      activeStation: state.activeStation,
      demoSeeded: state.demoSeeded,
      lastBackup: state.lastBackup,
      contentPack: state.contentPack,   // backups carry the active pack, so they're self-contained
      schemaVersion: SCHEMA_VERSION
    };
  }

  async function pruneSnapshots(projectId) {
    const idx = db.transaction("snapshots").objectStore("snapshots").index("projectId");
    const snaps = await reqAsPromise(idx.getAll(projectId));
    if (snaps.length <= SNAPSHOT_CAP) return;
    snaps.sort((a, b) => a.ts - b.ts);
    // prune oldest non-milestones first, then oldest milestones if still over
    const doomed = [];
    let excess = snaps.length - SNAPSHOT_CAP;
    for (const s of snaps) { if (excess && s.kind !== "milestone") { doomed.push(s.id); excess--; } }
    for (const s of snaps) { if (excess && s.kind === "milestone") { doomed.push(s.id); excess--; } }
    await write(["snapshots"], ss => doomed.forEach(id => ss.delete(id)));
  }

  return {
    async init() {
      db = await open();
      const meta = await getMetaMap();
      if (meta.schemaVersion != null) return;   // already migrated / seeded

      let legacy = null;
      try { legacy = JSON.parse(localStorage.getItem(CONFIG.storageKey)); } catch (e) { /* corrupt = fresh */ }

      if (legacy && legacy.projects) {
        // One-time migration from the file-based version. The localStorage
        // copy is deliberately left untouched for one release cycle.
        await putState(legacy.projects, metaFrom(legacy));
      } else {
        // Fresh install: seed the demo exactly as the old load() did.
        const id = "demo_" + Date.now();
        const demo = { name: DEMO_PROJECT.name, created: Date.now(), demo: true, data: JSON.parse(JSON.stringify(DEMO_PROJECT.data)) };
        await putState({ [id]: demo }, {
          activeId: id, view: "learn", activeStation: "foundation",
          demoSeeded: true, schemaVersion: SCHEMA_VERSION
        });
      }
    },

    async getState() {
      const [rows, meta] = await Promise.all([readAll("projects"), getMetaMap()]);
      const projects = {};
      rows.forEach(r => { const { id, ...p } = r; projects[id] = p; });
      return { projects, ...meta };
    },

    saveProject(id, project) {
      return write(["projects"], ps => ps.put({ id, ...project }));
    },

    deleteProject(id) {
      return write(["projects"], ps => ps.delete(id));
    },

    saveMeta(partial) {
      return write(["meta"], ms => {
        Object.entries(partial).forEach(([key, value]) => {
          if (value !== undefined) ms.put({ key, value });
        });
      });
    },

    async exportAll() {
      const state = await this.getState();
      LOCAL_ONLY_META.forEach(k => delete state[k]);
      return { schemaVersion: SCHEMA_VERSION, ...state };
    },

    async importAll(state) {
      validate(state);
      // preserve device-local meta across the wipe
      const local = await getMetaMap();
      const kept = {};
      LOCAL_ONLY_META.forEach(k => { if (local[k] !== undefined) kept[k] = local[k]; });
      await putState(state.projects, { ...metaFrom(state), ...kept }, { clear: true });
    },

    /* ── Snapshots (device-local thinking history) ── */

    // Copy the currently-persisted version of a project into snapshots —
    // used before the first write of a session and before a restore.
    async snapshotFromDb(projectId, kind, label) {
      const rec = await reqAsPromise(db.transaction("projects").objectStore("projects").get(projectId));
      if (!rec) return;
      const { id, ...project } = rec;
      await write(["snapshots"], ss => ss.put({ projectId, ts: Date.now(), kind, label: label || "", project }));
      await pruneSnapshots(projectId);
    },

    // Snapshot an in-memory project object (milestones, which may be ahead of the DB).
    async addSnapshot(projectId, project, kind, label) {
      const clone = JSON.parse(JSON.stringify(project));
      await write(["snapshots"], ss => ss.put({ projectId, ts: Date.now(), kind, label: label || "", project: clone }));
      await pruneSnapshots(projectId);
    },

    async getSnapshots(projectId) {
      const idx = db.transaction("snapshots").objectStore("snapshots").index("projectId");
      const snaps = await reqAsPromise(idx.getAll(projectId));
      return snaps.sort((a, b) => b.ts - a.ts);
    },

    deleteSnapshot(id) {
      return write(["snapshots"], ss => ss.delete(id));
    },

    async deleteSnapshotsFor(projectId) {
      const snaps = await this.getSnapshots(projectId);
      await write(["snapshots"], ss => snaps.forEach(s => ss.delete(s.id)));
    },

    async requestPersistence() {
      if (navigator.storage && navigator.storage.persist) {
        try { return await navigator.storage.persist(); } catch (e) { return false; }
      }
      return false;
    }
  };
})();
