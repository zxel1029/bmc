import { readFile, writeFile, rename, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const DATA_FILE =
  process.env.DATA_FILE || path.join(process.cwd(), "data", "db.json");

const emptyState = {
  users: [],
  schools: [],
  parts: [],
  issues: [],
  partRequests: [],
  partReports: [],
  weeklyReports: [],
  zoneAssignments: {}, // districtId -> employeeId
  zoneSends: {}, // employeeId -> date string
  seq: 1,
};

let state = structuredClone(emptyState);
let writeChain = Promise.resolve();

export async function load() {
  if (existsSync(DATA_FILE)) {
    const raw = JSON.parse(await readFile(DATA_FILE, "utf8"));
    state = { ...structuredClone(emptyState), ...raw };
  } else {
    await flush();
  }
}

function flush() {
  writeChain = writeChain
    .then(async () => {
      await mkdir(path.dirname(DATA_FILE), { recursive: true });
      const tmp = `${DATA_FILE}.${process.pid}.tmp`;
      await writeFile(tmp, JSON.stringify(state));
      await rename(tmp, DATA_FILE);
    })
    .catch((err) => console.error("[store] persist failed:", err));
  return writeChain;
}

export function getState() {
  return state;
}

export function nextId() {
  return state.seq++;
}

// Run a synchronous mutation against the in-memory state, then persist.
export async function mutate(fn) {
  const result = fn(state);
  await flush();
  return result;
}
