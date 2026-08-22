import { mkdir, readFile, writeFile, rename } from "fs/promises";
import path from "path";
import { hashPwd, newId } from "./auth";

export type PnddrrUser = {
  id: string;
  login: string;
  pass: string;
  nom: string;
  role: string;
  actif: boolean;
  perms?: string[];
  passUpdated?: boolean;
};

export type PnddrrDb = {
  seq: { comb: number; dem: number };
  groupes: string[];
  users: PnddrrUser[];
  combattants: unknown[];
  journal: unknown[];
  poste?: string;
  posteCode?: string;
  syncs?: unknown[];
  config?: Record<string, unknown>;
  secret?: unknown;
  /** Client flag: restore JSON replaces the registry instead of merging. */
  _replace?: boolean;
};

const STATUT_ORD: Record<string, number> = {
  abandon: 0,
  enregistre: 1,
  desarme: 2,
  demobilise: 3,
  reintegration_militaire: 4,
  reintegration_socio: 4,
  reintegre: 5,
  rapatrie: 5,
};

type Comb = Record<string, unknown> & {
  id?: string;
  num?: string;
  nom?: string;
  prenom?: string;
  dn?: string;
  statut?: string;
  desarmement?: { armes?: unknown[]; munitions?: unknown[]; date?: string; lieu?: string; agent?: string };
  demobilisation?: unknown;
  reintMil?: unknown;
  reintSocio?: { visites?: unknown[] } & Record<string, unknown>;
  fin?: unknown;
  abandon?: unknown;
};

function asComb(x: unknown): Comb {
  return x && typeof x === "object" ? (x as Comb) : {};
}

