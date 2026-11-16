// City Fresh Project Tracker: tiny self-contained server + file database.
// No npm packages needed. Requires Node.js 18 or newer.
const http = require("http"), fs = require("fs"), path = require("path"), crypto = require("crypto");

const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const FILE = path.join(DATA_DIR, "db.json");
const CODE = process.env.ACCESS_CODE || "";          // optional team password
const CORS = process.env.CORS_ORIGIN || "";          // only if the site is hosted elsewhere
const PUBLIC = path.join(__dirname, "docs");

fs.mkdirSync(DATA_DIR, { recursive: true });
let db = { tasks: {} };
try { db = JSON.parse(fs.readFileSync(FILE, "utf8")); fs.copyFileSync(FILE, FILE + ".bak"); } catch (e) {}
if (!db.tasks) db.tasks = {};

// Safe writes: write temp file, then rename. Writes are queued so they never overlap.
let writing = false, dirty = false;
function flush() {
  if (writing) { dirty = true; return; }
  writing = true;
  const tmp = FILE + ".tmp";
  fs.writeFile(tmp, JSON.stringify(db), err => {
    if (err) { writing = false; return console.error("write failed", err); }
    fs.rename(tmp, FILE, () => { writing = false; if (dirty) { dirty = false; flush(); } });
  });
}

const FIELDS = ["assigned", "by", "to", "title", "kind", "link", "deadline", "status", "progress", "remark"];
const KINDS = ["Promotion", "Retails", "Social Media", "Catalogue", "POSM"];
function clean(id, t) {
  const o = { id };
  for (const f of FIELDS) o[f] = String(t[f] ?? "").slice(0, 4000);
  if (!KINDS.includes(o.kind)) o.kind = "Promotion";
  if (!["Urgent", "Routine"].includes(o.status)) o.status = "Routine";
  if (!["To do", "In progress", "Done"].includes(o.progress)) o.progress = "To do";
  o.created = Number(t.created) || Date.now();
  o.updated = Date.now();
  return o;
}
const validId = id => /^[\w-]{1,40}$/.test(id);

function authorised(req) {
  if (!CODE) return true;
  const a = Buffer.from(String(req.headers["x-access-code"] || ""));
  const b = Buffer.from(CODE);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
function send(res, status, body, type = "application/json") {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(typeof body === "string" ? body : JSON.stringify(body));
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let s = ""; req.on("data", c => { s += c; if (s.length > 5e6) { reject(new Error("too big")); req.destroy(); } });
    req.on("end", () => { try { resolve(JSON.parse(s || "{}")); } catch (e) { reject(e); } });
  });
}
const MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon", ".json": "application/json" };

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  if (CORS) {
    res.setHeader("Access-Control-Allow-Origin", CORS);
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-access-code");
    res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
    if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }
  }
  if (url.pathname === "/healthz") return send(res, 200, "ok", "text/plain");

  if (url.pathname.startsWith("/api/")) {
    if (!authorised(req)) return send(res, 401, { error: "access code required" });
    try {
      const m = url.pathname.match(/^\/api\/tasks\/([^/]+)$/);
      if (url.pathname === "/api/tasks" && req.method === "GET")
        return send(res, 200, Object.values(db.tasks).sort((a, b) => b.created - a.created));
      if (url.pathname === "/api/export" && req.method === "GET")
        return send(res, 200, { exported: new Date().toISOString(), tasks: Object.values(db.tasks) });
      if (m && req.method === "PUT") {
        const id = decodeURIComponent(m[1]); if (!validId(id)) return send(res, 400, { error: "bad id" });
        db.tasks[id] = clean(id, await readBody(req)); flush(); return send(res, 200, { ok: true });
      }
      if (m && req.method === "DELETE") {
        delete db.tasks[decodeURIComponent(m[1])]; flush(); return send(res, 200, { ok: true });
      }
      if (url.pathname === "/api/import" && req.method === "POST") {
        const { tasks } = await readBody(req); let n = 0;
        for (const t of Array.isArray(tasks) ? tasks : []) if (t && validId(String(t.id))) { db.tasks[t.id] = clean(String(t.id), t); n++; }
        flush(); return send(res, 200, { ok: true, imported: n });
      }
      return send(res, 404, { error: "not found" });
    } catch (e) { return send(res, 400, { error: "bad request" }); }
  }

  // static files
  let p = path.normalize(path.join(PUBLIC, url.pathname === "/" ? "index.html" : url.pathname));
  if (!p.startsWith(PUBLIC)) return send(res, 403, "forbidden", "text/plain");
  fs.readFile(p, (err, buf) => {
    if (err) return fs.readFile(path.join(PUBLIC, "404.html"), (e2, b2) => { res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" }); res.end(b2 || "Not found"); });
    res.writeHead(200, { "Content-Type": MIME[path.extname(p)] || "application/octet-stream" }); res.end(buf);
  });
}).listen(PORT, () => console.log(`City Fresh tracker running at http://localhost:${PORT}  (data: ${FILE}${CODE ? ", access code ON" : ", no access code"})`));
