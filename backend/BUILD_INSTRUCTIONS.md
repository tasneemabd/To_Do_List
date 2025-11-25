# 🛠️ تعليمات بناء المشروع

## المشكلة:
عند محاولة تشغيل `npm start` بدون بناء المشروع، ستحصل على الخطأ:
```
Error: Cannot find module 'dist/server.js'
```

## الحل:

### خطوة 1: بناء المشروع (Build)

```bash
cd backend
npm run build
```

سيقوم هذا الأمر بـ:
- تحويل جميع ملفات TypeScript إلى JavaScript
- إنشاء مجلد `dist/` مع الملفات المترجمة

### خطوة 2: تشغيل المشروع

```bash
npm start
```

## الأوامر المتاحة:

### Development Mode (التطوير):
```bash
npm run dev
```
- ✅ لا يحتاج Build
- ✅ يعمل مباشرة مع ts-node
- ✅ Hot reload تلقائي عند تغيير الملفات

### Production Mode (الإنتاج):
```bash
# 1. Build أولاً
npm run build

# 2. ثم Start
npm start
```

## ملاحظات مهمة:

1. **للـ Development**: استخدم `npm run dev` مباشرة (لا حاجة لـ build)
2. **للـ Production**: يجب أن تبني المشروع أولاً بـ `npm run build`
3. تأكد من وجود ملف `.env` قبل التشغيل
4. تأكد من تشغيل MongoDB قبل البدء

## خطوات كاملة للبدء:

```bash
# 1. الانتقال لمجلد Backend
cd backend

# 2. تثبيت Dependencies (إذا لم تكن مثبتة)
npm install

# 3. إنشاء ملف .env (إذا لم يكن موجوداً)
# copy .env.example .env  # Windows
# cp .env.example .env    # Linux/Mac

# 4. تحديث ملف .env بالقيم الصحيحة

# 5. للتطوير - شغّل مباشرة:
npm run dev

# أو للإنتاج - Build ثم Start:
npm run build
npm start
```

## استكشاف الأخطاء:

### إذا ظهرت أخطاء في البناء:
```bash
# تحقق من أخطاء TypeScript
npm run lint

# أو
npx tsc --noEmit
```

### إذا لم يظهر مجلد dist بعد البناء:
- تحقق من ملف `tsconfig.json`
- تأكد من عدم وجود أخطاء في ملفات TypeScript
- تحقق من أن `outDir` في tsconfig.json = `./dist`

