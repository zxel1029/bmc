import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { load, getState, nextId, mutate } from "./store.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "127.0.0.1";
const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
const STATIC_DIR = path.resolve(
  process.env.STATIC_DIR || path.join(__dirname, "..", "dist"),
);
const ADMIN_USER = process.env.ADMIN_USER || "ebraqg1029";
const ADMIN_PASS = process.env.ADMIN_PASS || "123456";
const ADMIN_NAME = process.env.ADMIN_NAME || "ابراهيم القحطاني";

await load();
await seedAdmin();

const app = express();
app.use(cors({ origin: CORS_ORIGIN === "*" ? true : CORS_ORIGIN.split(",") }));
app.use(express.json({ limit: "8mb" }));

// ---------- helpers ----------
const now = () => new Date().toLocaleString("ar-SA");
const today = () => new Date().toLocaleDateString("ar-SA");
const publicUser = (user) => {
  const rest = { ...user };
  delete rest.passwordHash;
  return rest;
};
const clean = (v) => (typeof v === "string" ? v.trim() : v);

function sign(user) {
  return jwt.sign({ uid: user.id }, JWT_SECRET, { expiresIn: "30d" });
}

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "غير مصرح" });
  try {
    const { uid } = jwt.verify(token, JWT_SECRET);
    const user = getState().users.find((u) => u.id === uid);
    if (!user) return res.status(401).json({ error: "الحساب غير موجود" });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "الجلسة منتهية" });
  }
}

const hasRole = (user, ...roles) =>
  user.roles.includes("Full Access") ||
  roles.some((role) => user.roles.includes(role));

function need(check) {
  return (req, res, next) => {
    if (!check(req.user))
      return res.status(403).json({ error: "لا تملك صلاحية لهذا الإجراء" });
    next();
  };
}
const canManageUsers = (u) => u.roles.includes("Full Access");
const canImportExport = (u) => u.roles.includes("Full Access");
const canManageParts = (u) => hasRole(u, "Parts Manager");
const canRequestParts = (u) => hasRole(u, "Team Manager", "Employee");
const canManageZones = (u) => hasRole(u, "Team Manager");
const canSendWeekly = (u) => hasRole(u, "Team Manager", "Employee");
const canDeleteSchool = (u) =>
  u.roles.includes("Full Access") || !u.roles.includes("Parts Manager");

const wrap = (fn) => (req, res) =>
  Promise.resolve(fn(req, res)).catch((err) => {
    if (err && err.status)
      return res.status(err.status).json({ error: err.message });
    console.error(err);
    res.status(500).json({ error: "خطأ في الخادم" });
  });
const fail = (status, message) => {
  const e = new Error(message);
  e.status = status;
  return e;
};

async function seedAdmin() {
  const state = getState();
  if (state.users.length) return;
  await mutate((s) => {
    s.users.push({
      id: nextId(),
      name: ADMIN_NAME,
      username: ADMIN_USER,
      passwordHash: bcrypt.hashSync(ADMIN_PASS, 10),
      roles: ["Full Access"],
      status: "نشط",
    });
  });
  console.log(`[seed] admin user "${ADMIN_USER}" created`);
}

// ---------- auth ----------
app.post(
  "/api/login",
  wrap(async (req, res) => {
    const username = clean(req.body.username);
    const password = String(req.body.password || "");
    const user = getState().users.find((u) => u.username === username);
    if (!user || !bcrypt.compareSync(password, user.passwordHash))
      throw fail(401, "اسم المستخدم أو كلمة المرور غير صحيحة");
    res.json({ token: sign(user), user: publicUser(user) });
  }),
);

app.get(
  "/api/bootstrap",
  auth,
  wrap(async (req, res) => {
    const s = getState();
    res.json({
      me: publicUser(req.user),
      users: s.users.map(publicUser),
      schools: s.schools,
      parts: s.parts,
      issues: s.issues,
      partRequests: s.partRequests,
      partReports: s.partReports,
      weeklyReports: s.weeklyReports,
      zoneAssignments: s.zoneAssignments,
      zoneSends: s.zoneSends,
    });
  }),
);

// ---------- schools ----------
const schoolPayload = (body) => ({
  name: clean(body.name),
  director: clean(body.director),
  ministryId: clean(body.ministryId),
  type: body.type || "مدرسة",
  gender: body.gender || "بنين",
  city: clean(body.city) || "",
  neighborhoodId: body.neighborhoodId ?? "",
  lat: Number(body.lat) || 24.7743,
  lng: Number(body.lng) || 46.7386,
});

