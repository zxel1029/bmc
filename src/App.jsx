import { useMemo, useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import {
  Bell,
  Building2,
  ChevronDown,
  ChevronLeft,
  CircleHelp,
  ClipboardCheck,
  Edit3,
  FileText,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Trash2,
  UserPlus,
  UserRound,
  Users,
  Wrench,
  X,
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import "./App.css";

const markerIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
const schoolsSeed = [];
const usersSeed = [
  {
    id: 1,
    name: "ابراهيم القحطاني",
    username: "ebraqg1029",
    roles: ["Full Access"],
    password: "123456",
    status: "نشط",
  },
];
const partsSeed = [];
const emptyPart = { name: "", code: "", quantity: 0, minimum: 1, unit: "قطعة" };
const emptyIssue = { partId: "", quantity: 1, schoolId: "", notes: "" };
const emptyWeeklyReport = {
  schoolIds: [],
  notes: "",
  partsAdded: false,
  partsSchoolIds: [],
};
const roleOptions = ["Full Access", "Team Manager", "Employee", "Parts Manager"];
const emptySchool = {
  name: "",
  director: "",
  ministryId: "",
  type: "مدرسة",
  gender: "بنين",
  city: "",
  lat: 24.7743,
  lng: 46.7386,
  status: "مكتمل",
};
function LocationPicker({ onChange }) {
  useMapEvents({
    click: ({ latlng }) =>
      onChange({ lat: latlng.lat.toFixed(4), lng: latlng.lng.toFixed(4) }),
  });
  return null;
}
function Credits() {
  return (
    <div className="credits">
     <span>•</span> برمجة وتطوير ابراهيم القحطاني
    </div>
  );
}

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  return (
    <div className="login-page" dir="rtl">
      <div className="login-art">
        <div className="login-brand">
          <span className="brand-mark">
            <img src="/supportnow_logo_s.svg" alt="supportnow" />
          </span>
          <b>Technical Support</b>
        </div>
        <div className="tech-scene" aria-hidden="true">
          <div className="tech-grid" />
          <div className="tech-orbit orbit-one"><span /></div>
          <div className="tech-orbit orbit-two"><span /></div>
          <div className="tech-core"><ShieldCheck size={52} /></div>
          <div className="tech-node node-one" /><div className="tech-node node-two" /><div className="tech-node node-three" />
        </div>
        <div className="art-copy">
          <span>نظام إدارة المدارس الموثوق</span>
          <h1>
            إدارة ذكية.
            <br />
            بيانات آمنة.
            <br />
            كفاءة أفضل.
          </h1>
          <p>منصة موثوقة لإدارة بيانات المدارس والمديرين وقطع الغيار</p>
        </div>
      </div>
      <div className="login-card">
        <div className="login-header">
          <span className="brand-mark">
            <img src="/supportnow_logo_s.svg" alt="supportnow" />
          </span>
          <p>مرحبًا بك في</p>
          <h2>Technical Support</h2>
          <span>سجّل الدخول للوصول إلى لوحة التحكم</span>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const valid = onLogin(username, password);
            if (!valid) setError("Invalid username or password");
          }}
        >
          <label>
            اسم المستخدم للدخول
            <div className="input-with-icon">
              <UserRound size={16} />
              <input
                type="text"
                required
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder=""
              />
            </div>
          </label>
          <label>
            كلمة المرور
            <div className="input-with-icon">
              <LockKeyhole size={16} />
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="أدخل كلمة المرور"
              />
            </div>
          </label>
          <div className="login-options">
            <label className="check">
              <input type="checkbox" /> تذكرني
            </label>
            <button type="button">نسيت كلمة المرور؟</button>
          </div>
          {error && <p className="login-error">{error}</p>}
          <button className="login-button">
            تسجيل الدخول <ChevronLeft size={17} />
          </button>
        </form>
        <small className="login-footer">
          © 2026 Technical Support. جميع الحقوق محفوظة
        </small>
        <Credits />
      </div>
    </div>
  );
}

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [schools, setSchools] = useState(schoolsSeed);
  const [users, setUsers] = useState(usersSeed);
  const [parts, setParts] = useState(partsSeed);
  const [issues, setIssues] = useState([]);
  const [stockReports, setStockReports] = useState([]);
  const [weeklyReports, setWeeklyReports] = useState([]);
  const [page, setPage] = useState("لوحة التحكم");
  const [query, setQuery] = useState("");
  const [schoolForm, setSchoolForm] = useState(emptySchool);
  const [partForm, setPartForm] = useState(emptyPart);
  const [issueForm, setIssueForm] = useState(emptyIssue);
  const [weeklyForm, setWeeklyForm] = useState(emptyWeeklyReport);
  const [userForm, setUserForm] = useState({
    name: "",
    username: "",
    roles: ["Employee"],
    password: "",
  });
  const [editingUser, setEditingUser] = useState(null);
  const [editing, setEditing] = useState(null);
  const [modal, setModal] = useState(null);
  const [role, setRole] = useState("Full Access");
  const [userMenu, setUserMenu] = useState(false);
  const filtered = useMemo(
    () =>
      schools.filter((school) =>
        [school.name, school.director, school.ministryId, school.city].some(
          (value) => value.includes(query),
        ),
      ),
    [schools, query],
  );
  const currentUser =
    users.find((user) => user.id === currentUserId) || users[0];
  const hasRole = (requestedRole) =>
    currentUser.roles.includes("Full Access") ||
    currentUser.roles.includes(requestedRole) ||
    role === requestedRole;
  if (!loggedIn)
    return (
      <Login
        onLogin={(username, password) => {
          const user = users.find((item) => item.username === username && item.password === password);
          if (!user) return false;
          setCurrentUserId(user.id);
          setRole(user.roles[0]);
          setLoggedIn(true);
          return true;
        }}
      />
    );
  const saveSchool = (event) => {
    event.preventDefault();
    if (!schoolForm.name || !schoolForm.director || !schoolForm.ministryId)
      return;
    const now = new Date().toLocaleString("ar-SA");
    setSchools((items) =>
      editing
        ? items.map((item) =>
            item.id === editing
              ? {
                  ...item,
                  ...schoolForm,
                  id: editing,
                  updatedBy: currentUser.name,
                  updatedAt: now,
                  status: "مكتمل",
                }
              : item,
          )
        : [
            {
              ...schoolForm,
              id: Date.now(),
              status: "مكتمل",
              addedBy: currentUser.name,
              addedAt: now,
              updatedBy: currentUser.name,
              updatedAt: now,
            },
            ...items,
          ],
    );
    setModal(null);
  };
  const saveUser = (event) => {
    event.preventDefault();
    if (!userForm.name || !userForm.username || !userForm.roles.length) return;
    setUsers((items) =>
      editingUser
        ? items.map((item) =>
            item.id === editingUser
              ? {
                  ...item,
                  ...userForm,
                  password: userForm.password || item.password,
                }
              : item,
          )
        : [
            ...items,
            {
              ...userForm,
              id: Date.now(),
              password: userForm.password || "123456",
              status: "نشط",
            },
          ],
    );
    setUserForm({ name: "", username: "", roles: ["Employee"], password: "" });
    setEditingUser(null);
    setModal(null);
  };
  const openUser = (user = null) => {
    setEditingUser(user?.id || null);
    setUserForm(
      user
        ? {
            name: user.name,
            username: user.username,
            roles: user.roles,
            password: "",
          }
        : { name: "", username: "", roles: ["Employee"], password: "" },
    );
    setModal("user");
  };
  const canManageUsers = currentUser.roles.includes("Full Access");
  const canSeeParts = hasRole("Full Access") || hasRole("Parts Manager");
  const canManageParts = hasRole("Parts Manager");
  const savePart = (event) => {
    event.preventDefault();
    if (!partForm.name || !partForm.code) return;
    setParts((items) => [
      ...items,
      {
        ...partForm,
        id: Date.now(),
        quantity: Number(partForm.quantity),
        minimum: Number(partForm.minimum),
      },
    ]);
    setPartForm(emptyPart);
    setModal(null);
  };
  const issuePart = (event) => {
    event.preventDefault();
    const part = parts.find((item) => item.id === Number(issueForm.partId));
    const quantity = Number(issueForm.quantity);
    if (
      !part ||
      !issueForm.schoolId ||
      quantity < 1 ||
      quantity > part.quantity
    )
      return;
    setParts((items) =>
      items.map((item) =>
        item.id === part.id
          ? { ...item, quantity: item.quantity - quantity }
          : item,
      ),
    );
    setIssues((items) => [
      {
        ...issueForm,
        id: Date.now(),
        partName: part.name,
        schoolName: schools.find(
          (school) => school.id === Number(issueForm.schoolId),
        )?.name,
        quantity,
        technician: currentUser.name,
        date: new Date().toLocaleDateString("ar-SA"),
      },
      ...items,
    ]);
    setStockReports((items) => [
      {
        id: Date.now(),
        date: new Date().toLocaleDateString("ar-SA"),
        partName: part.name,
        quantity,
        schoolName: schools.find(
          (school) => school.id === Number(issueForm.schoolId),
        )?.name,
        technician: currentUser.name,
        remaining: part.quantity - quantity,
      },
      ...items,
    ]);
    setIssueForm(emptyIssue);
    setModal(null);
  };
  const createStockReport = () => {
    setStockReports((items) => [
      {
        id: Date.now(),
        date: new Date().toLocaleDateString("ar-SA"),
        partName: "تقرير المخزون اليومي",
        quantity: 0,
        schoolName: "ملخص كامل",
        technician: currentUser.name,
        snapshot: parts.map((part) => ({
          name: part.name,
          quantity: part.quantity,
        })),
      },
      ...items,
    ]);
  };
  const saveWeeklyReport = (event) => {
    event.preventDefault();
    if (!weeklyForm.schoolIds.length) return;
    setWeeklyReports((items) => [
      {
        id: Date.now(),
        date: new Date().toLocaleDateString("ar-SA"),
        technician: currentUser.name,
        schools: schools
          .filter((school) => weeklyForm.schoolIds.includes(school.id))
          .map((school) => school.name),
        partsAdded: weeklyForm.partsAdded,
        partsSchools: schools
          .filter((school) => weeklyForm.partsSchoolIds.includes(school.id))
          .map((school) => school.name),
        notes: weeklyForm.notes,
        status: "Sent to Team Manager",
      },
      ...items,
    ]);
    setWeeklyForm(emptyWeeklyReport);
    setModal(null);
  };
  const openSchool = (school = emptySchool) => {
    setEditing(school.id || null);
    setSchoolForm(school);
    setModal("school");
  };
  const titles = {
    "لوحة التحكم": [
      "نظرة عامة",
      "تابع أداء النظام وبيانات المدارس من مكان واحد",
    ],
    المدارس: ["المدارس", "تابع بيانات المدارس ومواقعها الجغرافية من مكان واحد"],
    "قطع الغيار": [
      "قطع الغيار",
      "أدر المخزون وسجل القطع التي تم تسليمها للمدارس",
    ],
    المستخدمون: ["المستخدمون", "أضف أعضاء فريقك وتحكم في صلاحيات الوصول"],
    التقارير: ["التقارير", "راجع ملخصات البيانات والنشاط في النظام"],
    الإعدادات: ["الإعدادات", "تحكم في إعدادات المنصة والحساب"],
    "المساعدة والدعم": ["المساعدة والدعم", "فريقنا جاهز لمساعدتك"],
  };
  const navItems = [
    ["لوحة التحكم", LayoutDashboard],
    ["المدارس", Building2],
    ...(canSeeParts ? [["قطع الغيار", Package]] : []),
    ...(canManageUsers ? [["المستخدمون", Users]] : []),
    ["التقارير", FileText],
  ];
  return (
    <div className="app-shell" dir="rtl">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">
            <img src="/supportnow_logo_s.svg" alt="supportnow" />
          </span>
          <span>Technical Support</span>
        </div>
        <div className="workspace-label">
          نظام إدارة المدارس <span className="online-dot" />
        </div>
        <nav className="nav-list">
          {navItems.map(([label, Icon]) => (
            <button
              key={label}
              className={page === label ? "nav-item active" : "nav-item"}
              onClick={() => setPage(label)}
            >
              <Icon size={18} />
              <span>{label}</span>
              {label === "المدارس" && (
                <span className="nav-count">{schools.length}</span>
              )}
              {label === "المستخدمون" && (
                <span className="nav-count">{users.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button
            className={page === "الإعدادات" ? "nav-item active" : "nav-item"}
            onClick={() => setPage("الإعدادات")}
          >
            <Settings size={18} />
            <span>الإعدادات</span>
          </button>
          <button
            className={
              page === "المساعدة والدعم" ? "nav-item active" : "nav-item"
            }
            onClick={() => setPage("المساعدة والدعم")}
          >
            <CircleHelp size={18} />
            <span>المساعدة والدعم</span>
          </button>
          <div className="sidebar-footer">
            <div className="mini-avatar">ع</div>
            <div>
              <strong>{currentUser.name}</strong>
              <small>{role}</small>
            </div>
            <MoreHorizontal size={18} />
          </div>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu">
            <Menu size={21} />
          </button>
          <div className="breadcrumbs">
            <span>الرئيسية</span>
            <ChevronLeft size={14} />
            <strong>{page}</strong>
          </div>
          <div className="top-actions">
            <button className="icon-button notification">
              <Bell size={19} />
              <i />
            </button>
            <div className="profile-wrap">
              <button
                className="profile-button"
                onClick={() => setUserMenu(!userMenu)}
              >
                <span className="avatar">ع</span>
                <span>
                  <b>{currentUser.name}</b>
                  <small>{role}</small>
                </span>
                <ChevronDown size={16} />
              </button>
              {userMenu && (
                <div className="user-menu">
                  <button onClick={() => setLoggedIn(false)}>
                    <LogOut size={13} /> تسجيل الخروج
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <section className="page-content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">Technical Support</p>
              <h1>{titles[page][0]}</h1>
              <p className="subtitle">{titles[page][1]}</p>
            </div>
            {page === "المدارس" && (
              <button className="primary-button" onClick={() => openSchool()}>
                <Plus size={18} /> إضافة مدرسة
              </button>
            )}
            {page === "المستخدمون" && canManageUsers && (
              <button className="primary-button" onClick={() => openUser()}>
                <UserPlus size={18} /> إضافة مستخدم
              </button>
            )}
          </div>
          {page === "لوحة التحكم" && (
            <Dashboard
              schools={schools}
              users={users}
              userName={currentUser.name}
              go={setPage}
            />
          )}
          {page === "المدارس" && (
            <SchoolsPage
              schools={filtered}
              query={query}
              setQuery={setQuery}
              openEdit={openSchool}
              remove={(id) =>
                setSchools((items) => items.filter((item) => item.id !== id))
              }
              role={role}
            />
          )}
          {page === "المستخدمون" && canManageUsers && (
            <UsersPage
              users={users}
              role={role}
              canManageUsers={canManageUsers}
              onEdit={openUser}
              remove={(id) =>
                setUsers((items) => items.filter((item) => item.id !== id))
              }
            />
          )}
          {page === "قطع الغيار" && canSeeParts && (
            <PartsPage
              parts={parts}
              issues={issues}
              canManageParts={canManageParts}
              onAddPart={() => setModal("part")}
              onIssuePart={() => setModal("issue")}
            />
          )}
          {page === "التقارير" && (
              <ReportsPage
                currentUser={currentUser}
              schools={schools}
              users={users}
              parts={parts}
              issues={issues}
              stockReports={stockReports}
              weeklyReports={weeklyReports}
              roles={currentUser.roles}
              role={role}
              onCreateStockReport={createStockReport}
              onWeeklyReport={() => setModal("weekly")}
            />
          )}
          {page === "الإعدادات" && (
            <SimplePage
              icon={Settings}
              title="إعدادات النظام"
              text="يمكنك تحديث إعدادات الحساب والمنصة من هنا."
            />
          )}
          {page === "المساعدة والدعم" && (
            <SimplePage
              icon={CircleHelp}
              title="كيف يمكننا مساعدتك؟"
              text="فريق الدعم جاهز لمساعدتك في إدارة المدارس والمستخدمين."
            />
          )}
        </section>
      </main>
      {modal === "school" && (
        <SchoolModal
          form={schoolForm}
          setForm={setSchoolForm}
          editing={editing}
          save={saveSchool}
          close={() => setModal(null)}
        />
      )}
      {modal === "user" && (
        <UserModal
          form={userForm}
          setForm={setUserForm}
          editing={Boolean(editingUser)}
          save={saveUser}
          close={() => setModal(null)}
        />
      )}
      {modal === "part" && (
        <PartModal
          form={partForm}
          setForm={setPartForm}
          save={savePart}
          close={() => setModal(null)}
        />
      )}
      {modal === "issue" && (
        <IssueModal
          form={issueForm}
          setForm={setIssueForm}
          parts={parts}
          schools={schools}
          save={issuePart}
          close={() => setModal(null)}
        />
      )}
      {modal === "weekly" && (
        <WeeklyReportModal
          form={weeklyForm}
          setForm={setWeeklyForm}
          schools={schools}
          save={saveWeeklyReport}
          close={() => setModal(null)}
        />
      )}
    </div>
  );
}

function Dashboard({ schools, users, userName, go }) {
  return (
    <>
      <div className="stats-grid">
        <Stat
          icon={Building2}
          color="blue"
          label="إجمالي المدارس"
          value={schools.length}
        />
        <Stat
          icon={ShieldCheck}
          color="green"
          label="بيانات مكتملة"
          value={schools.filter((s) => s.status === "مكتمل").length}
        />
        <Stat
          icon={MapPin}
          color="orange"
          label="المدارس المكتملة"
          value={schools.filter((s) => s.status !== "مكتمل").length}
        />
        <Stat
          icon={Users}
          color="purple"
          label="المستخدمون النشطون"
          value={users.length}
        />
      </div>
      <div className="dashboard-grid">
        <div className="welcome-panel">
          <div>
            <span className="eyebrow">مساحتك الإدارية</span>
            <h2>
              أهلًا {userName}،<br />
              كل شيء تحت السيطرة.
            </h2>
            <p>{schools.length ? `تم تسجيل ${schools.length} مدارس في النظام.` : "ابدأ بإضافة أول مدرسة إلى النظام."}</p>
            <button className="primary-button" onClick={() => go("المدارس")}>
              مراجعة المدارس <ChevronLeft size={16} />
            </button>
          </div>
          <div className="welcome-shape">
            <ShieldCheck size={80} />
          </div>
        </div>
        <div className="panel quick-panel">
          <div className="panel-header">
            <div>
              <h2>الوصول السريع</h2>
              <p>إجراءات شائعة</p>
            </div>
          </div>
          <button onClick={() => go("المدارس")}>
            <Building2 size={18} />
            <span>إدارة المدارس</span>
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => go("المستخدمون")}>
            <Users size={18} />
            <span>إدارة المستخدمين</span>
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => go("التقارير")}>
            <FileText size={18} />
            <span>عرض التقارير</span>
            <ChevronLeft size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
function Stat({ icon: Icon, color, label, value }) {
  return (
    <div className="stat-card">
      <span className={`stat-icon ${color}`}>
        <Icon size={20} />
      </span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        <em>محدث الآن</em>
      </div>
    </div>
  );
}
function SchoolsPage({ schools, query, setQuery, openEdit, remove, role }) {
  return (
    <div className="panel schools-panel">
      <div className="panel-header">
        <div>
          <h2>قائمة المدارس</h2>
          <p>آخر المدارس المضافة والمحدثة</p>
        </div>
        <span className="table-total">{schools.length} مدارس</span>
      </div>
      <div className="toolbar">
        <div className="search-box">
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ابحث باسم المدرسة أو الرقم الوزاري..."
          />
        </div>
        <button className="filter-button">
          كل الأحياء <ChevronDown size={15} />
        </button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>اسم المدرسة</th>
              <th>مدير المدرسة</th>
              <th>الرقم الوزاري</th>
              <th>النوع</th>
              <th>الحي</th>
              <th>آخر تعديل</th>
              <th>الحالة</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {schools.map((school) => (
              <tr key={school.id}>
                <td>
                  <div className="school-cell">
                    <span className="school-icon">
                      <Building2 size={16} />
                    </span>
                    <div>
                      <strong>{school.name}</strong>
                      <small className="school-meta">
                        أضيفت بواسطة {school.addedBy || "—"}
                        <br />
                        {school.addedAt || "—"}
                      </small>
                    </div>
                  </div>
                </td>
                <td>{school.director}</td>
                <td className="number-cell">{school.ministryId}</td>
                <td>
                  {school.type}{" "}
                  <span className="gender-tag">{school.gender}</span>
                </td>
                <td>{school.city}</td>
                <td>
                  <span className="edit-meta">
                    {school.updatedBy || "—"}
                    <br />
                    {school.updatedAt || "—"}
                  </span>
                </td>
                <td>
                  <span
                    className={
                      school.status === "مكتمل"
                        ? "status complete"
                        : "status pending"
                    }
                  >
                    <i />
                    {school.status}
                  </span>
                </td>
                <td>
                  <div className="row-actions">
                    <button onClick={() => openEdit(school)}>
                      <Edit3 size={15} />
                    </button>
                    {role !== "Parts Manager" && (
                      <button onClick={() => remove(school.id)}>
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!schools.length && (
          <div className="empty-state">لا توجد نتائج مطابقة للبحث</div>
        )}
      </div>
    </div>
  );
}
function UsersPage({ users, role, canManageUsers, onEdit, remove }) {
  return (
    <div className="panel users-panel">
      <div className="panel-header">
        <div>
          <h2>حسابات المستخدمين</h2>
          <p>تحكم في أعضاء فريق Technical Support وصلاحياتهم</p>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>المستخدم</th>
              <th>اسم المستخدم</th>
              <th>الصلاحية</th>
              <th>الحالة</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="school-cell">
                    <span className="user-table-avatar">
                      {user.name.charAt(0)}
                    </span>
                    <strong>{user.name}</strong>
                  </div>
                </td>
                <td>{user.username}</td>
                <td>
                  <span
                    className={
                      user.roles.includes("Full Access")
                        ? "role-tag admin"
                        : "role-tag"
                    }
                  >
                    {user.roles.join("، ")}
                  </span>
                </td>
                <td>
                  <span className="status complete">
                    <i />
                    {user.status}
                  </span>
                </td>
                <td>
                  {canManageUsers && (
                    <div className="row-actions">
                      <button
                        className="delete-user"
                        title="تغيير كلمة المرور"
                        onClick={() => onEdit(user)}
                      >
                        <LockKeyhole size={15} />
                      </button>
                      {user.roles.includes("Full Access") === false && (
                        <button
                          className="delete-user"
                          title="حذف المستخدم"
                          onClick={() => remove(user.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function PartsPage({ parts, issues, onAddPart, onIssuePart }) {
  return (
    <div className="parts-page">
      <div className="parts-actions">
        <button className="primary-button" onClick={onIssuePart}>
          <Wrench size={17} /> تسجيل صرف لمدرسة
        </button>
        <button className="secondary-button" onClick={onAddPart}>
          <Plus size={17} /> إضافة قطعة للمخزون
        </button>
      </div>
      <div className="stats-grid parts-stats">
        <Stat
          icon={Package}
          color="blue"
          label="أصناف المخزون"
          value={parts.length}
        />
        <Stat
          icon={Wrench}
          color="green"
          label="القطع المصروفة"
          value={issues.reduce((sum, issue) => sum + issue.quantity, 0)}
        />
        <Stat
          icon={MapPin}
          color="orange"
          label="تحتاج إعادة طلب"
          value={parts.filter((part) => part.quantity <= part.minimum).length}
        />
      </div>
      <div className="panel parts-panel">
        <div className="panel-header">
          <div>
            <h2>مخزون قطع الغيار</h2>
            <p>Available stock and quantities for the Parts Manager</p>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>اسم القطعة</th>
                <th>الرمز</th>
                <th>الكمية المتوفرة</th>
                <th>حد إعادة الطلب</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {parts.map((part) => (
                <tr key={part.id}>
                  <td>
                    <div className="school-cell">
                      <span className="school-icon">
                        <Package size={16} />
                      </span>
                      <strong>{part.name}</strong>
                    </div>
                  </td>
                  <td className="number-cell">{part.code}</td>
                  <td>
                    <strong
                      className={
                        part.quantity <= part.minimum
                          ? "low-stock"
                          : "stock-number"
                      }
                    >
                      {part.quantity}
                    </strong>{" "}
                    {part.unit}
                  </td>
                  <td>
                    {part.minimum} {part.unit}
                  </td>
                  <td>
                    <span
                      className={
                        part.quantity <= part.minimum
                          ? "status pending"
                          : "status complete"
                      }
                    >
                      <i />
                      {part.quantity <= part.minimum ? "إعادة طلب" : "متوفر"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="panel parts-panel issue-history">
        <div className="panel-header">
          <div>
            <h2>سجل الصرف للمدارس</h2>
            <p>القطع التي استلمها الفنيون وتم تركيبها</p>
          </div>
        </div>
        {issues.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>القطعة</th>
                  <th>المدرسة</th>
                  <th>الكمية</th>
                  <th>الفني</th>
                  <th>التاريخ</th>
                  <th>ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue) => (
                  <tr key={issue.id}>
                    <td>
                      <strong>{issue.partName}</strong>
                    </td>
                    <td>{issue.schoolName}</td>
                    <td>{issue.quantity}</td>
                    <td>{issue.technician}</td>
                    <td>{issue.date}</td>
                    <td>{issue.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">لم يتم تسجيل أي عمليات صرف بعد</div>
        )}
      </div>
    </div>
  );
}

function PartModal({ form, setForm, save, close }) {
  return (
    <div className="modal-backdrop">
      <section className="user-modal">
        <div className="modal-header">
          <div>
            <h2>إضافة قطعة للمخزون</h2>
            <p>أدخل بيانات القطعة والكميات المتوفرة</p>
          </div>
          <button className="close-button" onClick={close}>
            <X size={19} />
          </button>
        </div>
        <form onSubmit={save}>
          <div className="form-grid">
            <label>
              اسم القطعة
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="مثال: كابل HDMI"
              />
            </label>
            <label>
              رمز القطعة
              <input
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="SP-1004"
              />
            </label>
            <label>
              الكمية
              <input
                required
                type="number"
                min="0"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
            </label>
            <label>
              حد إعادة الطلب
              <input
                required
                type="number"
                min="0"
                value={form.minimum}
                onChange={(e) => setForm({ ...form, minimum: e.target.value })}
              />
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={close}>
              إلغاء
            </button>
            <button className="primary-button">
              <Package size={17} />
              إضافة للمخزون
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function IssueModal({ form, setForm, parts, schools, save, close }) {
  return (
    <div className="modal-backdrop">
      <section className="user-modal">
        <div className="modal-header">
          <div>
            <h2>تسجيل صرف قطع غيار</h2>
            <p>سجل القطعة التي وضعها الفني في المدرسة</p>
          </div>
          <button className="close-button" onClick={close}>
            <X size={19} />
          </button>
        </div>
        <form onSubmit={save}>
          <div className="form-grid">
            <label>
              القطعة
              <select
                required
                value={form.partId}
                onChange={(e) => setForm({ ...form, partId: e.target.value })}
              >
                <option value="">اختر القطعة</option>
                {parts.map((part) => (
                  <option
                    key={part.id}
                    value={part.id}
                    disabled={!part.quantity}
                  >
                    {part.name} - المتوفر {part.quantity}
                  </option>
                ))}
              </select>
            </label>
            <label>
              المدرسة المستلمة
              <select
                required
                value={form.schoolId}
                onChange={(e) => setForm({ ...form, schoolId: e.target.value })}
              >
                <option value="">اختر المدرسة</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              الكمية
              <input
                required
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
            </label>
            <label>
              ملاحظات
              <input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="مكان التركيب أو وصف العطل"
              />
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={close}>
              إلغاء
            </button>
            <button className="primary-button">
              <Wrench size={17} />
              حفظ عملية الصرف
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
function WeeklyReportModal({ form, setForm, schools, save, close }) {
  const [query, setQuery] = useState("");
  const filteredSchools = schools.filter((school) =>
    `${school.name} ${school.ministryId}`.includes(query),
  );
  const toggleSchool = (field, id) =>
    setForm({
      ...form,
      [field]: form[field].includes(id)
        ? form[field].filter((item) => item !== id)
        : [...form[field], id],
    });
  return (
    <div className="modal-backdrop">
      <section className="user-modal weekly-modal">
        <div className="modal-header">
          <div>
            <h2>إرسال التقرير الأسبوعي</h2>
            <p>اختر المدارس التي باشرتها خلال هذا الأسبوع.</p>
          </div>
          <button className="close-button" onClick={close}>
            <X size={19} />
          </button>
        </div>
        <form onSubmit={save}>
          <label className="report-search">
            <Search size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث باسم المدرسة أو الرقم الوزاري"
            />
          </label>
          <div className="weekly-label">
            <ClipboardCheck size={17} /> المدارس التي تمت مباشرتها
          </div>
          <div className="weekly-schools">
            {filteredSchools.length ? (
              filteredSchools.map((school) => (
                <label
                  className="role-check weekly-school-card"
                  key={school.id}
                >
                  <input
                    type="checkbox"
                    checked={form.schoolIds.includes(school.id)}
                    onChange={() => toggleSchool("schoolIds", school.id)}
                  />
                  <span>
                    <strong>{school.name}</strong>
                    <small>الرقم الوزاري: {school.ministryId}</small>
                  </span>
                </label>
              ))
            ) : (
              <div className="empty-state">لا توجد مدارس مطابقة للبحث</div>
            )}
          </div>
          <label className="parts-question">
            <span>هل تم إضافة قطع غيار لأي مدرسة؟</span>
            <select
              value={form.partsAdded ? "نعم" : "لا"}
              onChange={(e) =>
                setForm({
                  ...form,
                  partsAdded: e.target.value === "نعم",
                  partsSchoolIds:
                    e.target.value === "نعم" ? form.partsSchoolIds : [],
                })
              }
            >
              <option>لا</option>
              <option>نعم</option>
            </select>
          </label>
          {form.partsAdded && (
            <>
              <div className="weekly-label">
                <Package size={17} /> المدارس التي أضيفت لها قطع غيار
              </div>
              <div className="weekly-schools parts-school-list">
                {filteredSchools.map((school) => (
                  <label
                    className="role-check weekly-school-card"
                    key={`parts-${school.id}`}
                  >
                    <input
                      type="checkbox"
                      checked={form.partsSchoolIds.includes(school.id)}
                      onChange={() => toggleSchool("partsSchoolIds", school.id)}
                    />
                    <span>
                      <strong>{school.name}</strong>
                      <small>الرقم الوزاري: {school.ministryId}</small>
                    </span>
                  </label>
                ))}
              </div>
            </>
          )}
          <label className="report-notes">
            ملخص الأعمال أو الملاحظات
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="اكتب ملخص الزيارات والأعمال المنجزة"
            />
          </label>
          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={close}>
              إلغاء
            </button>
            <button className="primary-button">
              <Send size={17} />
              Send to Team Manager
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
function ReportsPage({
  schools,
  users,
  parts,
  issues,
  stockReports,
  weeklyReports,
  roles,
  currentUser,
  role,
  onCreateStockReport,
  onWeeklyReport,
}) {
  const hasRole = (requestedRole) =>
    roles.includes("Full Access") ||
    roles.includes(requestedRole) ||
    role === requestedRole;
  const canViewStock = roles.includes("Parts Manager");
  const canSendWeekly = hasRole("Team Manager") || hasRole("Employee");
  const canViewAllWeekly = hasRole("Team Manager");
  const visibleWeeklyReports = canViewAllWeekly
    ? weeklyReports
    : weeklyReports.filter((report) => report.technician === currentUser.name);
  const downloadWeeklyPdf = (report) => {
    const schoolsList = report.schools.join("، ") || "لا توجد مدارس";
    const partsList = report.partsAdded
      ? (report.partsSchools || []).join("، ") || "لم تحدد مدرسة"
      : "لا";
    const reportHtml = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>التقرير الأسبوعي - ${report.technician}</title><style>body{font-family:Arial,sans-serif;padding:40px;color:#17233c;line-height:1.9}h1{color:#2369e8;font-size:24px;border-bottom:2px solid #2369e8;padding-bottom:12px}h2{font-size:16px;margin-top:28px}p{font-size:14px;background:#f4f7fb;padding:12px;border-radius:6px}table{width:100%;border-collapse:collapse;margin-top:15px}td,th{border:1px solid #dce4ef;padding:10px;text-align:right}th{background:#edf4ff}small{color:#718098}</style></head><body><h1>التقرير الأسبوعي للفني</h1><small>Technical Support</small><p><b>الفني:</b> ${report.technician}<br><b>التاريخ:</b> ${report.date}<br><b>الحالة:</b> ${report.status}</p><h2>المدارس التي تمت مباشرتها</h2><table><tr><th>المدارس</th></tr><tr><td>${schoolsList}</td></tr></table><h2>قطع الغيار</h2><table><tr><th>هل تم إضافة قطع غيار؟</th><th>المدارس المستفيدة</th></tr><tr><td>${report.partsAdded ? "نعم" : "لا"}</td><td>${partsList}</td></tr></table><h2>الملاحظات</h2><p>${report.notes || "لا توجد ملاحظات"}</p></body></html>`;
    const reportUrl = URL.createObjectURL(new Blob([reportHtml], { type: "text/html;charset=utf-8" }));
    const printWindow = window.open(reportUrl, "_blank", "width=900,height=700");
    if (!printWindow) return;
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      URL.revokeObjectURL(reportUrl);
    }, 900);
  };
  return (
    <div className="reports-page">
      <div className="reports-grid">
        <div className="panel report-card">
          <FileText size={22} />
          <h2>ملخص البيانات</h2>
          <strong>{schools.length}</strong>
          <p>إجمالي المدارس المسجلة</p>
        </div>
        <div className="panel report-card">
          <Users size={22} />
          <h2>نشاط الفريق</h2>
          <strong>{users.length}</strong>
          <p>مستخدمون لديهم صلاحية وصول</p>
        </div>
        <div className="panel report-card">
          <MapPin size={22} />
          <h2>التغطية الجغرافية</h2>
          <strong>{new Set(schools.map((s) => s.city)).size}</strong>
          <p>أحياء مسجلة</p>
        </div>
      </div>
      {canViewStock && (
        <section className="panel report-section">
          <div className="report-section-head">
            <div>
              <h2>
                <Package size={19} /> تقرير قطع الغيار اليومي
              </h2>
              <p>
                Daily issued items and remaining stock for Team Manager and Parts Manager.
              </p>
            </div>
            <button className="primary-button" onClick={onCreateStockReport}>
              <FileText size={16} /> إنشاء تقرير اليوم
            </button>
          </div>
          <div className="stock-report-summary">
            <span>
              الأصناف الحالية <b>{parts.length}</b>
            </span>
            <span>
              عمليات الصرف <b>{issues.length}</b>
            </span>
            <span>
              آخر تقرير <b>{stockReports[0]?.date || "لم ينشأ بعد"}</b>
            </span>
          </div>
          {stockReports.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>التاريخ</th>
                    <th>القطعة</th>
                    <th>الكمية المسحوبة</th>
                    <th>المدرسة</th>
                    <th>المتبقي</th>
                    <th>الفني</th>
                  </tr>
                </thead>
                <tbody>
                  {stockReports.slice(0, 8).map((report) =>
                    report.snapshot ? (
                      report.snapshot.map((item, index) => (
                        <tr key={`${report.id}-${index}`}>
                          <td>{report.date}</td>
                          <td>{item.name}</td>
                          <td>—</td>
                          <td>ملخص المخزون</td>
                          <td>
                            <strong>{item.quantity}</strong>
                          </td>
                          <td>{report.technician}</td>
                        </tr>
                      ))
                    ) : (
                      <tr key={report.id}>
                        <td>{report.date}</td>
                        <td>{report.partName}</td>
                        <td>{report.quantity}</td>
                        <td>{report.schoolName}</td>
                        <td>
                          <strong>{report.remaining}</strong>
                        </td>
                        <td>{report.technician}</td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              لا توجد عمليات صرف أو تقارير يومية حتى الآن
            </div>
          )}
        </section>
      )}
      {canSendWeekly && (
        <section className="panel report-section">
          <div className="report-section-head">
            <div>
              <h2>
                <ClipboardCheck size={19} /> التقرير الأسبوعي للفني
              </h2>
              <p>
                يسجل الفني المدارس التي باشرها خلال الأسبوع ويرسلها إلى مدير
                الفريق.
              </p>
            </div>
            <button className="primary-button" onClick={onWeeklyReport}>
              <Send size={16} /> إرسال تقرير الخميس
            </button>
          </div>
          {visibleWeeklyReports.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>الفني</th>
                    <th>المدارس التي تمت مباشرتها</th>
                    <th>قطع الغيار</th>
                    <th>التاريخ</th>
                    <th>الحالة</th>
                    <th>ملاحظات</th>
                    <th>PDF</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleWeeklyReports.map((report) => (
                    <tr key={report.id}>
                      <td>{report.technician}</td>
                      <td>{report.schools.join("، ")}</td>
                      <td>{report.partsAdded ? `نعم: ${(report.partsSchools || []).join("، ") || "لم تحدد مدرسة"}` : "لا"}</td>
                      <td>{report.date}</td>
                      <td>
                        <span className="status complete">
                          <i />
                          {report.status}
                        </span>
                      </td>
                      <td>{report.notes || "—"}</td>
                      <td><button className="pdf-button" onClick={() => downloadWeeklyPdf(report)}><FileText size={14} /> تحميل PDF</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">لم يتم إرسال تقرير أسبوعي بعد</div>
          )}
        </section>
      )}
    </div>
  );
}
function SimplePage({ icon: Icon, title, text }) {
  return (
    <div className="panel simple-page">
      <Icon size={32} />
      <h2>{title}</h2>
      <p>{text}</p>
      <button className="primary-button">حفظ التغييرات</button>
    </div>
  );
}
function SchoolModal({ form, setForm, editing, save, close }) {
  return (
    <div className="modal-backdrop">
      <section className="school-modal">
        <div className="modal-header">
          <div>
            <h2>{editing ? "تعديل بيانات المدرسة" : "إضافة مدرسة جديدة"}</h2>
            <p>أدخل بيانات المدرسة الأساسية وموقعها</p>
          </div>
          <button className="close-button" onClick={close}>
            <X size={19} />
          </button>
        </div>
        <form onSubmit={save}>
          <div className="form-grid">
            <label>
              اسم المدرسة
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label>
              اسم مدير المدرسة
              <input
                required
                value={form.director}
                onChange={(e) => setForm({ ...form, director: e.target.value })}
              />
            </label>
            <label>
              الرقم الوزاري
              <input
                required
                value={form.ministryId}
                onChange={(e) =>
                  setForm({ ...form, ministryId: e.target.value })
                }
              />
            </label>
            <label>
              اسم الحي
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="مثال: حي الياسمين"
              />
            </label>
            <label>
              نوع المنشأة
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option>مدرسة</option>
                <option>مجمع مدارس</option>
              </select>
            </label>
            <label>
              النوع
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              >
                <option>بنين</option>
                <option>بنات</option>
              </select>
            </label>
          </div>
          <div className="location-heading">
            <div>
              <h3>موقع المدرسة</h3>
              <p>اضغط على الخريطة لتحديد الإحداثيات</p>
            </div>
            <MapPin size={20} />
          </div>
          <div className="form-map">
            <MapContainer
              center={[Number(form.lat), Number(form.lng)]}
              zoom={10}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationPicker
                onChange={(coords) => setForm({ ...form, ...coords })}
              />
              <Marker
                position={[Number(form.lat), Number(form.lng)]}
                icon={markerIcon}
              />
            </MapContainer>
          </div>
          <div className="coordinates">
            <label>
              خط العرض
              <input
                value={form.lat}
                onChange={(e) => setForm({ ...form, lat: e.target.value })}
              />
            </label>
            <label>
              خط الطول
              <input
                value={form.lng}
                onChange={(e) => setForm({ ...form, lng: e.target.value })}
              />
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={close}>
              إلغاء
            </button>
            <button className="primary-button">
              <Plus size={17} />
              {editing ? "حفظ التعديلات" : "إضافة المدرسة"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
function UserModal({ form, setForm, editing, save, close }) {
  return (
    <div className="modal-backdrop">
      <section className="user-modal">
        <div className="modal-header">
          <div>
            <h2>
              {editing ? "تعديل المستخدم وصلاحياته" : "إضافة مستخدم جديد"}
            </h2>
            <p>
              {editing
                ? "غيّر الأدوار أو اكتب كلمة مرور جديدة"
                : "أنشئ حسابًا جديدًا لفريق العمل"}
            </p>
          </div>
          <button className="close-button" onClick={close}>
            <X size={19} />
          </button>
        </div>
        <form onSubmit={save}>
          <div className="form-grid">
            <label>
              اسم الشخص
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label>
              اسم المستخدم
              <input
                required
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="مثال: ibrahim.support"
              />
            </label>
            <label>
              كلمة المرور{" "}
              {editing && (
                <small className="field-hint">
                  اتركها فارغة للإبقاء على الحالية
                </small>
              )}
              <input
                type="password"
                required={!editing}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={editing ? "كلمة مرور جديدة" : "كلمة المرور"}
              />
            </label>
          </div>
          <div className="roles-field">
            <span>Roles & Permissions</span>
            <div className="roles-grid">
              {roleOptions.map((option) => (
                <label className="role-check" key={option}>
                  <input
                    type="checkbox"
                    checked={form.roles.includes(option)}
                    onChange={() =>
                      setForm({
                        ...form,
                        roles: form.roles.includes(option)
                          ? form.roles.filter((item) => item !== option)
                          : [...form.roles, option],
                      })
                    }
                  />
                  {option}
                </label>
              ))}
            </div>
            <small>Users can have more than one role.</small>
          </div>
          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={close}>
              إلغاء
            </button>
            <button className="primary-button">
              <UserPlus size={17} />
              {editing ? "حفظ التغييرات" : "إنشاء المستخدم"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
export default App;
