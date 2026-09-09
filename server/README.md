# نشر tadm.online على الـ VPS (ويندوز)

المعمارية: `المتصفح → Caddy (443, HTTPS تلقائي) → Node (127.0.0.1:3000) → ملف db.json`
Node يقدّم موقع React والـ API معًا.

VPS: `5.196.158.195` — ويندوز، Node مثبّت، صلاحية أدمن.

---

## 1) تجهيز الملفات على الـ VPS

انسخ إلى الـ VPS (RDP / سحب وإفلات):

```
C:\tadm\
  ├─ dist\        ← ملفات موقع React المبنية (من npm run build)
  └─ server\      ← محتويات مجلد server (بدون node_modules)
```

في PowerShell على الـ VPS:

```powershell
cd C:\tadm\server
npm install
copy .env.example .env
notepad .env
```

عبّئ `.env`:

```
PORT=3000
HOST=127.0.0.1
JWT_SECRET=<الصق ناتج الأمر التالي>
DATA_FILE=C:\tadm\data\db.json
STATIC_DIR=C:\tadm\dist
ADMIN_USER=ebraqg1029
ADMIN_PASS=<كلمة مرور قوية>
ADMIN_NAME=ابراهيم القحطاني
CORS_ORIGIN=*
```

توليد JWT_SECRET:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

جرّب التشغيل يدويًا:

```powershell
node server.js
```

المفروض يطبع `[tadm] API + site on http://127.0.0.1:3000`. افتح `http://localhost:3000` داخل الـ VPS للتأكد. أوقفه بـ Ctrl+C.

---

## 2) تشغيل Node كخدمة ويندوز (NSSM)

1. نزّل NSSM من https://nssm.cc/download ، فك الضغط، انسخ `win64\nssm.exe` إلى `C:\tadm\`.
2. PowerShell كـ Administrator:

```powershell
cd C:\tadm
.\nssm.exe install tadm-api "C:\Program Files\nodejs\node.exe" "C:\tadm\server\server.js"
.\nssm.exe set tadm-api AppDirectory "C:\tadm\server"
.\nssm.exe set tadm-api AppStdout "C:\tadm\logs\api.log"
.\nssm.exe set tadm-api AppStderr "C:\tadm\logs\api.log"
.\nssm.exe set tadm-api Start SERVICE_AUTO_START
.\nssm.exe start tadm-api
```

(NSSM يقرأ `.env` تلقائيًا لأن `server.js` يستدعي `dotenv/config`.)

للتحديث لاحقًا: `.\nssm.exe restart tadm-api`

---

## 3) DNS — توجيه tadm.online للـ VPS

في Namecheap → **Domain List** → tadm.online → **Manage**:

1. قسم **NAMESERVERS** → غيّره إلى **Namecheap BasicDNS** → احفظ.
2. تبويب **Advanced DNS** → **Host Records** → احذف السجلات القديمة وأضف:

| Type | Host | Value | TTL |
|---|---|---|---|
| A Record | `@` | `5.196.158.195` | Automatic |
| A Record | `www` | `5.196.158.195` | Automatic |

الانتشار: ٣٠ دقيقة – ٦ ساعات. تحقّق من `dnschecker.org` (اكتب tadm.online، نوع A → لازم يظهر `5.196.158.195`).

> استضافة Namecheap Stellar تصير غير مستخدمة بعد هذا. احتفظ فيها كنسخة احتياطية أو ألغها لاحقًا.

---

## 4) الجدار الناري

**داخل الـ VPS** (PowerShell Administrator):

```powershell
New-NetFirewallRule -DisplayName "HTTP"  -Direction Inbound -Protocol TCP -LocalPort 80  -Action Allow
New-NetFirewallRule -DisplayName "HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow
```

**لوحة مزوّد الـ VPS**: تأكد أن بورت 80 و 443 مسموحة في الـ firewall / security group الخارجي.

---

## 5) Caddy — HTTPS تلقائي

1. نزّل `caddy_windows_amd64.exe` من https://caddyserver.com/download ، سمّه `caddy.exe` وحطّه في `C:\tadm\`.
2. أنشئ `C:\tadm\Caddyfile` بالمحتوى:

```
tadm.online, www.tadm.online {
    encode gzip
    reverse_proxy 127.0.0.1:3000
}
```

3. شغّل Caddy كخدمة (بعد ما ينتشر الـ DNS — يحتاجه ليصدر الشهادة):

```powershell
cd C:\tadm
.\nssm.exe install tadm-caddy "C:\tadm\caddy.exe" "run --config C:\tadm\Caddyfile"
.\nssm.exe set tadm-caddy AppDirectory "C:\tadm"
.\nssm.exe set tadm-caddy AppStdout "C:\tadm\logs\caddy.log"
.\nssm.exe set tadm-caddy AppStderr "C:\tadm\logs\caddy.log"
.\nssm.exe set tadm-caddy Start SERVICE_AUTO_START
.\nssm.exe start tadm-caddy
```

Caddy يجيب شهادة Let's Encrypt تلقائيًا لأول طلب ويجدّدها وحده.

---

## 6) التحقق

- افتح **https://tadm.online** → صفحة تسجيل الدخول.
- ادخل بـ `ADMIN_USER` / `ADMIN_PASS` من `.env`.
- أضف مدرسة، حدّث الصفحة → البيانات باقية ✅
- افتح من جهاز ثاني بنفس الحساب → نفس البيانات ✅

---

## التحديثات المستقبلية

**تغيير في الواجهة (React):**
```
# على جهازك:
npm run build
# انسخ محتويات dist\ إلى C:\tadm\dist على الـ VPS (استبدال)
```
(ما يحتاج إعادة تشغيل — Node يقرأ الملفات مباشرة.)

**تغيير في الـ API (server):**
```
# انسخ ملفات server\ المحدثة إلى C:\tadm\server
cd C:\tadm && .\nssm.exe restart tadm-api
```

---

## النسخ الاحتياطي

كل البيانات في ملف واحد: **`C:\tadm\data\db.json`**.
انسخه دوريًا (Task Scheduler → نسخة يومية إلى مجلد آخر / تخزين سحابي).

---

## استكشاف الأخطاء

| المشكلة | الحل |
|---|---|
| `npm install` يفشل | تأكد من اتصال الإنترنت؛ جرّب `npm install --verbose` |
| الموقع ما يفتح | `dnschecker.org` — الـ DNS انتشر؟ الخدمتان شغّالتان؟ (`services.msc` → tadm-api, tadm-caddy) |
| خطأ شهادة HTTPS | الـ DNS لازم يشير للـ VPS **قبل** تشغيل Caddy؛ بورت 80 لازم يكون مفتوح. راجع `C:\tadm\logs\caddy.log` |
| "تعذّر الاتصال بالخادم" في الواجهة | خدمة `tadm-api` متوقفة — `C:\tadm\logs\api.log` |
| نسيت كلمة مرور الأدمن | أوقف الخدمة، احذف مستخدم الأدمن من `db.json` (أو احذف الملف كله لبداية جديدة)، عدّل `.env`، شغّل الخدمة |
