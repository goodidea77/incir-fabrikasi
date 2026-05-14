# İNCİR FABRİKASI — KURULUM REHBERİ
# Tahmini süre: 45-60 dakika

## ADIM 1 — Supabase Veritabanı Kurulumu (15 dk)

1. https://supabase.com adresine gidin
2. "Start your project" → GitHub ile ücretsiz kayıt olun
3. "New Project" → İsim: incir-fabrikasi → Şifre belirleyin → Region: EU West
4. Proje oluşturulana kadar bekleyin (~2 dk)

5. Sol menü → "SQL Editor" → "New Query"
6. supabase/migrations/001_schema.sql dosyasının tamamını kopyalayın
7. Yapıştırın → "RUN" butonuna basın
8. "Success" mesajı görmelisiniz

9. Sol menü → "Project Settings" → "API"
10. Şunları kopyalayıp bir yere kaydedin:
    - Project URL  → (SUPABASE_URL)
    - anon/public key → (SUPABASE_KEY)

## ADIM 2 — Uygulamaya URL Ekleme (2 dk)

src/App.jsx dosyasını metin editörüyle açın (Not Defteri veya VS Code)

Dosyanın başında bu satırları bulun:
    const SUPABASE_URL = window.SUPABASE_URL || "https://PROJE_ID.supabase.co";
    const SUPABASE_KEY = window.SUPABASE_KEY || "ANON_KEY_BURAYA";

Değiştirin:
    const SUPABASE_URL = "https://SIZIN_URL_BURAYA.supabase.co";
    const SUPABASE_KEY = "SIZIN_ANON_KEY_BURAYA";

Kaydedin.

## ADIM 3 — GitHub'a Yükle (10 dk)

1. https://github.com → Ücretsiz hesap oluşturun
2. "New Repository" → İsim: incir-fabrikasi → Public → Create
3. Bilgisayarınızda Git yoksa: https://git-scm.com/download/win

Komut satırı (CMD) açın, proje klasörüne gidin:
    cd incir-app
    git init
    git add .
    git commit -m "ilk kurulum"
    git branch -M main
    git remote add origin https://github.com/KULLANICI_ADINIZ/incir-fabrikasi.git
    git push -u origin main

## ADIM 4 — Netlify'a Deploy (10 dk)

1. https://netlify.com → "Sign up" → GitHub ile giriş
2. "Add new site" → "Import an existing project" → GitHub
3. incir-fabrikasi reposunu seçin
4. Build settings (otomatik algılanır):
   - Build command: npm run build
   - Publish directory: dist
5. "Deploy site" butonuna basın
6. 2-3 dakika bekleyin
7. Netlify size bir URL verir: https://incir-XXXXX.netlify.app

## ADIM 5 — Test (5 dk)

1. Verilen URL'yi telefonunuzda açın
2. Fabrika Müdürü ve çalışanlara aynı URL'yi gönderin
3. Herkes aynı anda kullanabilir!

## KULLANICI YÖNETİMİ (Sonraki Adım)

Şu an herkes sisteme girebilir. Gelecekte kullanıcı adı/şifre
eklemek isterseniz Supabase Auth modülünü aktive edebiliriz.

## DESTEK

Herhangi bir adımda takılırsanız Claude'a sorun,
adım adım yardım eder.

## SİSTEM ÖZELLİKLERİ

✓ Ana Giriş (Tartı Kapısı) — Çiftçi, tarih, plaka, kg
✓ Kalite Ayrıştırma — G1/G2/G3/Hurda, fire kaydı, denge kontrolü
✓ Üretim Emirleri — Onay akışı ile üretime alma
✓ Üretim Kaydı — Ham stoktan düşüş, nihai ürün stoğuna giriş
✓ Ham Stok — Grade bazlı, FIFO
✓ Nihai Ürün Stoğu — Adet ve kg bazlı
✓ Raporlar — Özet, üretim, maliyet analizi
✓ Gerçek zamanlı senkronizasyon — Tüm cihazlar anlık güncellenir
✓ Mobil uyumlu — Telefon ve tablet desteği