app.post(
  "/api/schools",
  auth,
  wrap(async (req, res) => {
    const data = schoolPayload(req.body);
    if (!data.name || !data.director || !data.ministryId)
      throw fail(400, "بيانات المدرسة ناقصة");
    const school = await mutate((s) => {
      const record = {
        ...data,
        id: nextId(),
        status: "مكتمل",
        addedBy: req.user.name,
        addedAt: now(),
        updatedBy: req.user.name,
        updatedAt: now(),
      };
      s.schools.unshift(record);
      return record;
    });
    res.json(school);
  }),
);

app.patch(
  "/api/schools/:id",
  auth,
  wrap(async (req, res) => {
    const id = Number(req.params.id);
    const data = schoolPayload(req.body);
    const school = await mutate((s) => {
      const item = s.schools.find((x) => x.id === id);
      if (!item) throw fail(404, "المدرسة غير موجودة");
      Object.assign(item, data, {
        status: "مكتمل",
        updatedBy: req.user.name,
        updatedAt: now(),
      });
      return item;
    });
    res.json(school);
  }),
);

app.delete(
  "/api/schools/:id",
  auth,
  need(canDeleteSchool),
  wrap(async (req, res) => {
    const id = Number(req.params.id);
    await mutate((s) => {
      s.schools = s.schools.filter((x) => x.id !== id);
    });
    res.json({ ok: true });
  }),
);

app.post(
  "/api/schools/import",
  auth,
  need(canImportExport),
  wrap(async (req, res) => {
    const rows = Array.isArray(req.body.rows) ? req.body.rows : [];
    let added = 0;
    let updated = 0;
    let skipped = 0;
    await mutate((s) => {
      for (const row of rows) {
        const data = schoolPayload(row);
        if (!data.name || !data.director || !data.ministryId) {
          skipped += 1;
          continue;
        }
        const existing = s.schools.find(
          (x) => String(x.ministryId) === String(data.ministryId),
        );
        if (existing) {
          Object.assign(existing, data, {
            updatedBy: req.user.name,
            updatedAt: now(),
          });
          updated += 1;
        } else {
          s.schools.unshift({
            ...data,
            id: nextId(),
            status: "مكتمل",
            addedBy: req.user.name,
            addedAt: now(),
            updatedBy: req.user.name,
            updatedAt: now(),
          });
          added += 1;
        }
      }
    });
    res.json({ added, updated, skipped, total: rows.length });
  }),
);

// ---------- users ----------
const ROLES = ["Full Access", "Team Manager", "Employee", "Parts Manager"];

app.post(
  "/api/users",
  auth,
  need(canManageUsers),
  wrap(async (req, res) => {
    const name = clean(req.body.name);
    const username = clean(req.body.username);
    const roles = (req.body.roles || []).filter((r) => ROLES.includes(r));
    const password = String(req.body.password || "");
    if (!name || !username || !roles.length)
      throw fail(400, "بيانات المستخدم ناقصة");
    const user = await mutate((s) => {
      if (s.users.some((u) => u.username === username))
        throw fail(409, "اسم المستخدم مستخدم من قبل");
      const record = {
        id: nextId(),
        name,
        username,
        roles,
        status: "نشط",
        passwordHash: bcrypt.hashSync(password || "123456", 10),
      };
      s.users.push(record);
      return record;
    });
    res.json(publicUser(user));
  }),
);

app.patch(
  "/api/users/:id",
  auth,
  need(canManageUsers),
  wrap(async (req, res) => {
    const id = Number(req.params.id);
    const user = await mutate((s) => {
      const item = s.users.find((u) => u.id === id);
      if (!item) throw fail(404, "المستخدم غير موجود");
      if (req.body.name) item.name = clean(req.body.name);
      if (req.body.username) item.username = clean(req.body.username);
      if (Array.isArray(req.body.roles) && req.body.roles.length)
        item.roles = req.body.roles.filter((r) => ROLES.includes(r));
      if (req.body.password)
        item.passwordHash = bcrypt.hashSync(String(req.body.password), 10);
      return item;
    });
    res.json(publicUser(user));
  }),
);

