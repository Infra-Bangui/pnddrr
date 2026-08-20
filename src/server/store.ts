import { mkdir, readFile, writeFile, rename } from "fs/promises";
import path from "path";
import { hashPwd, newId } from "./auth";

export type PnddrrDb = {
  seq: { comb: number; dem: number };
  groupes: string[];
  users: Array<{
    id: string;
    login: string;
    pass: string;
    nom: string;
    role: string;
    actif: boolean;
    perms?: string[];
    passUpdated?: boolean;
  }>;
  combattants: unknown[];
  journal: unknown[];
  poste?: string;
  posteCode?: string;
  syncs?: unknown[];
  config?: Record<string, unknown>;
  secret?: unknown;
};

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
  await mkdir(dataDir(), { recursive: true });
  try {
    const raw = await readFile(dbPath(), "utf8");
    const db = JSON.parse(raw) as PnddrrDb;
    if (!Array.isArray(db.combattants) || !Array.isArray(db.users)) {
      throw new Error("Registre invalide (combattants/users manquants)");
    }
    return db;
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
  await mkdir(dataDir(), { recursive: true });
  const dest = dbPath();
  const tmp = dest + "." + newId() + ".tmp";
  await writeFile(tmp, JSON.stringify(db), "utf8");
  await rename(tmp, dest);
}

export function saveDb(db: PnddrrDb): Promise<void> {
  writeChain = writeChain.then(() => atomicWrite(db), () => atomicWrite(db));
  return writeChain;
}

/** Keep existing password hashes unless the client marks an explicit change. */
export async function saveClientDb(incoming: PnddrrDb): Promise<void> {
  const current = await readDb();
  const prevByLogin = new Map(current.users.map((u) => [u.login, u]));
  const users = incoming.users.map((u) => {
    const { passUpdated, ...rest } = u;
    const prev = prevByLogin.get(rest.login);
    if (!prev) return rest;
    if (passUpdated && rest.pass) return rest;
    return { ...rest, pass: prev.pass };
  });
  await saveDb({ ...incoming, users });
}

export function isDbShape(x: unknown): x is PnddrrDb {
  if (!x || typeof x !== "object") return false;
  const d = x as PnddrrDb;
  return Array.isArray(d.combattants) && Array.isArray(d.users);
}
