# Mongoose Setup Instructions

تم تحديث المشروع لاستخدام Mongoose بدلاً من Prisma.

## التغييرات الرئيسية:

1. ✅ تم حذف Prisma وإستبداله بـ Mongoose
2. ✅ تم إنشاء Models باستخدام Mongoose (User.model.ts, Task.model.ts)
3. ✅ تم تحديث جميع Services لاستخدام Mongoose
4. ✅ تم إصلاح أخطاء TypeScript

## الإعداد السريع:

### 1. تثبيت Dependencies

```bash
cd backend
npm install
```

### 2. إعداد ملف .env

أنشئ ملف `.env` في مجلد `backend`:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=mongodb://localhost:27017/todo-list?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. تشغيل الخادم

```bash
npm run dev
```

### 4. Seed Database (اختياري)

```bash
npm run seed
```

سيتم إنشاء مستخدمين تجريبيين:
- john@example.com / password123
- jane@example.com / password123

## الفروقات بين Prisma و Mongoose:

### Prisma (تم إزالته):
- `prisma.user.findUnique()` → `User.findById()` في Mongoose
- `prisma.task.create()` → `Task.create()` في Mongoose
- Schema في ملف واحد (schema.prisma)

### Mongoose (الحالي):
- Models منفصلة (User.model.ts, Task.model.ts)
- استخدام Schema و Model من Mongoose
- دعم أفضل للـ Aggregation و Querying

## الملفات الجديدة:

- `src/models/User.model.ts` - نموذج المستخدم
- `src/models/Task.model.ts` - نموذج المهمة
- `src/config/database.ts` - إعدادات الاتصال بـ MongoDB
- `src/scripts/seed.ts` - ملف Seed البيانات
- `src/types/xss-clean.d.ts` - تعريفات TypeScript لـ xss-clean

## الملفات المحذوفة:

- `prisma/schema.prisma` - لم يعد مطلوباً
- جميع الإشارات إلى Prisma Client

## ملاحظات:

1. MongoDB يجب أن يكون قيد التشغيل قبل بدء الخادم
2. لا حاجة لتشغيل Migrations - Mongoose ينشئ الجداول تلقائياً
3. جميع الفهارس (Indexes) محددة في Models

