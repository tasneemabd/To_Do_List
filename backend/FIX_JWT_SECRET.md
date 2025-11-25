# 🔧 إصلاح JWT_SECRET

## المشكلة:
`JWT_SECRET` في ملف `.env` قصير جداً (23 حرف فقط) بينما المطلوب 32 حرف على الأقل.

## الحل:

### الطريقة 1: إنشاء JWT_SECRET جديد عبر PowerShell

شغّل هذا الأمر في PowerShell:

```powershell
$jwtSecret = -join ((65..90) + (97..122) + (48..57) + (33..47) | Get-Random -Count 32 | ForEach-Object {[char]$_})
Write-Host "JWT_SECRET=$jwtSecret"
```

ثم انسخ الناتج وضعه في ملف `.env`.

### الطريقة 2: استخدام Node.js

```bash
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

### الطريقة 3: تحديث ملف .env يدوياً

1. افتح ملف `backend/.env`
2. ابحث عن السطر:
   ```
   JWT_SECRET=sG7!v9P@x2#qL8dR5%fZ1wM
   ```
3. استبدله بـ:
   ```
   JWT_SECRET=your-new-32-character-secret-key-minimum-here
   ```
   (يجب أن يكون 32 حرف على الأقل)

### مثال لـ JWT_SECRET صالح:

```
JWT_SECRET=Kx9#mP2$vL8@nQ5%wR3&tY7!uI1*oE6^dF4
```

أو:

```
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

## بعد التحديث:

احفظ الملف ثم شغّل:

```bash
npm run dev
```

المشروع يجب أن يعمل الآن! ✅

