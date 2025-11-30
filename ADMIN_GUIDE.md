# 🔐 B2 Sports Academy - Admin Panel Güvenlik Sistemi

## 🎯 GİRİŞ BİLGİLERİ

### Admin Panel Erişimi
- **URL:** `http://localhost:3000/admin/login`
- **Kullanıcı Adı:** `b2academy`
- **Şifre:** `algansec#`

## 🛡️ GÜVENLİK ÖZELLİKLERİ

### 1. **Authentication (Kimlik Doğrulama)**
- ✅ **JWT Token Tabanlı:** 24 saatlik güvenli oturum
- ✅ **HTTP-Only Cookies:** XSS saldırılarına karşı korumalı
- ✅ **Bcrypt Password Hashing:** Şifreler hashlenmiş olarak saklanıyor
- ✅ **Secure Cookie Flags:** Production'da HTTPS zorunluluğu

### 2. **Rate Limiting (Hız Sınırlama)**
- ✅ **5 deneme / 15 dakika:** Brute force saldırılarına karşı koruma
- ✅ **IP bazlı takip:** Her IP adresi ayrı ayrı izlenir
- ✅ **Otomatik kilitleme:** Limit aşıldığında 15 dakika kilitleme

### 3. **Middleware Koruması**
- ✅ **Otomatik yönlendirme:** Oturum yoksa login sayfasına yönlendirir
- ✅ **Token doğrulama:** Her istekte token kontrol edilir
- ✅ **Role-based access:** Sadece admin rolü erişebilir

### 4. **Security Headers**
- ✅ **X-Frame-Options:** Clickjacking koruması
- ✅ **X-Content-Type-Options:** MIME sniffing koruması
- ✅ **X-XSS-Protection:** XSS saldırı koruması
- ✅ **Content-Security-Policy:** İçerik güvenlik politikası
- ✅ **Referrer-Policy:** Referrer bilgisi koruması

### 5. **Input Validation**
- ✅ **Sanitization:** Tüm girişler temizlenir
- ✅ **Type checking:** TypeScript ile tip güvenliği
- ✅ **Required fields:** Zorunlu alan kontrolleri

### 6. **Timing Attack Prevention**
- ✅ **Constant-time comparison:** Timing saldırılarına karşı gecikme ekleme
- ✅ **Same response time:** Başarılı/başarısız girişlerde aynı süre

## 📁 DOSYA YAPISI

```
src/
├── app/
│   ├── api/auth/
│   │   ├── login/route.ts      # Login endpoint
│   │   ├── logout/route.ts     # Logout endpoint
│   │   └── verify/route.ts     # Token verification
│   └── admin/
│       ├── login/page.tsx      # Login sayfası
│       ├── dashboard/page.tsx  # Dashboard sayfası
│       └── layout.tsx          # Admin layout
├── lib/
│   ├── auth.ts                 # Authentication logic
│   └── rate-limit.ts           # Rate limiting logic
└── middleware.ts               # Route protection
```

## 🚀 KULLANIM

### 1. Giriş Yapma
```
1. http://localhost:3000/admin/login adresine git
2. Kullanıcı adı: b2academy
3. Şifre: algansec#
4. "Giriş Yap" butonuna tıkla
```

### 2. Dashboard
- Sol sidebar: Navigasyon menüsü
- İstatistik kartları: Hızlı bilgiler
- Son aktiviteler: Sistem günlüğü
- Hızlı işlemler: Sık kullanılan özellikler

### 3. Çıkış Yapma
- Sol sidebar'ın altındaki "Çıkış Yap" butonuna tıkla

## 🔒 GÜVENLİK EN İYİ UYGULAMALARI

### Production Deployment İçin:
1. **JWT_SECRET'ı değiştir:**
   ```bash
   # .env.local dosyasında
   JWT_SECRET=your-super-secret-random-string-here
   ```

2. **HTTPS kullan:**
   - Vercel, Netlify gibi platformlar otomatik HTTPS sağlar

3. **Environment variables'ı koru:**
   - .env.local dosyasını asla commit etme
   - Vercel dashboard'dan environment variables ekle

4. **Database ekle (gelecek için):**
   - Admin credentials'ı veritabanına taşı
   - Session management için Redis kullan
   - Audit logging ekle

5. **2FA (Two-Factor Authentication) ekle:**
   - Ekstra güvenlik katmanı
   - Google Authenticator entegrasyonu

## 🛠️ API ENDPOINTS

### POST `/api/auth/login`
Giriş yapar ve JWT token döner.

**Request:**
```json
{
  "username": "b2academy",
  "password": "algansec#"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Giriş başarılı!",
  "user": {
    "username": "b2academy",
    "role": "admin"
  }
}
```

**Response (Error):**
```json
{
  "error": "Geçersiz kullanıcı adı veya şifre.",
  "remaining": 4
}
```

### POST `/api/auth/logout`
Çıkış yapar ve cookie'yi siler.

**Response:**
```json
{
  "success": true,
  "message": "Çıkış yapıldı."
}
```

### GET `/api/auth/verify`
Token'ı doğrular ve kullanıcı bilgilerini döner.

**Response:**
```json
{
  "authenticated": true,
  "user": {
    "username": "b2academy",
    "role": "admin"
  }
}
```

## 🎨 TASARIM ÖZELLİKLERİ

### Login Sayfası:
- ✨ Modern gradient background
- 🌊 Animated blob effects
- 🔐 Secure icons
- 📱 Fully responsive
- ⚡ Smooth transitions
- 🎯 User-friendly error messages

### Dashboard:
- 📊 Beautiful stat cards
- 🎨 Gradient color scheme
- 🔄 Real-time updates
- 📱 Mobile responsive
- 🎯 Intuitive navigation
- 💼 Professional layout

## 📊 İSTATİSTİKLER (Demo Data)

Dashboard'da görüntülenen örnek veriler:
- **Toplam Ziyaret:** 1,247
- **Aktif Üye:** 86
- **Bekleyen Talep:** 12
- **Aylık Gelir:** ₺45,230

## 🔄 GELECEK GELİŞTİRMELER

Sana hazır olan ve eklenecek özellikler:
1. ✅ Üye yönetim sistemi
2. ✅ Program düzenleme
3. ✅ Galeri yönetimi
4. ✅ İçerik düzenleme
5. ✅ Mesaj yönetimi
6. ✅ Raporlama ve analytics
7. ✅ Email bildirimler
8. ✅ Export/Import özellikleri

## 🐛 SORUN GİDERME

### "Çok fazla başarısız giriş denemesi"
- 15 dakika bekle veya
- Farklı bir IP'den dene

### "Token geçersiz"
- Çıkış yap ve tekrar giriş yap
- Browser cache'i temizle

### "Sayfa yüklenmiyor"
- Development server'ın çalıştığından emin ol
- `npm run dev` komutunu çalıştır

## 📞 DESTEK

Herhangi bir sorun veya soru için:
- Email: info@b2sportacademy.com
- WhatsApp: +90 540 300 14 34

---

**Not:** Bu sistem production-ready güvenlik önlemleri ile geliştirilmiştir. Lütfen production'a geçmeden önce tüm güvenlik kontrolleri yapıldığından emin olun.
