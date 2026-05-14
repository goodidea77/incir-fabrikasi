-- ============================================================
-- İNCİR FABRİKASI — Supabase Veritabanı Şeması
-- Supabase Dashboard → SQL Editor → New Query → Yapıştır → Run
-- ============================================================

-- Uzantılar
create extension if not exists "uuid-ossp";

-- ── 1. ÇİFTÇİLER ─────────────────────────────────────────────
create table if not exists ciftciler (
  id          uuid primary key default uuid_generate_v4(),
  ad          text not null unique,
  telefon     text,
  plaka       text,
  notlar      text,
  aktif       boolean default true,
  created_at  timestamptz default now()
);

-- ── 2. ANA GİRİŞLER (Tartı Kapısı) ───────────────────────────
create table if not exists girisler (
  id          uuid primary key default uuid_generate_v4(),
  sevk_no     text not null unique,   -- SVK-0001
  ciftci_id   uuid references ciftciler(id),
  ciftci_ad   text not null,          -- denormalize (hız için)
  tarih       date not null,
  plaka       text,
  kg          numeric(10,2) not null,
  fiyat       numeric(10,2) default 0,
  toplam      numeric(12,2) default 0,
  notlar      text,
  durum       text default 'bekliyor' check (durum in ('bekliyor','tamam')),
  created_at  timestamptz default now(),
  created_by  text default 'sistem'
);

-- ── 3. KALİTE AYRIŞTIRMA ─────────────────────────────────────
create table if not exists ayristirmalar (
  id          uuid primary key default uuid_generate_v4(),
  giris_id    uuid references girisler(id) on delete cascade,
  sevk_no     text not null,
  ciftci_ad   text not null,
  tarih       date not null,
  toplam_kg   numeric(10,2) not null,
  g1          numeric(10,2) default 0,  -- Grade 1
  g2          numeric(10,2) default 0,  -- Grade 2
  g3          numeric(10,2) default 0,  -- Grade 3
  gh          numeric(10,2) default 0,  -- Hurda
  fire        numeric(10,2) default 0,
  fire_not    text,
  created_at  timestamptz default now(),
  created_by  text default 'sistem'
);

-- ── 4. STOK ÇIKIŞLARI (Ham Ürün) ─────────────────────────────
create table if not exists cikislar (
  id          uuid primary key default uuid_generate_v4(),
  grade       text not null check (grade in ('Grade 1','Grade 2','Grade 3','Hurda')),
  kg          numeric(10,2) not null,
  tarih       date not null,
  sebep       text default 'Satış' check (sebep in ('Satış','İşleme','Üretime Gönderildi','Fire','Diğer')),
  notlar      text,
  uretim_emri_id uuid,               -- üretimden geliyorsa bağlantı
  created_at  timestamptz default now(),
  created_by  text default 'sistem'
);

-- ── 5. ÜRÜN TANIMLARI ────────────────────────────────────────
create table if not exists urun_tanimlari (
  id          uuid primary key default uuid_generate_v4(),
  kod         text not null unique,   -- orn: G1-300GR
  ad          text not null,          -- orn: Premium İncir 300gr
  grade       text not null check (grade in ('Grade 1','Grade 2','Grade 3','Hurda')),
  paket_gr    numeric(8,2) not null,  -- gram cinsinden paket ağırlığı
  paket_tipi  text default 'Paket' check (paket_tipi in ('Paket','Kutu','Kavanoz','Bulk')),
  aktif       boolean default true,
  created_at  timestamptz default now()
);

-- ── 6. ÜRETİM EMİRLERİ ───────────────────────────────────────
create table if not exists uretim_emirleri (
  id            uuid primary key default uuid_generate_v4(),
  emir_no       text not null unique,  -- URE-0001
  urun_tanim_id uuid references urun_tanimlari(id),
  urun_ad       text not null,
  grade         text not null,
  paket_gr      numeric(8,2) not null,
  hammadde_kg   numeric(10,2) not null,  -- kullanılacak ham kg
  hedef_adet    integer not null,         -- üretilecek paket adedi
  durum         text default 'bekliyor' check (durum in ('bekliyor','uretimde','tamamlandi','iptal')),
  notlar        text,
  talep_tarihi  date not null,
  created_at    timestamptz default now(),
  created_by    text default 'sistem'
);

-- ── 7. ÜRETİM KAYITLARI (Gerçekleşen Üretim) ────────────────
create table if not exists uretim_kayitlari (
  id              uuid primary key default uuid_generate_v4(),
  uretim_emri_id  uuid references uretim_emirleri(id),
  emir_no         text not null,
  urun_ad         text not null,
  grade           text not null,
  paket_gr        numeric(8,2) not null,
  kullanilan_kg   numeric(10,2) not null,  -- gerçekte kullanılan ham kg
  uretilen_adet   integer not null,         -- üretilen paket sayısı
  uretilen_kg     numeric(10,2) not null,   -- üretilen net kg (adet × paket_gr / 1000)
  fire_kg         numeric(10,2) default 0, -- üretim firesi
  uretim_tarihi   date not null,
  parti_no        text,                    -- URE-0001-P1
  notlar          text,
  created_at      timestamptz default now(),
  created_by      text default 'sistem'
);