function normTxt(s: unknown): string {
  return String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function applyPasswords(incoming: PnddrrUser[], current: PnddrrUser[]): PnddrrUser[] {
  const prevByLogin = new Map(current.map((u) => [u.login, u]));
  return incoming.map((u) => {
    const { passUpdated, ...rest } = u;
    const prev = prevByLogin.get(rest.login);
    if (!prev) return rest;
    if (passUpdated && rest.pass) return rest;
    return { ...rest, pass: prev.pass };
  });
}

function bumpSeqFromNums(seq: { comb: number; dem: number }, c: Comb) {
  const m = String(c.num || "").match(/DDR-(?:[A-Z0-9]+-)?(\d{4})-(\d{1,5})$/i);
  if (m) seq.comb = Math.max(seq.comb, +m[2]);
  const carte = c.demobilisation && typeof c.demobilisation === "object" ? (c.demobilisation as { carte?: string }).carte : "";
  const md = String(carte || "").match(/DEM-(?:[A-Z0-9]+-)?(\d{4})-(\d{1,5})$/i);
  if (md) seq.dem = Math.max(seq.dem, +md[2]);
}

function findComb(list: Comb[], inc: Comb): Comb | undefined {
  if (inc.id) {
    const byId = list.find((c) => c.id && c.id === inc.id);
    if (byId) return byId;
  }
  if (inc.num) {
    const byNum = list.find((c) => c.num && c.num === inc.num);
    if (byNum) return byNum;
  }
  if (inc.nom && inc.prenom) {
    return list.find(
      (c) =>
        c.nom === inc.nom &&
        normTxt(c.prenom) === normTxt(inc.prenom) &&
        (!inc.dn || !c.dn || c.dn === inc.dn)
    );
  }
  return undefined;
}

function armeKey(a: unknown): string {
  if (!a || typeof a !== "object") return "";
  const x = a as { serie?: string; type?: string; marque?: string; calibre?: string; etat?: string; mun?: string };
  const serie = normTxt(x.serie);
  if (serie) return "s:" + serie;
  return "n:" + [x.type, x.marque, x.calibre, x.etat, x.mun].map(normTxt).join("|");
}

function dedupeArmes(armes: unknown[] | undefined): unknown[] {
  const seen = new Set<string>();
  const out: unknown[] = [];
  for (const a of armes || []) {
    const k = armeKey(a);
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(a);
  }
  return out;
}

function sanitizeDb(db: PnddrrDb): PnddrrDb {
  for (const raw of db.combattants || []) {
    const c = asComb(raw);
    if (c.desarmement?.armes) c.desarmement.armes = dedupeArmes(c.desarmement.armes);
  }
  return db;
}

function mergeOneComb(ex: Comb, inc: Comb) {
  for (const f of ["alias", "dn", "ln", "tel", "sousPref", "commune", "site", "grade", "annees", "zone", "obs", "photo", "vague", "groupe", "souhait", "instr", "nat", "fam", "sexe"]) {
    if (!ex[f] && inc[f]) ex[f] = inc[f];
  }
  const io = STATUT_ORD[String(inc.statut || "")] ?? -1;
  const eo = STATUT_ORD[String(ex.statut || "")] ?? -1;
  if (io > eo) ex.statut = inc.statut;
  if (inc.desarmement) {
    if (!ex.desarmement) {
      ex.desarmement = {
        date: inc.desarmement.date,
        lieu: inc.desarmement.lieu,
        agent: inc.desarmement.agent,
        armes: [],
        munitions: [],
      };
    }
    const keys = new Set((ex.desarmement.armes || []).map(armeKey).filter(Boolean));
    for (const a of inc.desarmement.armes || []) {
      const k = armeKey(a);
      if (!k || keys.has(k)) continue;
      ex.desarmement.armes = ex.desarmement.armes || [];
      ex.desarmement.armes.push(a);
      keys.add(k);
    }
    for (const m of inc.desarmement.munitions || []) {
      ex.desarmement.munitions = ex.desarmement.munitions || [];
      const mm = m && typeof m === "object" ? (m as { nature?: string; qte?: unknown; unite?: string }) : {};
      if (!ex.desarmement.munitions.some((x) => {
        const xx = x && typeof x === "object" ? (x as { nature?: string; qte?: unknown; unite?: string }) : {};
        return xx.nature === mm.nature && xx.qte === mm.qte && xx.unite === mm.unite;
      })) {
        ex.desarmement.munitions.push(m);
      }
    }
  }
  if (inc.demobilisation && !ex.demobilisation) ex.demobilisation = inc.demobilisation;
  if (inc.reintMil && !ex.reintMil) ex.reintMil = inc.reintMil;
  if (inc.reintSocio) {
    if (!ex.reintSocio) ex.reintSocio = inc.reintSocio;
    else {
      const vis = Array.isArray(inc.reintSocio.visites) ? inc.reintSocio.visites : [];
      ex.reintSocio.visites = ex.reintSocio.visites || [];
      for (const v of vis) {
        const vv = v && typeof v === "object" ? (v as { date?: string; obs?: string }) : {};
        if (!ex.reintSocio.visites.some((x) => {
          const xx = x && typeof x === "object" ? (x as { date?: string; obs?: string }) : {};
          return xx.date === vv.date && xx.obs === vv.obs;
        })) {
          ex.reintSocio.visites.push(v);
        }
      }
    }
  }
  if (inc.fin && !ex.fin) ex.fin = inc.fin;
  if (inc.abandon && !ex.abandon && ex.statut === "abandon") ex.abandon = inc.abandon;
}

function mergeCombattants(current: unknown[], incoming: unknown[]): Comb[] {
  const out = current.map((c) => asComb(JSON.parse(JSON.stringify(c))));
  for (const raw of incoming) {
    const inc = asComb(JSON.parse(JSON.stringify(raw)));
    const ex = findComb(out, inc);
    if (!ex) {
      out.push(inc);
      continue;
    }
    mergeOneComb(ex, inc);
  }
  return out;
}

function journalKey(j: unknown): string {
  if (!j || typeof j !== "object") return "";
  const x = j as { h?: string; date?: string; user?: string; action?: string; detail?: string };
  return x.h || [x.date, x.user, x.action, x.detail].join("|");
}

function mergeJournal(current: unknown[], incoming: unknown[]): unknown[] {
  const seen = new Set<string>();
  const out: unknown[] = [];
  for (const j of [...incoming, ...current]) {
    const k = journalKey(j);
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(j);
  }
  out.sort((a, b) => {
    const da = a && typeof a === "object" ? String((a as { date?: string }).date || "") : "";
    const db = b && typeof b === "object" ? String((b as { date?: string }).date || "") : "";
    return db.localeCompare(da);
  });
  if (out.length > 8000) out.length = 8000;
  return out;
}

function mergeUsers(current: PnddrrUser[], incoming: PnddrrUser[]): PnddrrUser[] {
  const withPass = applyPasswords(incoming, current);
  const byLogin = new Map(current.map((u) => [u.login, { ...u }]));
  for (const u of withPass) {
    const prev = byLogin.get(u.login);
    if (!prev) {
      byLogin.set(u.login, u);
      continue;
    }
    byLogin.set(u.login, { ...prev, ...u, pass: u.pass || prev.pass });
  }
  return [...byLogin.values()];
}

function mergeGroupes(current: string[], incoming: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const g of [...current, ...incoming]) {
    const k = normTxt(g);
    if (!k || seen.has(k) || k === "autre") continue;
    seen.add(k);
    out.push(g);
  }
  out.push("Autre");
  return out;
}

function mergeSyncs(current: unknown[], incoming: unknown[]): unknown[] {
  const seen = new Set<string>();
  const out: unknown[] = [];
  for (const s of [...incoming, ...current]) {
    if (!s || typeof s !== "object") continue;
    const x = s as { date?: string; type?: string; fichier?: string; poste?: string };
    const k = [x.date, x.type, x.fichier, x.poste].join("|");
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(s);
  }
  out.sort((a, b) => {
    const da = a && typeof a === "object" ? String((a as { date?: string }).date || "") : "";
    const db = b && typeof b === "object" ? String((b as { date?: string }).date || "") : "";
    return db.localeCompare(da);
  });
  return out.slice(0, 50);
}

