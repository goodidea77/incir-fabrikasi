-- Satış temsilcileri
CREATE TABLE IF NOT EXISTS satis_temsilcileri (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ad text NOT NULL,
  aktif boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Başlangıç temsilcileri (isteğe göre düzenle)
INSERT INTO satis_temsilcileri (ad) VALUES
  ('Ahmet Yılmaz'),
  ('Fatma Kaya'),
  ('Mehmet Demir')
ON CONFLICT DO NOTHING;

-- Siparişler
CREATE TABLE IF NOT EXISTS siparisler (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  siparis_no text UNIQUE NOT NULL,
  tarih date NOT NULL,
  musteri_ad text NOT NULL,
  satis_temsilcisi text,
  urun_tanim_id uuid REFERENCES urun_tanimlari(id),
  urun_ad text NOT NULL,
  grade text NOT NULL,
  paket_gr integer NOT NULL,
  adet integer NOT NULL,
  birim_fiyat numeric(10,2) DEFAULT 0,
  toplam_tutar numeric(10,2) DEFAULT 0,
  durum text DEFAULT 'bekliyor',
  notlar text,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE satis_temsilcileri ENABLE ROW LEVEL SECURITY;
ALTER TABLE siparisler ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_all" ON satis_temsilcileri FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON siparisler FOR ALL USING (true) WITH CHECK (true);