-- ── 8. NİHAİ ÜRÜN STOK HAREKETLERİ ──────────────────────────
create table if not exists nihai_stok (
  id              uuid primary key default uuid_generate_v4(),
  urun_tanim_id   uuid references urun_tanimlari(id),
  urun_ad         text not null,
  grade           text not null,
  paket_gr        numeric(8,2) not null,
  hareket_tipi    text not null check (hareket_tipi in ('giris','cikis')),
  adet            integer not null,
  kg              numeric(10,2) not null,
  tarih           date not null,
  sebep           text,               -- 'Üretim', 'Satış', 'İade', 'Fire'
  referans_id     uuid,               -- uretim_kayitlari.id veya satis.id
  notlar          text,
  created_at      timestamptz default now(),
  created_by      text default 'sistem'
);

-- ── 9. GENEL GİDERLER ────────────────────────────────────────
create table if not exists giderler (
  id          uuid primary key default uuid_generate_v4(),
  ay          text not null,          -- 2025-05
  kategori    text not null,
  tutar       numeric(12,2) not null,
  aciklama    text,
  created_at  timestamptz default now(),
  created_by  text default 'sistem'
);

-- ── VİEWLAR (Hesaplanmış Görünümler) ─────────────────────────

-- Ham stok durumu (grade bazlı net)
create or replace view ham_stok_ozet as
select
  grade,
  coalesce(sum(case when tip='giris' then kg end), 0) as toplam_giris,
  coalesce(sum(case when tip='cikis' then kg end), 0) as toplam_cikis,
  coalesce(sum(case when tip='giris' then kg end), 0) -
  coalesce(sum(case when tip='cikis' then kg end), 0) as net_stok
from (
  -- Ayrıştırmadan gelen girişler
  select 'Grade 1' as grade, 'giris' as tip, coalesce(sum(g1),0) as kg from ayristirmalar
  union all select 'Grade 2', 'giris', coalesce(sum(g2),0) from ayristirmalar
  union all select 'Grade 3', 'giris', coalesce(sum(g3),0) from ayristirmalar
  union all select 'Hurda',   'giris', coalesce(sum(gh),0) from ayristirmalar
  -- Stok çıkışları
  union all select grade, 'cikis', coalesce(sum(kg),0) from cikislar group by grade
) t
group by grade;

-- Nihai ürün stok durumu
create or replace view nihai_stok_ozet as
select
  urun_ad,
  grade,
  paket_gr,
  sum(case when hareket_tipi='giris' then adet else -adet end) as net_adet,
  sum(case when hareket_tipi='giris' then kg else -kg end) as net_kg
from nihai_stok
group by urun_ad, grade, paket_gr;

-- ── ÖRNEK VERİ: Ürün Tanımları ───────────────────────────────
insert into urun_tanimlari (kod, ad, grade, paket_gr, paket_tipi) values
  ('G1-300GR',  'Premium İncir 300gr',      'Grade 1', 300,  'Paket'),
  ('G1-500GR',  'Premium İncir 500gr',      'Grade 1', 500,  'Paket'),
  ('G1-1KG',    'Premium İncir 1kg',        'Grade 1', 1000, 'Paket'),
  ('G1-5KG',    'Premium İncir 5kg',        'Grade 1', 5000, 'Kutu'),
  ('G2-300GR',  'Standart İncir 300gr',     'Grade 2', 300,  'Paket'),
  ('G2-500GR',  'Standart İncir 500gr',     'Grade 2', 500,  'Paket'),
  ('G2-1KG',    'Standart İncir 1kg',       'Grade 2', 1000, 'Paket'),
  ('G2-5KG',    'Standart İncir 5kg',       'Grade 2', 5000, 'Kutu'),
  ('G3-1KG',    'Ekonomik İncir 1kg',       'Grade 3', 1000, 'Paket'),
  ('G3-5KG',    'Ekonomik İncir 5kg',       'Grade 3', 5000, 'Kutu'),
  ('HR-BULK',   'Hurda İncir (Döküm)',      'Hurda',   0,    'Bulk')
on conflict (kod) do nothing;

-- ── ROW LEVEL SECURITY (Temel Güvenlik) ──────────────────────
alter table ciftciler        enable row level security;
alter table girisler         enable row level security;
alter table ayristirmalar    enable row level security;
alter table cikislar         enable row level security;
alter table urun_tanimlari   enable row level security;
alter table uretim_emirleri  enable row level security;
alter table uretim_kayitlari enable row level security;
alter table nihai_stok       enable row level security;
alter table giderler         enable row level security;

-- Şimdilik herkese okuma/yazma (production'da kullanıcı bazlı kısıtlanır)
create policy "public_all" on ciftciler        for all using (true) with check (true);
create policy "public_all" on girisler         for all using (true) with check (true);
create policy "public_all" on ayristirmalar    for all using (true) with check (true);
create policy "public_all" on cikislar         for all using (true) with check (true);
create policy "public_all" on urun_tanimlari   for all using (true) with check (true);
create policy "public_all" on uretim_emirleri  for all using (true) with check (true);
create policy "public_all" on uretim_kayitlari for all using (true) with check (true);
create policy "public_all" on nihai_stok       for all using (true) with check (true);
create policy "public_all" on giderler         for all using (true) with check (true);