function mergeSharedDb(current: PnddrrDb, incoming: PnddrrDb): PnddrrDb {
  const combattants = mergeCombattants(current.combattants || [], incoming.combattants || []);
  const seq = {
    comb: Math.max(current.seq?.comb || 0, incoming.seq?.comb || 0),
    dem: Math.max(current.seq?.dem || 0, incoming.seq?.dem || 0),
  };
  for (const c of combattants) bumpSeqFromNums(seq, c);
  return {
    seq,
    groupes: mergeGroupes(current.groupes || [], incoming.groupes || []),
    users: mergeUsers(current.users || [], incoming.users || []),
    combattants,
    journal: mergeJournal(current.journal || [], incoming.journal || []),
    poste: incoming.poste ?? current.poste ?? "",
    posteCode: incoming.posteCode ?? current.posteCode ?? "",
    syncs: mergeSyncs(current.syncs || [], incoming.syncs || []),
    config: { ...(current.config || {}), ...(incoming.config || {}) },
    secret: incoming.secret ?? current.secret ?? null,
  };
}

const DEFAULT_GROUPES = [
  "Ex-Séléka / FPRC",
  "UPC",
  "MPC",
  "3R",
  "Anti-Balaka (aile Mokom)",
  "Anti-Balaka (aile Ngaïssona)",
  "RJ (Révolution et Justice)",
  "MLCJ",
  "Siriri",
  "Autre",
];

function dataDir(): string {
  return process.env.DATA_DIR || path.join(process.cwd(), "data");
}

function dbPath(): string {
  return path.join(dataDir(), "pnddrr.json");
}

let writeChain: Promise<void> = Promise.resolve();
let cachedDb: PnddrrDb | null = null;

function emptyDb(adminPassword: string): PnddrrDb {
  return {
    seq: { comb: 0, dem: 0 },
    groupes: DEFAULT_GROUPES.slice(),
    users: [
      {
        id: "u1",
        login: "admin",
        pass: hashPwd(adminPassword),
        nom: "Administrateur système",
        role: "admin",
        actif: true,
      },
    ],
    combattants: [],
    journal: [],
    poste: "",
    posteCode: "",
    syncs: [],
    config: {},
    secret: null,
  };
}

export async function readDb(): Promise<PnddrrDb> {
  if (cachedDb) return cachedDb;
  await mkdir(dataDir(), { recursive: true });
  try {
    const raw = await readFile(dbPath(), "utf8");
    const db = JSON.parse(raw) as PnddrrDb;
    if (!Array.isArray(db.combattants) || !Array.isArray(db.users)) {
      throw new Error("Registre invalide (combattants/users manquants)");
    }
    cachedDb = sanitizeDb(db);
    return cachedDb;
  } catch (e) {
    const err = e as NodeJS.ErrnoException;
    if (err.code !== "ENOENT") throw e;
    const admin =
      process.env.ADMIN_PASSWORD ||
      (process.env.NODE_ENV === "production" ? "" : "admin2026");
    if (!admin) {
      throw new Error("ADMIN_PASSWORD requis pour créer le registre initial");
    }
    const db = emptyDb(admin);
    await atomicWrite(db);
    return db;
  }
}

async function atomicWrite(db: PnddrrDb): Promise<void> {
  sanitizeDb(db);
  await mkdir(dataDir(), { recursive: true });
  const dest = dbPath();
  const tmp = dest + "." + newId() + ".tmp";
  await writeFile(tmp, JSON.stringify(db), "utf8");
  await rename(tmp, dest);
  cachedDb = db;
}

export function saveDb(db: PnddrrDb): Promise<void> {
  writeChain = writeChain.then(() => atomicWrite(db), () => atomicWrite(db));
  return writeChain;
}

/** Keep existing password hashes unless the client marks an explicit change.
 *  Concurrent sessions merge into the shared registry (union of dossiers).
 *  Restore JSON sends `_replace: true` to overwrite instead. */
export async function saveClientDb(incoming: PnddrrDb): Promise<PnddrrDb> {
  const current = await readDb();
  const replace = incoming._replace === true;
  const { _replace: _omit, ...rest } = incoming;
  const next = sanitizeDb(
    replace
      ? { ...rest, users: applyPasswords(incoming.users, current.users) }
      : mergeSharedDb(current, rest)
  );
  await saveDb(next);
  return next;
}

export function isDbShape(x: unknown): x is PnddrrDb {
  if (!x || typeof x !== "object") return false;
  const d = x as PnddrrDb;
  return Array.isArray(d.combattants) && Array.isArray(d.users);
}