app.delete(
  "/api/users/:id",
  auth,
  need(canManageUsers),
  wrap(async (req, res) => {
    const id = Number(req.params.id);
    await mutate((s) => {
      const item = s.users.find((u) => u.id === id);
      if (item && item.roles.includes("Full Access"))
        throw fail(400, "لا يمكن حذف حساب بصلاحية كاملة");
      s.users = s.users.filter((u) => u.id !== id);
    });
    res.json({ ok: true });
  }),
);

// ---------- parts ----------
app.post(
  "/api/parts",
  auth,
  need(canManageParts),
  wrap(async (req, res) => {
    const name = clean(req.body.name);
    const code = clean(req.body.code);
    if (!name || !code) throw fail(400, "بيانات القطعة ناقصة");
    const part = await mutate((s) => {
      const record = {
        id: nextId(),
        name,
        code,
        quantity: Number(req.body.quantity) || 0,
        minimum: Number(req.body.minimum) || 1,
        unit: req.body.unit || "قطعة",
      };
      s.parts.push(record);
      return record;
    });
    res.json(part);
  }),
);

// issue a part to a school (decrements stock)
app.post(
  "/api/issues",
  auth,
  need(canManageParts),
  wrap(async (req, res) => {
    const partId = Number(req.body.partId);
    const quantity = Number(req.body.quantity);
    const schoolId = Number(req.body.schoolId);
    const result = await mutate((s) => {
      const part = s.parts.find((p) => p.id === partId);
      if (!part) throw fail(404, "القطعة غير موجودة");
      if (!(quantity >= 1) || quantity > part.quantity)
        throw fail(400, "الكمية غير صحيحة أو أكبر من المتوفر");
      const school = s.schools.find((x) => x.id === schoolId);
      if (!school) throw fail(404, "المدرسة غير موجودة");
      part.quantity -= quantity;
      const issue = {
        id: nextId(),
        partId,
        partName: part.name,
        quantity,
        schoolId,
        schoolName: school.name,
        technician: req.user.name,
        date: today(),
        notes: clean(req.body.notes) || "",
      };
      s.issues.unshift(issue);
      return { issue, part };
    });
    res.json(result);
  }),
);

// ---------- part requests ----------
app.post(
  "/api/part-requests",
  auth,
  need(canRequestParts),
  wrap(async (req, res) => {
    const partId = Number(req.body.partId);
    const quantity = Number(req.body.quantity);
    const schoolId = Number(req.body.schoolId);
    const reportNumber = clean(req.body.reportNumber);
    const request = await mutate((s) => {
      const part = s.parts.find((p) => p.id === partId);
      const school = s.schools.find((x) => x.id === schoolId);
      if (!part || !school) throw fail(404, "القطعة أو المدرسة غير موجودة");
      if (!reportNumber) throw fail(400, "رقم البلاغ مطلوب");
      const pending = s.partRequests
        .filter((r) => r.partId === partId && r.status === "Pending")
        .reduce((sum, r) => sum + r.quantity, 0);
      if (!(quantity >= 1) || quantity > part.quantity - pending)
        throw fail(400, "الكمية المطلوبة غير متاحة");
      const record = {
        id: nextId(),
        partId,
        partName: part.name,
        quantity,
        schoolId,
        schoolName: school.name,
        reportNumber,
        notes: clean(req.body.notes) || "",
        requester: req.user.name,
        status: "Pending",
        createdAt: now(),
      };
      s.partRequests.unshift(record);
      return record;
    });
    res.json(request);
  }),
);

app.patch(
  "/api/part-requests/:id",
  auth,
  need(canManageParts),
  wrap(async (req, res) => {
    const id = Number(req.params.id);
    const status = req.body.status;
    if (!["Approved", "Rejected"].includes(status))
      throw fail(400, "حالة غير صحيحة");
    const result = await mutate((s) => {
      const request = s.partRequests.find((r) => r.id === id);
      if (!request) throw fail(404, "الطلب غير موجود");
      if (request.status !== "Pending")
        throw fail(400, "الطلب تمت معالجته مسبقًا");
      request.status = status;
      request.approvedBy = req.user.name;
      request.approvedAt = now();
      if (status === "Approved") {
        const part = s.parts.find((p) => p.id === request.partId);
        if (!part || request.quantity > part.quantity)
          throw fail(400, "المخزون غير كافٍ للاعتماد");
        part.quantity -= request.quantity;
        const issue = {
          id: nextId(),
          partId: request.partId,
          partName: request.partName,
          quantity: request.quantity,
          schoolId: request.schoolId,
          schoolName: request.schoolName,
          technician: request.requester,
          date: today(),
          notes: `اعتماد طلب ${request.reportNumber}`,
        };
        s.issues.unshift(issue);
      }
      return request;
    });
    res.json(result);
  }),
);

// ---------- reports ----------
app.post(
  "/api/part-reports",
  auth,
  need(canManageParts),
  wrap(async (req, res) => {
    const report = await mutate((s) => {
      const day = today();
      const issuedToday = s.issues.filter((i) => i.date === day);
      const record = {
        id: nextId(),
        date: day,
        sentBy: req.user.name,
        status: "Sent to Team Manager",
        issued: issuedToday.map((i) => ({
          partName: i.partName,
          schoolName: i.schoolName,
          quantity: i.quantity,
          technician: i.technician,
        })),
        totalIssued: issuedToday.reduce((sum, i) => sum + i.quantity, 0),
        lowStock: s.parts
          .filter((p) => p.quantity <= p.minimum)
          .map((p) => p.name),
        snapshot: s.parts.map((p) => ({
          name: p.name,
          code: p.code,
          quantity: p.quantity,
          minimum: p.minimum,
          unit: p.unit,
          low: p.quantity <= p.minimum,
        })),
      };
      s.partReports.unshift(record);
      return record;
    });
    res.json(report);
  }),
);

app.post(
  "/api/weekly-reports",
  auth,
  need(canSendWeekly),
  wrap(async (req, res) => {
    const schoolIds = (req.body.schoolIds || []).map(Number);
    if (!schoolIds.length) throw fail(400, "اختر المدارس");
    const partsSchoolIds = (req.body.partsSchoolIds || []).map(Number);
    const report = await mutate((s) => {
      const nameOf = (ids) =>
        s.schools.filter((x) => ids.includes(x.id)).map((x) => x.name);
      const record = {
        id: nextId(),
        date: today(),
        technician: req.user.name,
        schools: nameOf(schoolIds),
        partsAdded: Boolean(req.body.partsAdded),
        partsSchools: req.body.partsAdded ? nameOf(partsSchoolIds) : [],
        notes: clean(req.body.notes) || "",
        status: "Sent to Team Manager",
      };
      s.weeklyReports.unshift(record);
      return record;
    });
    res.json(report);
  }),
);

// ---------- zones ----------
app.post(
  "/api/zones/assign",
  auth,
  need(canManageZones),
  wrap(async (req, res) => {
    const districtId = String(req.body.districtId);
    const employeeId =
      req.body.employeeId == null ? null : Number(req.body.employeeId);
    await mutate((s) => {
      if (employeeId == null) delete s.zoneAssignments[districtId];
      else {
        s.zoneAssignments[districtId] = employeeId;
        delete s.zoneSends[employeeId];
      }
    });
    res.json(getState().zoneAssignments);
  }),
);

app.post(
  "/api/zones/clear",
  auth,
  need(canManageZones),
  wrap(async (req, res) => {
    const employeeId = Number(req.body.employeeId);
    await mutate((s) => {
      for (const [districtId, owner] of Object.entries(s.zoneAssignments))
        if (owner === employeeId) delete s.zoneAssignments[districtId];
      delete s.zoneSends[employeeId];
    });
    res.json({ assignments: getState().zoneAssignments, sends: getState().zoneSends });
  }),
);

app.post(
  "/api/zones/send",
  auth,
  need(canManageZones),
  wrap(async (req, res) => {
    const employeeId = Number(req.body.employeeId);
    const owned = Object.values(getState().zoneAssignments).filter(
      (owner) => owner === employeeId,
    ).length;
    if (!owned) throw fail(400, "لا توجد أحياء في هذا الزون");
    await mutate((s) => {
      s.zoneSends[employeeId] = today();
    });
    res.json(getState().zoneSends);
  }),
);

// ---------- static frontend ----------
app.use("/api", (req, res) => res.status(404).json({ error: "غير موجود" }));
app.use(express.static(STATIC_DIR));
app.get("*", (req, res) => {
  res.sendFile(path.join(STATIC_DIR, "index.html"));
});

app.listen(PORT, HOST, () => {
  console.log(`[tadm] API + site on http://${HOST}:${PORT}`);
});
