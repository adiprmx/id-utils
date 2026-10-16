// id-utils — pure-JS utilities for everyday Indonesian calculations.
// Zero dependencies. No DOM. All functions are standalone.
// Logic ported from the "indonesia" tool collection; rates and tables kept verbatim.

// ---------------------------------------------------------------------------
// Shared constants
// ---------------------------------------------------------------------------

export const HARI_PENUH = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
export const BULAN_SINGKAT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
export const BULAN_PENUH = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
export const PASARAN_NAMES = ['Legi', 'Pahing', 'Pon', 'Wage', 'Kliwon'];

const pad2 = (n) => String(n).padStart(2, '0');

// ---------------------------------------------------------------------------
// Anggaran lebaran
// ---------------------------------------------------------------------------

export const TIPS_LEBARAN = [
  'Beli tiket pulang SECEPATNYA — harga kereta & pesawat melesat tiap minggu mendekati hari H.',
  'Kereta api biasanya paling masuk akal buat keluarga: nyaman, anti macet, harga relatif stabil.',
  'THR kasih ke yang wajib dulu (orang tua, adik), sisanya boleh secukupnya — jangan gengsi.',
  'Parcel mending bikin sendiri daripada beli jadi — isi sama, harga bisa beda jauh.',
  'Zakat fitrah bayar lebih awal lewat amil biar tercatat rapi, nggak ribet pas malam takbiran.',
  'Sisakan dana darurat 10–15% dari total — perjalanan mudik selalu ada biaya tak terduga.',
  'Kalau naik mobil pribadi, servis + ganti oli H-7 biar nggak kena biaya bengkel darurat di tol.',
];

export function totalAnggaranLebaran(transport, thr, parcel, zakat) {
  transport = +transport || 0;
  thr = +thr || 0;
  parcel = +parcel || 0;
  zakat = +zakat || 0;
  const total = transport + thr + parcel + zakat;
  return { transport, thr, parcel, zakat, total };
}

export function ambilAcak(arr, n) {
  return arr.slice().sort(() => Math.random() - 0.5).slice(0, n);
}

// ---------------------------------------------------------------------------
// Anggaran nikah
// ---------------------------------------------------------------------------

export const DEFAULT_POS_NIKAH = [
  ['Katering', 40, 'Porsi paling gede: makanan tamu + keluarga.'],
  ['Gedung / venue', 20, 'Sewa tempat; kalau di rumah, alihkan ke tenda & kursi.'],
  ['Dekorasi', 10, 'Pelaminan, bunga, backdrop foto.'],
  ['Foto & video', 8, 'Dokumentasi seharian — jangan sampai nyesel.'],
  ['MUA & busana', 5, 'Rias pengantin + sewa baju akad/resepsi.'],
  ['Hiburan', 5, 'MC, band akustik, atau organ tunggal.'],
  ['Souvenir', 4, 'Bingkisan buat tamu undangan.'],
  ['Undangan & cetak', 3, 'Undangan fisik (yang digital mah gratis).'],
  ['Mahar / mas kawin', 3, 'Sesuai kesepakatan keluarga.'],
  ['Lain-lain', 2, 'Dana darurat: parkir, keamanan, tips, dll.'],
];

export function rincianAnggaranNikah(budget, labels, pcts) {
  const b = Math.max(0, +budget || 0);
  const ps = pcts.map((p) => {
    p = +p;
    return isFinite(p) && p >= 0 ? p : 0;
  });
  const totalPct = ps.reduce((a, x) => a + x, 0);
  const ok = Math.abs(totalPct - 100) < 0.001;
  const items = labels.map((label, i) => ({
    label,
    pct: ps[i],
    nominal: b * ps[i] / 100,
  }));
  return { budget: b, items, totalPct, ok };
}

export function normalisasiPersen(pcts) {
  const ps = pcts.map((p) => (+p >= 0 && isFinite(+p) ? +p : 0));
  const total = ps.reduce((a, x) => a + x, 0);
  if (!(total > 0)) return null;
  return ps.map((p) => parseFloat((p / total * 100).toFixed(1)));
}

// ---------------------------------------------------------------------------
// Arisan
// ---------------------------------------------------------------------------

export function parseNamaArisan(teks) {
  return String(teks).split('\n').map((s) => s.trim()).filter(Boolean);
}

export function kocokArisan(names) {
  if (!Array.isArray(names) || names.length < 2) return null;
  return names[Math.floor(Math.random() * names.length)];
}

export function keluarkanPemenang(names, winner) {
  return names.filter((x) => x !== winner);
}

// ---------------------------------------------------------------------------
// Balik nama kendaraan
// ---------------------------------------------------------------------------

export const JENIS_KENDARAAN = {
  motor: { label: 'Sepeda motor', stnk: 100000, tnkb: 60000, bpkb: 225000 },
  mobil: { label: 'Mobil', stnk: 200000, tnkb: 100000, bpkb: 375000 },
};

export function biayaBalikNama(jenis, njkb, pkb, swdkllj) {
  const j = JENIS_KENDARAAN[jenis] || JENIS_KENDARAAN.motor;
  njkb = +njkb || 0;
  pkb = +pkb || 0;
  swdkllj = +swdkllj || 0;
  if (!(njkb > 0)) return null;
  const bbnKb = Math.round(njkb * 0.01);
  const total = bbnKb + pkb + swdkllj + j.stnk + j.tnkb + j.bpkb;
  return {
    jenis: j.label,
    bbnKb,
    pkb,
    swdkllj,
    stnkBaru: j.stnk,
    tnkb: j.tnkb,
    bpkbBaru: j.bpkb,
    total,
  };
}

// ---------------------------------------------------------------------------
// Biaya perpanjang SIM (PNBP mengacu PP No. 60/2016 tentang PNBP Polri)
// ---------------------------------------------------------------------------

export const PNBP_SIM_DEFAULT = { 'SIM A': 80000, 'SIM C': 75000, 'SIM B1': 80000, 'SIM B2': 80000 };
export const BIAYA_KESEHATAN_DEFAULT = 25000;
export const BIAYA_PSIKOTES_DEFAULT = 50000;

export function biayaPerpanjangSIM(golongan, pnbp, kesehatan, psikotes) {
  const p = pnbp == null ? (PNBP_SIM_DEFAULT[golongan] || 0) : +pnbp;
  const s = kesehatan == null ? BIAYA_KESEHATAN_DEFAULT : +kesehatan;
  const t = psikotes == null ? BIAYA_PSIKOTES_DEFAULT : +psikotes;
  const pnbpVal = p || 0, sehatVal = s || 0, psikoVal = t || 0;
  return {
    golongan,
    pnbp: pnbpVal,
    kesehatan: sehatVal,
    psikotes: psikoVal,
    total: pnbpVal + sehatVal + psikoVal,
  };
}

// ---------------------------------------------------------------------------
// Bunga majemuk
// ---------------------------------------------------------------------------

export function simulasiBungaMajemuk(P, PMT, rPct, tahun, freq) {
  P = +P || 0;
  PMT = +PMT || 0;
  const r = (+rPct || 0) / 100;
  const Y = Math.max(1, Math.round(+tahun) || 1);
  const n = +freq;
  if (!(P > 0 || PMT > 0) || !(r >= 0) || !(n > 0)) return null;
  const i = r / n, N = Y * n;
  const per = N / Y;
  let bal = P, m = 0;
  const rows = [];
  for (let y = 1; y <= Y; y++) {
    for (let k = 0; k < per; k++) {
      bal *= (1 + i);
      m++;
      if (m <= N) bal += PMT * (12 / n);
    }
    rows.push({ tahun: y, saldo: bal });
  }
  const akhir = rows[rows.length - 1].saldo;
  const totalSetor = P + PMT * 12 * Y;
  return { rows, akhir, totalSetor, totalBunga: akhir - totalSetor };
}

// ---------------------------------------------------------------------------
// Cek operator seluler
// ---------------------------------------------------------------------------

export const OPERATOR_SELULER = [
  { name: 'Telkomsel', color: '#ef4444', prefixes: ['0811', '0812', '0813', '0821', '0822', '0823', '0852', '0853'] },
  { name: 'Indosat', color: '#f59e0b', prefixes: ['0814', '0815', '0816', '0855', '0856', '0857', '0858'] },
  { name: 'XL', color: '#22c55e', prefixes: ['0817', '0818', '0819', '0859', '0877', '0878'] },
  { name: 'Tri', color: '#a855f7', prefixes: ['0895', '0896', '0897', '0898', '0899'] },
  { name: 'Smartfren', color: '#3b82f6', prefixes: ['0881', '0882', '0883', '0884', '0885', '0886', '0887', '0888', '0889'] },
];

export function normalisasiNomor(s) {
  let d = String(s).replace(/\D/g, '');
  if (!d) return null;
  if (d.startsWith('62')) d = d.slice(2);
  else if (d.startsWith('0')) d = d.slice(1);
  if (!/^8\d{7,12}$/.test(d)) return null;
  return d;
}

// NOTE: the original tool compared the 0-stripped 4-digit prefix against the
// 0-prefixed table, so it never matched. Fixed here to restore the leading 0.
export function deteksiOperator(nomorTernormalisasi) {
  const p4 = '0' + String(nomorTernormalisasi).slice(0, 3);
  return OPERATOR_SELULER.find((o) => o.prefixes.includes(p4)) || null;
}

export function cekOperator(nomor) {
  const d = normalisasiNomor(nomor);
  if (!d) return null;
  const op = deteksiOperator(d);
  return {
    nomor: '+62' + d,
    prefix: '0' + d.slice(0, 3),
    operator: op ? op.name : null,
    color: op ? op.color : null,
  };
}

// ---------------------------------------------------------------------------
// Cicilan flat & anuitas
// ---------------------------------------------------------------------------

export function cicilanFlat(pokok, bungaTahunanPct, bulan) {
  pokok = +pokok || 0; bulan = Math.max(1, Math.round(+bulan) || 1);
  const totalBunga = pokok * (+bungaTahunanPct || 0) / 100 * (bulan / 12);
  const totalBayar = pokok + totalBunga;
  return { perBulan: totalBayar / bulan, totalBunga, totalBayar };
}

export function cicilanAnuitas(pokok, bungaTahunanPct, bulan) {
  pokok = +pokok || 0; bulan = Math.max(1, Math.round(+bulan) || 1);
  const r = (+bungaTahunanPct || 0) / 100 / 12;
  const perBulan = r > 0 ? (pokok * r) / (1 - Math.pow(1 + r, -bulan)) : pokok / bulan;
  const totalBayar = perBulan * bulan;
  return { perBulan, totalBunga: totalBayar - pokok, totalBayar };
}

export function bandingkanCicilan(pokok, bungaTahunanPct, bulan) {
  const flat = cicilanFlat(pokok, bungaTahunanPct, bulan);
  const anuitas = cicilanAnuitas(pokok, bungaTahunanPct, bulan);
  const lebihRingan = flat.totalBayar <= anuitas.totalBayar ? 'flat' : 'anuitas';
  return { flat, anuitas, lebihRingan };
}

// ---------------------------------------------------------------------------
// Countdown / hitung mundur
// ---------------------------------------------------------------------------

export const TANGGAL_LEBARAN_PERKIRAAN = new Date(2027, 2, 10, 0, 0, 0); // 10 Mar 2027, perkiraan

export function tahunBaruBerikutnya(now) {
  now = now || new Date();
  const y = now.getFullYear();
  if (now.getMonth() === 0 && now.getDate() === 1) return new Date(y, 0, 1);
  return new Date(y + 1, 0, 1);
}

export function natalBerikutnya(now) {
  now = now || new Date();
  let d = new Date(now.getFullYear(), 11, 25);
  if (d <= now) d = new Date(now.getFullYear() + 1, 11, 25);
  return d;
}

export function parseTanggalISO(s) {
  const [y, m, dd] = String(s).split('-').map(Number);
  return new Date(y, m - 1, dd);
}

export function hitungMundur(target, now) {
  now = now || new Date();
  const diff = target - now;
  if (diff <= 0) return { sudahTiba: true, hari: 0, jam: '00', menit: '00', detik: '00' };
  const s = Math.floor(diff / 1000);
  return {
    sudahTiba: false,
    hari: Math.floor(s / 86400),
    jam: pad2(Math.floor((s % 86400) / 3600)),
    menit: pad2(Math.floor((s % 3600) / 60)),
    detik: pad2(s % 60),
  };
}

// ---------------------------------------------------------------------------
// Denda pajak STNK
// ---------------------------------------------------------------------------

export function hitungDendaPajakSTNK(pkb, sw, bulanTelat) {
  pkb = +pkb; sw = +sw;
  const n = Math.floor(+bulanTelat);
  if (!(pkb >= 0) || !(sw >= 0) || !(n >= 0)) return null;
  let dendaPkb = 0, dendaSw = 0, persenSw = 0;
  if (n > 0) {
    dendaPkb = 0.02 * Math.min(n, 24) * pkb;
    persenSw = n <= 1 ? 0.25 : n === 2 ? 0.5 : n <= 4 ? 0.75 : 1;
    dendaSw = persenSw * sw;
  }
  const total = pkb + sw + dendaPkb + dendaSw;
  return {
    pkbPokok: pkb,
    swdklljPokok: sw,
    bulanDendaPkb: Math.min(n, 24),
    dendaPkb,
    persenDendaSw: persenSw,
    dendaSw,
    total,
  };
}

// ---------------------------------------------------------------------------
// Denda SPT tahunan
// ---------------------------------------------------------------------------

export function sptLateFine(jenisWp, bln, pajakTerutang) {
  bln = Math.floor(Number(bln));
  const terutang = Number(pajakTerutang);
  if (!(bln >= 0) || !(terutang >= 0)) {
    return { error: 'Isi bulan dan pajak terutang dengan angka yang benar.' };
  }
  const denda = jenisWp === 'badan' ? 1000000 : 100000;
  const bunga = 0.02 * bln * terutang;
  const total = denda + bunga;
  return { denda, bunga, total };
}

// ---------------------------------------------------------------------------
// Denda tilang — batas MAKSIMAL sesuai UU No. 22 Tahun 2009 tentang LLAJ.
// Nilai akhir ditentukan pengadilan, bukan angka ini.
// ---------------------------------------------------------------------------

export const TILANG_TABLE = [
  { id: 'helm', label: 'Tidak pakai helm SNI', pasal: 'Pasal 291 ayat (1) & (2)', denda: 250000, kurungan: '1 bulan' },
  { id: 'lawan-arah', label: 'Melawan arah (lawan arus)', pasal: 'Pasal 287', denda: 500000, kurungan: '2 bulan' },
  { id: 'sim', label: 'Tidak bawa / tidak punya SIM', pasal: 'Pasal 281', denda: 1000000, kurungan: '4 bulan' },
  { id: 'stnk', label: 'Tidak bawa STNK', pasal: 'Pasal 288 ayat (1)', denda: 500000, kurungan: '2 bulan' },
  { id: 'lampu-merah', label: 'Terobos lampu merah', pasal: 'Pasal 287 ayat (2)', denda: 500000, kurungan: '2 bulan' },
  { id: 'knalpot', label: 'Knalpot brong / tidak standar', pasal: 'Pasal 285 ayat (1)', denda: 250000, kurungan: '1 bulan' },
  { id: 'sabuk', label: 'Tidak pakai sabuk pengaman', pasal: 'Pasal 289', denda: 250000, kurungan: '1 bulan' },
  { id: 'hp', label: 'Main HP saat berkendara', pasal: 'Pasal 283', denda: 750000, kurungan: '3 bulan' },
];

export function tilangLookup(id) {
  return TILANG_TABLE.find((x) => x.id === id) || TILANG_TABLE[0];
}

// ---------------------------------------------------------------------------
// Diskon bertingkat
// ---------------------------------------------------------------------------

export function tieredDiscount(harga, discounts) {
  let sisa = +harga || 0;
  const tahapan = [];
  (discounts || []).forEach((d) => {
    d = Math.min(100, Math.max(0, +d || 0));
    const potongan = sisa * d / 100;
    sisa -= potongan;
    tahapan.push({ diskon: d, potongan, hargaSetelah: sisa });
  });
  return { tahapan, hargaAkhir: sisa, totalHemat: (+harga || 0) - sisa };
}

// ---------------------------------------------------------------------------
// Fee marketplace
// ---------------------------------------------------------------------------

export const MARKETPLACE_DEFAULTS = [
  { name: 'Shopee', fee: 10 },
  { name: 'Tokopedia', fee: 10 },
  { name: 'TikTok Shop', fee: 8 },
];

export function marketplaceFees(hargaJual, markets) {
  const h = Number(hargaJual);
  if (!(h > 0)) return null;
  return (markets || []).map((m) => {
    const f = Math.min(100, Math.max(0, Number(m.feePct ?? m.fee) || 0));
    const fix = Math.max(0, Number(m.fixRp) || 0);
    const feeRp = Math.round(h * f / 100) + Math.round(fix);
    const bersih = Math.max(0, h - feeRp);
    return { name: m.name, feePct: f, fixRp: fix, feeRp, bersih };
  });
}

// ---------------------------------------------------------------------------
// Format nomor HP Indonesia
// ---------------------------------------------------------------------------

export function normalizePhoneNumber(s) {
  let d = String(s).replace(/\D/g, '');
  if (!d) return null;
  if (d.startsWith('62')) d = d.slice(2);
  else if (d.startsWith('0')) d = d.slice(1);
  if (!/^8\d{7,12}$/.test(d)) return null;
  return d;
}

export function phoneNumberFormats(s) {
  const d = normalizePhoneNumber(s);
  if (!d) return null;
  return {
    digits: d,
    f0: '0' + d,
    f62plus: '+62' + d,
    f62: '62' + d,
    waLink: 'https://wa.me/' + '62' + d,
  };
}

// ---------------------------------------------------------------------------
// Konversi Masehi <-> Hijriah (algoritma Kuwaiti, kalender tabular).
// Perkiraan — bisa selisih 1-2 hari dari penetapan rukyat pemerintah.
// ---------------------------------------------------------------------------

export function gregorianToJdn(y, m, d) {
  const a = Math.floor((14 - m) / 12), yy = y + 4800 - a, mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}

export function jdnToHijri(jd) {
  let l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j = Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) + Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l = l - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const mm = Math.floor((24 * l) / 709), dd = l - Math.floor((709 * mm) / 24), yy = 30 * n + j - 30;
  return { y: yy, m: mm, d: dd };
}

export function hijriToJdn(y, m, d) {
  return Math.floor(d + Math.ceil(29.5 * (m - 1)) + (y - 1) * 354 + Math.floor((3 + 11 * y) / 30) + 1948439.5);
}

export function jdnToGregorian(jd) {
  let l = jd + 68569;
  const n = Math.floor(4 * l / 146097);
  l = l - Math.floor((146097 * n + 3) / 4);
  const i = Math.floor(4000 * (l + 1) / 1461001);
  l = l - Math.floor(1461 * i / 4) + 31;
  const j = Math.floor(80 * l / 2447);
  const dd = l - Math.floor(2447 * j / 80), mm = j + 2 - 12 * Math.floor(j / 11), yy = 100 * (n - 49) + i + Math.floor(j / 11);
  return { y: yy, m: mm, d: dd };
}

export const HIJRI_MONTHS = ['Muharram', 'Safar', 'Rabiulawal', 'Rabiulakhir', 'Jumadilawal', 'Jumadilakhir', 'Rajab', 'Syakban', 'Ramadan', 'Syawal', 'Zulkaidah', 'Zulhijah'];

export function weekdayFromJdn(jdn) {
  return HARI_PENUH[(jdn + 1) % 7];
}

export function gregorianToHijri(y, m, d) {
  const jdn = gregorianToJdn(y, m, d);
  const h = jdnToHijri(jdn);
  return { y: h.y, m: h.m, d: h.d, weekday: weekdayFromJdn(jdn), monthName: HIJRI_MONTHS[h.m - 1] };
}

export function hijriToGregorian(y, m, d) {
  const jdn = hijriToJdn(y, m, d);
  const g = jdnToGregorian(jdn);
  return { y: g.y, m: g.m, d: g.d, weekday: weekdayFromJdn(jdn), monthName: BULAN_PENUH[g.m - 1] };
}

// ---------------------------------------------------------------------------
// Tanggal selamatan (40/100/1000 harian) — patokan 17 Agustus 1945 = Jumat Legi
// ---------------------------------------------------------------------------

export const PASARAN_ANCHOR = Date.UTC(1945, 7, 17);

export function pasaranOf(t) {
  return PASARAN_NAMES[(((Math.round((t - PASARAN_ANCHOR) / 86400000) % 5) + 5) % 5)];
}

export function memorialDates(y, m, d) {
  const t0 = Date.UTC(y, m - 1, d);
  return [
    ['40 harian', 39],
    ['100 harian', 99],
    ['1000 harian', 999],
  ].map(([label, off]) => {
    const t = t0 + off * 86400000;
    const dt = new Date(t);
    return {
      label,
      date: dt,
      dayName: HARI_PENUH[dt.getUTCDay()],
      pasaran: pasaranOf(t),
    };
  });
}

export function daysFromToday(date) {
  const now = new Date();
  const todayT = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((date.getTime() - todayT) / 86400000);
}

// ---------------------------------------------------------------------------
// Upah lembur (acuan umum Kemenaker: upah/jam = gaji/173)
// ---------------------------------------------------------------------------

export function overtimePay(gaji, jamHariKerja, jamHariLibur) {
  const g = Number(gaji);
  if (!(g > 0)) return null;
  const uj = g / 173;
  const hk = Math.max(0, Number(jamHariKerja) || 0);
  const hl = Math.max(0, Number(jamHariLibur) || 0);
  const hk1 = Math.min(hk, 1);
  const hk2 = Math.max(0, hk - 1);
  const bayarHk = uj * (1.5 * hk1 + 2 * hk2);
  const hl2 = Math.min(hl, 7);
  const hl3 = Math.min(Math.max(0, hl - 7), 1);
  const hl4 = Math.max(0, hl - 8);
  const bayarHl = uj * (2 * hl2 + 3 * hl3 + 4 * hl4);
  const total = bayarHk + bayarHl;
  return {
    upahPerJam: uj,
    hariKerja: { jam1: hk1, jam2plus: hk2, subtotal: bayarHk },
    hariLibur: { jam2: hl2, jam3: hl3, jam4: hl4, subtotal: bayarHl },
    total,
  };
}

// ---------------------------------------------------------------------------
// Total bayar resto + patungan
// ---------------------------------------------------------------------------

export function restoBillTotal(struk, pajakPct, servicePct, orang) {
  const s = Number(struk);
  if (isNaN(s) || s < 0) return { error: 'Isi dulu total struknya.' };
  const pj = Number(pajakPct), sc = Number(servicePct);
  const pajak = s * (isNaN(pj) ? 0 : pj) / 100;
  const service = s * (isNaN(sc) ? 0 : sc) / 100;
  const total = s + pajak + service;
  const org = Math.max(1, Math.floor(Number(orang) || 1));
  return { pajak, service, total, orang: org, perOrang: total / org };
}

// ---------------------------------------------------------------------------
// Pembagian waris (faraidh) sederhana — ESTIMASI, bukan fatwa.
// ---------------------------------------------------------------------------

export function islamicInheritance(harta, opts) {
  const total = Number(harta);
  if (!(total > 0)) return { error: 'Total harta harus lebih dari 0.' };
  const o = opts || {};
  const nL = Math.max(0, Math.floor(Number(o.anakLaki) || 0));
  const nP = Math.max(0, Math.floor(Number(o.anakPerempuan) || 0));
  const adaAnak = (nL + nP) > 0;
  const adaAyah = !!o.adaAyah;
  const adaIbu = !!o.adaIbu;
  const pas = o.pasangan || 'none';

  const rows = [];
  let tetap = 0;
  if (pas === 'suami') { const f = adaAnak ? 1 / 4 : 1 / 2; rows.push({ label: 'Suami', bagian: adaAnak ? '1/4' : '1/2', frac: f }); tetap += f; }
  if (pas === 'istri') { const f = adaAnak ? 1 / 8 : 1 / 4; rows.push({ label: 'Istri', bagian: adaAnak ? '1/8' : '1/4', frac: f }); tetap += f; }
  if (adaIbu) { const f = adaAnak ? 1 / 6 : 1 / 3; rows.push({ label: 'Ibu', bagian: adaAnak ? '1/6' : '1/3', frac: f }); tetap += f; }
  if (adaAyah) { rows.push({ label: 'Ayah', bagian: '1/6' + (adaAnak ? '' : ' + sisa'), frac: 1 / 6 }); tetap += 1 / 6; }

  if (rows.length === 0 && !adaAnak) {
    return { error: 'Pilih dulu ahli warisnya (pasangan / anak / orang tua).' };
  }

  const sisa = Math.max(0, 1 - tetap);
  if (adaAnak) {
    const unit = sisa / (2 * nL + nP);
    if (nL > 0) rows.push({ label: 'Anak laki-laki × ' + nL, bagian: 'sisa ÷ 2:1', frac: 2 * nL * unit, per: 2 * unit, n: nL });
    if (nP > 0) rows.push({ label: 'Anak perempuan × ' + nP, bagian: 'sisa ÷ 2:1', frac: nP * unit, per: unit, n: nP });
  } else if (adaAyah && sisa > 0) {
    rows[rows.length - 1].frac += sisa;
  } else if (sisa > 0.0000001) {
    rows.push({ label: 'Residu', bagian: 'perlu penetapan', frac: sisa, residu: true });
  }

  const raw = rows.map((r) => r.frac * 100);
  const rounded = raw.map((v) => Math.round(v * 10) / 10);
  const diff = Math.round((100 - rounded.reduce((a, b) => a + b, 0)) * 10) / 10;
  let bigIdx = 0;
  rows.forEach((r, i) => { if (raw[i] > raw[bigIdx]) bigIdx = i; });
  rounded[bigIdx] = Math.round((rounded[bigIdx] + diff) * 10) / 10;

  return {
    totalHarta: total,
    totalPersen: 100,
    rows: rows.map((r, i) => ({
      label: r.label,
      bagian: r.bagian,
      persen: rounded[i],
      nominal: r.frac * total,
      nominalPerOrang: r.per ? r.per * total : null,
      residu: !!r.residu,
    })),
  };
}

// ---------------------------------------------------------------------------
// Iuran BPJS Kesehatan (per jiwa / bulan)
// ---------------------------------------------------------------------------

export const BPJS_TARIF = { '1': 150000, '2': 100000, '3': 35000 };
export const BPJS_LABEL = { '1': 'Kelas 1', '2': 'Kelas 2', '3': 'Kelas 3' };

export function bpjsContribution(kelas, jiwa) {
  const tarif = BPJS_TARIF[kelas] ?? BPJS_TARIF['2'];
  const label = BPJS_LABEL[kelas] ?? BPJS_LABEL['2'];
  const n = Math.max(1, Math.floor(Number(jiwa) || 0));
  const perBulan = tarif * n;
  const perTahun = perBulan * 12;
  return { label, tarif, jiwa: n, perBulan, perTahun };
}

// ---------------------------------------------------------------------------
// Iuran kas RT
// ---------------------------------------------------------------------------

export function iuranPerKK(targetDana, jmlKK) {
  const t = Number(targetDana);
  const j = Math.floor(Number(jmlKK) || 0);
  return j > 0 ? t / j : 0;
}

export function formatTanggalID(iso) {
  if (!iso) return '—';
  const p = String(iso).split('-');
  if (p.length !== 3) return iso;
  const d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  return HARI_PENUH[d.getDay()] + ', ' + d.getDate() + ' ' + BULAN_SINGKAT[d.getMonth()] + ' ' + d.getFullYear();
}

export function kasStats(warga, targetDana) {
  const target = Number(targetDana) || 0;
  let terkumpul = 0;
  (warga || []).forEach((w) => { terkumpul += Number(w.nominal) || 0; });
  const tunggak = (warga || []).filter((w) => !w.lunas);
  return { target, terkumpul, sisa: target - terkumpul, tunggak };
}

export function nominalBaruKK(nominalInput, targetDana, jmlKK) {
  const nomVal = Number(nominalInput);
  return nomVal > 0 ? nomVal : Math.round(iuranPerKK(targetDana, jmlKK));
}

// ---------------------------------------------------------------------------
// Jadwal piket (rotasi per hari aktif)
// ---------------------------------------------------------------------------

export const HARI_IDX = [1, 2, 3, 4, 5, 6, 0]; // Senin..Minggu
export const HARI_LABEL = { 0: 'Min', 1: 'Sen', 2: 'Sel', 3: 'Rab', 4: 'Kam', 5: 'Jum', 6: 'Sab' };

export function generateJadwalPiket(namaList, hariAktif, tglMulaiISO, jumlahHari = 14) {
  const nama = (namaList || []).map((s) => String(s).trim()).filter(Boolean);
  const aktif = hariAktif || [];
  if (!tglMulaiISO || !nama.length || !aktif.length) throw new Error('nama, hariAktif, dan tglMulaiISO wajib diisi');
  const [y0, m0, d0] = String(tglMulaiISO).split('-').map(Number);
  const rows = [];
  let k = 0;
  for (let d = 0; d < jumlahHari; d++) {
    const dt = new Date(y0, m0 - 1, d0 + d);
    const dow = dt.getDay();
    const tglStr = pad2(dt.getDate()) + '/' + pad2(dt.getMonth() + 1);
    const hari = HARI_PENUH[dow];
    if (aktif.indexOf(dow) === -1) {
      rows.push({ tanggal: tglStr, hari, petugas: null });
      continue;
    }
    const orang = nama[k % nama.length]; k++;
    rows.push({ tanggal: tglStr, hari, petugas: orang });
  }
  return rows;
}

// ---------------------------------------------------------------------------
// Jadwal ronda (rotasi tim per malam, 14 malam)
// ---------------------------------------------------------------------------

export function generateJadwalRonda(namaList, perMalam, tglMulaiISO) {
  const nama = (namaList || []).map((s) => String(s).trim()).filter(Boolean);
  const per = Math.floor(Number(perMalam) || 0);
  if (!tglMulaiISO || !nama.length || !(per >= 1)) throw new Error('nama, perMalam>=1, dan tglMulaiISO wajib diisi');
  const [y0, m0, d0] = String(tglMulaiISO).split('-').map(Number);
  const rows = [];
  for (let d = 0; d < 14; d++) {
    const dt = new Date(y0, m0 - 1, d0 + d);
    const tglStr = pad2(dt.getDate()) + '/' + pad2(dt.getMonth() + 1);
    const tim = [];
    for (let i = 0; i < per; i++) tim.push(nama[(d * per + i) % nama.length]);
    rows.push({ tanggal: tglStr, hari: HARI_PENUH[dt.getDay()], tim });
  }
  return rows;
}

// ---------------------------------------------------------------------------
// Jadwal shift karyawan
// ---------------------------------------------------------------------------

export const DEFAULT_POLA = [
  { kode: 'P', label: 'Pagi', jam: '08.00–16.00' },
  { kode: 'S', label: 'Siang', jam: '14.00–22.00' },
  { kode: 'M', label: 'Malam', jam: '22.00–08.00' },
  { kode: 'L', label: 'Libur', jam: '—' },
];
export const HARI_SINGKAT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export function isLiburShift(s) {
  return /^l(ibur)?$/i.test(s.kode) || /^libur$/i.test(s.label);
}

export function generateJadwalShift(pola, karyawan, tglMulaiISO, nHari) {
  const p = (pola || []).filter((s) => s.kode && String(s.kode).trim());
  const kry = (karyawan || []).map((k) => String(k).trim()).filter(Boolean);
  if (!tglMulaiISO || !p.length || !kry.length) throw new Error('pola, karyawan, dan tglMulaiISO wajib diisi');
  if (!(nHari >= 1 && nHari <= 365)) throw new Error('nHari harus 1–365');
  const [y0, m0, d0] = String(tglMulaiISO).split('-').map(Number);
  const rows = [];
  for (let d = 0; d < nHari; d++) {
    const dt = new Date(y0, m0 - 1, d0 + d);
    const shift = {};
    kry.forEach((k, ki) => {
      const s = p[(d + ki) % p.length];
      shift[k] = { kode: s.kode, label: s.label, jam: s.jam, libur: isLiburShift(s) };
    });
    rows.push({ tanggal: pad2(dt.getDate()) + '/' + pad2(dt.getMonth() + 1), hari: HARI_SINGKAT[dt.getDay()], shift });
  }
  return rows;
}

// ---------------------------------------------------------------------------
// Dana darurat
// ---------------------------------------------------------------------------

export const DANA_DARURAT_MULT = { lajang: 3, menikah: 6, anak: 12 };

export function emergencyFundProgress(pengeluaranBulanan, kali, tabunganSaatIni) {
  const belanja = Number(pengeluaranBulanan);
  if (!(belanja > 0)) throw new Error('pengeluaran per bulan harus > 0');
  let k = Number(kali);
  if (!(k > 0)) k = 3;
  const tabung = Number(tabunganSaatIni) || 0;
  const target = belanja * k;
  const progresPersen = Math.min(100, Math.max(0, tabung / target * 100));
  const sisa = Math.max(0, target - tabung);
  return { target, terkumpul: tabung, sisa, progresPersen, kali: k };
}

export function emergencyFundTarget(pengeluaranBulanan, status) {
  return emergencyFundProgress(pengeluaranBulanan, DANA_DARURAT_MULT[status] || 3, 0).target;
}

// ---------------------------------------------------------------------------
// Kalkulator emas
// ---------------------------------------------------------------------------

export function goldPriceFromWeight(gram, hargaPerGram) {
  const g = Number(gram);
  const h = Number(hargaPerGram);
  if (!(h > 0)) throw new Error('harga per gram harus > 0');
  if (!(g > 0)) throw new Error('berat harus > 0');
  return { gram: g, hargaPerGram: h, total: g * h };
}

export function goldWeightFromBudget(budget, hargaPerGram) {
  const b = Number(budget);
  const h = Number(hargaPerGram);
  if (!(h > 0)) throw new Error('harga per gram harus > 0');
  if (!(b > 0)) throw new Error('budget harus > 0');
  const g = b / h;
  const keping = Math.floor(g);
  const basis = keping >= 1 ? keping : 0.5;
  return { budget: b, hargaPerGram: h, gram: g, kepingBulat: keping, nilaiKepingBulat: basis * h };
}

// ---------------------------------------------------------------------------
// Simulasi gadai
// ---------------------------------------------------------------------------

export function gadaiSim(taksiran, tenorHari, loanPct = 90, sewaPct = 1.1) {
  const taks = Number(taksiran);
  if (!(taks > 0)) throw new Error('taksiran harus > 0');
  const lp = Number(loanPct), sr = Number(sewaPct);
  if (!(lp > 0 && lp <= 100) || !(sr >= 0 && sr <= 100)) throw new Error('plafon harus 1–100% dan sewa modal 0–100%');
  const tenor = Number(tenorHari);
  const pinjaman = taks * lp / 100;
  const periode = Math.ceil(tenor / 15);
  const sewaPerPeriode = pinjaman * sr / 100;
  const totalSewa = sewaPerPeriode * periode;
  return { taksiran: taks, tenorHari: tenor, periode, loanPct: lp, sewaPct: sr, pinjaman, sewaPerPeriode, totalSewa, tebus: pinjaman + totalSewa };
}

// ---------------------------------------------------------------------------
// Patungan kurban
// ---------------------------------------------------------------------------

export const KURBAN_MAX_PESERTA = { sapi: 7, kambing: 1 };

export function kurbanShare(hewan, harga, peserta) {
  const max = KURBAN_MAX_PESERTA[hewan] ?? 7;
  const h = Number(harga);
  if (!(h > 0)) throw new Error('harga hewan harus > 0');
  const p = (peserta || []).map((n) => String(n).trim()).filter(Boolean);
  if (p.length > max) throw new Error(hewan + ' maksimal ' + max + ' orang per hewan');
  if (!p.length) throw new Error('isi minimal 1 nama peserta');
  return {
    hewan,
    harga: h,
    jumlahPeserta: p.length,
    iuranPerOrang: h / p.length,
    patungan: p.length > 1,
    peserta: p,
  };
}

// ---------------------------------------------------------------------------
// Upah lembur sederhana (jam ke-1 ×1,5, sisanya ×2)
// ---------------------------------------------------------------------------

export const LEMBUR_PEMBAGI = 173;
export const LEMBUR_FAKTOR_JAM1 = 1.5;
export const LEMBUR_FAKTOR_LAIN = 2.0;

export function overtimePaySimple(gaji, jam) {
  const g = Number(gaji);
  const n = Math.floor(Number(jam));
  if (!(g > 0) || !(n > 0)) throw new Error('gaji dan jam lembur harus > 0');
  const perJam = g / LEMBUR_PEMBAGI;
  const rincian = [];
  let total = 0;
  for (let i = 1; i <= n; i++) {
    const faktor = i === 1 ? LEMBUR_FAKTOR_JAM1 : LEMBUR_FAKTOR_LAIN;
    const nilai = perJam * faktor;
    total += nilai;
    rincian.push({ jam: i, faktor, nilai });
  }
  return { gaji: g, jam: n, upahPerJam: perJam, total, rincian };
}

// ---------------------------------------------------------------------------
// Pesangon (versi sederhana dari PP 35/2021 — estimasi, bukan angka pasti)
// ---------------------------------------------------------------------------

export function severanceUpMultiplier(masaKerjaTahun) {
  const th = masaKerjaTahun;
  return th < 1 ? 1 : th < 2 ? 2 : th < 3 ? 3 : th < 4 ? 4 : th < 5 ? 5 : th < 6 ? 6 : th < 7 ? 7 : th < 8 ? 8 : 9;
}

export function severanceUpmkMultiplier(masaKerjaTahun) {
  const th = masaKerjaTahun;
  return th < 3 ? 0 : th < 6 ? 2 : th < 9 ? 3 : th < 12 ? 4 : th < 15 ? 5 : th < 18 ? 6 : th < 21 ? 7 : th < 24 ? 8 : 10;
}

export const SEVERANCE_REASON_RATIO = { biasa: 1, efisiensi: 0.5, pensiun: 1.75, meninggal: 2 };

export function calcPesangon(gajiBulanan, masaKerjaTahun, alasan) {
  const gaji = Number(gajiBulanan) || 0;
  const th = Number(masaKerjaTahun);
  if (!(gaji > 0) || !(th >= 0)) return null;
  const r = SEVERANCE_REASON_RATIO[alasan] || 1;
  const upEff = severanceUpMultiplier(th) * r;
  const up = gaji * upEff;
  const upmkEff = severanceUpmkMultiplier(th);
  const upmk = gaji * upmkEff;
  const uph = 0.15 * (up + upmk);
  const total = up + upmk + uph;
  return { up, upEff, upmk, upmkEff, uph, total };
}

// ---------------------------------------------------------------------------
// MDR QRIS (tarif BI; batas bebas potongan per transaksi)
// ---------------------------------------------------------------------------

export const QRIS_MDR_TIERS = {
  mikro: { bebas: 500000, rate: 0.3 },
  kecil: { bebas: 100000, rate: 0.7 },
  menengah: { bebas: 100000, rate: 0.7 },
  besar: { bebas: 100000, rate: 0.7 },
  pendidikan: { bebas: 0, rate: 0.6 },
  khusus: { bebas: 0, rate: 0.4 },
};

export function calcMdrQris(nominal, kategori, mdrKustomPct) {
  const n = Number(nominal);
  if (!(n > 0)) return null;
  let rate, tierNote;
  if (kategori === 'kustom') {
    rate = Number(mdrKustomPct);
    if (isNaN(rate) || rate < 0) rate = 0;
    tierNote = 'tarif kustom';
  } else {
    const t = QRIS_MDR_TIERS[kategori];
    if (!t) return null;
    if (t.bebas > 0 && n <= t.bebas) {
      rate = 0;
      tierNote = 'bebas potongan (≤ Rp' + t.bebas + ' per transaksi)';
    } else {
      rate = t.rate;
      tierNote = t.bebas > 0 ? 'di atas batas bebas potongan Rp' + t.bebas : 'tarif tetap';
    }
  }
  const potongan = n * rate / 100;
  const diterima = n - potongan;
  return { nominal: n, kategori, rate, tierNote, potongan, diterima };
}

// ---------------------------------------------------------------------------
// Patungan bill
// ---------------------------------------------------------------------------

export function splitBill(total, pajakPct, servicePct, orang) {
  total = +total || 0; pajakPct = +pajakPct || 0; servicePct = +servicePct || 0;
  orang = Math.max(1, Math.round(+orang) || 1);
  const pajak = total * pajakPct / 100;
  const service = total * servicePct / 100;
  const grandTotal = total + pajak + service;
  return { subtotal: total, pajak, service, grandTotal, perOrang: grandTotal / orang };
}

export function roundBillUp(nilai, kelipatan) {
  const b = +kelipatan || 0;
  return b > 0 ? Math.ceil(nilai / b) * b : nilai;
}

// ---------------------------------------------------------------------------
// Kode plat nomor kendaraan Indonesia
// ---------------------------------------------------------------------------

export const PLAT_NOMOR = {
  A: ['Banten', 'Serang, Cilegon, Pandeglang, Lebak'],
  B: ['DKI Jakarta & Bodetabek', 'Jakarta, Depok, Bekasi, Tangerang, Tangerang Selatan'],
  D: ['Bandung Raya', 'Kota/Kab. Bandung, Bandung Barat, Cimahi'],
  E: ['Ciayumajakuning', 'Cirebon, Indramayu, Majalengka, Kuningan'],
  F: ['Bogor & Sukabumi', 'Kota/Kab. Bogor, Sukabumi, Cianjur'],
  T: ['Karawang & sekitar', 'Karawang, Purwakarta, Subang'],
  Z: ['Priangan Timur', 'Garut, Tasikmalaya, Ciamis, Banjar, Pangandaran, Sumedang'],
  G: ['Pekalongan (Pantura Barat)', 'Pekalongan, Tegal, Brebes, Batang, Pemalang'],
  H: ['Semarang', 'Kota/Kab. Semarang, Kendal, Demak, Salatiga'],
  K: ['Pati (Pantura Timur)', 'Pati, Kudus, Jepara, Rembang, Blora, Grobogan'],
  R: ['Banyumas', 'Banyumas, Cilacap, Purbalingga, Banjarnegara'],
  AA: ['Kedu', 'Magelang, Temanggung, Wonosobo, Purworejo, Kebumen'],
  AB: ['DI Yogyakarta', 'Kota Yogyakarta, Sleman, Bantul, Kulon Progo, Gunungkidul'],
  AD: ['Solo Raya', 'Surakarta, Sukoharjo, Karanganyar, Wonogiri, Sragen, Klaten, Boyolali'],
  AE: ['Madiun', 'Madiun, Ngawi, Magetan, Ponorogo, Pacitan'],
  AG: ['Kediri', 'Kediri, Tulungagung, Blitar, Trenggalek, Nganjuk'],
  L: ['Surabaya', 'Kota Surabaya'],
  M: ['Madura', 'Bangkalan, Sampang, Pamekasan, Sumenep'],
  N: ['Malang Raya', 'Malang, Batu, Pasuruan, Probolinggo, Lumajang'],
  P: ['Tapal Kuda Timur', 'Jember, Bondowoso, Situbondo, Banyuwangi'],
  S: ['Bojonegoro & sekitar', 'Bojonegoro, Tuban, Lamongan, Mojokerto, Jombang'],
  W: ['Gresik & Sidoarjo', 'Gresik, Sidoarjo'],
  BA: ['Sumatera Barat', 'Padang, Bukittinggi, Payakumbuh, dsb.'],
  BB: ['Sumatera Utara (pantai barat)', 'Sibolga, Tapanuli, Nias'],
  BK: ['Sumatera Utara (pantai timur)', 'Medan, Binjai, Deli Serdang, dsb.'],
  BD: ['Bengkulu', 'Kota Bengkulu & kabupaten'],
  BE: ['Lampung', 'Bandar Lampung, Metro, dsb.'],
  BG: ['Sumatera Selatan', 'Palembang, dsb.'],
  BH: ['Jambi', 'Kota Jambi & kabupaten'],
  BL: ['Aceh', 'Banda Aceh, Lhokseumawe, dsb.'],
  BM: ['Riau', 'Pekanbaru, Dumai, dsb.'],
  BN: ['Kep. Bangka Belitung', 'Pangkal Pinang, Tanjung Pandan'],
  BP: ['Kep. Riau', 'Tanjung Pinang, Batam, Bintan'],
  DA: ['Kalimantan Selatan', 'Banjarmasin, Banjarbaru, dsb.'],
  KB: ['Kalimantan Barat', 'Pontianak, Singkawang, dsb.'],
  KH: ['Kalimantan Tengah', 'Palangka Raya, dsb.'],
  KT: ['Kalimantan Timur', 'Samarinda, Balikpapan, Bontang'],
  KU: ['Kalimantan Utara', 'Tarakan, Nunukan, dsb.'],
  DB: ['Sulawesi Utara', 'Manado, Bitung, Minahasa'],
  DL: ['Kep. Sangihe & Talaud', 'Tahuna, Melonguane'],
  DM: ['Gorontalo', 'Kota Gorontalo & kabupaten'],
  DN: ['Sulawesi Tengah', 'Palu, dsb.'],
  DD: ['Sulawesi Selatan', 'Makassar, Gowa, Maros'],
  DP: ['Sulawesi Barat', 'Mamuju, Majene, Polewali Mandar'],
  DT: ['Sulawesi Tenggara', 'Kendari, dsb.'],
  DW: ['Sulawesi Selatan (Bosowasi)', 'Bone, Sinjai, Soppeng, Wajo'],
  DK: ['Bali', 'Denpasar & kabupaten'],
  DR: ['Nusa Tenggara Barat', 'Mataram, Lombok'],
  DH: ['NTT (Timor)', 'Kupang, Atambua'],
  EB: ['NTT (Flores)', 'Ende, Maumere, Larantuka'],
  DE: ['Maluku', 'Ambon, dsb.'],
  DG: ['Maluku Utara', 'Ternate, Tidore, Sofifi'],
  DS: ['Papua', 'Jayapura, Merauke, dsb.'],
  PB: ['Papua Barat', 'Manokwari, Sorong, dsb.'],
};

export function lookupPlat(input) {
  const kode = String(input || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
  if (!kode) return null;
  const hit = PLAT_NOMOR[kode];
  if (!hit) return { kode, tidakDikenal: true };
  return { kode, wilayah: hit[0], daerah: hit[1] };
}

// ---------------------------------------------------------------------------
// PPh 21 — PTKP setahun (Rp), PMK 101/2016; tarif progresif Pasal 17 UU PPh
// ---------------------------------------------------------------------------

export const PTKP = {
  'TK/0': 54000000, 'TK/1': 58500000, 'TK/2': 63000000, 'TK/3': 67500000,
  'K/0': 58500000, 'K/1': 63000000, 'K/2': 67500000, 'K/3': 72000000,
  'K/I/0': 112500000, 'K/I/1': 117000000, 'K/I/2': 121500000, 'K/I/3': 126000000,
};

export const PTKP_LABEL = {
  'TK/0': 'TK/0 — Lajang', 'TK/1': 'TK/1 — Lajang + 1 tanggungan', 'TK/2': 'TK/2 — Lajang + 2 tanggungan', 'TK/3': 'TK/3 — Lajang + 3 tanggungan',
  'K/0': 'K/0 — Kawin', 'K/1': 'K/1 — Kawin + 1 tanggungan', 'K/2': 'K/2 — Kawin + 2 tanggungan', 'K/3': 'K/3 — Kawin + 3 tanggungan',
  'K/I/0': 'K/I/0 — Kawin, istri kerja', 'K/I/1': 'K/I/1 — Kawin, istri kerja + 1', 'K/I/2': 'K/I/2 — Kawin, istri kerja + 2', 'K/I/3': 'K/I/3 — Kawin, istri kerja + 3',
};

export function pphProgresif(pkp) {
  const lapis = [
    [60000000, 0.05, '5%'], [250000000, 0.15, '15%'], [500000000, 0.25, '25%'],
    [5000000000, 0.30, '30%'], [Infinity, 0.35, '35%'],
  ];
  let sisa = pkp, bawah = 0, total = 0;
  const rinc = [];
  for (const [atas, tarif, label] of lapis) {
    if (sisa <= 0) break;
    const kena = Math.min(sisa, atas - bawah);
    const pajak = kena * tarif;
    rinc.push({ label, kena, pajak });
    total += pajak; sisa -= kena; bawah = atas;
  }
  return { total: Math.round(total), rinc };
}

export function calcPPh21(gajiPokokBln, tunjanganBln, iuranBln, statusPtkp) {
  const g = Number(gajiPokokBln) || 0, t = Number(tunjanganBln) || 0, iu = Number(iuranBln) || 0;
  if (g <= 0) return null;
  const ptkp = PTKP[statusPtkp];
  if (ptkp === undefined) return null;
  const brutoBln = g + t;
  const brutoThn = brutoBln * 12;
  const bjBln = Math.min(brutoBln * 0.05, 500000);
  const netoBln = brutoBln - bjBln - iu;
  const netoThn = netoBln * 12;
  const pkp = Math.floor(Math.max(0, netoThn - ptkp) / 1000) * 1000;
  const { total: pphThn, rinc } = pphProgresif(pkp);
  const pphBln = Math.round(pphThn / 12);
  const takeHome = Math.round(brutoBln - pphBln - iu);
  return {
    pphBln, pphThn, takeHome,
    brutoThn: Math.round(brutoThn),
    biayaJabatanThn: Math.round(bjBln * 12),
    iuranThn: Math.round(iu * 12),
    netoThn: Math.round(netoThn),
    ptkp, pkp, rincianLapisan: rinc,
  };
}

// ---------------------------------------------------------------------------
// THR
// ---------------------------------------------------------------------------

export function calcThr(gajiSatuBulan, masaKerjaBulan) {
  const gaji = +gajiSatuBulan || 0;
  const bulanKerja = +masaKerjaBulan || 0;
  return bulanKerja >= 12 ? gaji : (gaji * bulanKerja) / 12;
}

// ---------------------------------------------------------------------------
// Token listrik — tarif per kWh
// ---------------------------------------------------------------------------

export const TARIF_LISTRIK = [
  { tarif: 1352, label: 'R-1 900 VA — Rp1.352/kWh' },
  { tarif: 1444.7, label: 'R-1 1.300–2.200 VA — Rp1.444,70/kWh' },
  { tarif: 1699.53, label: 'R-2 / R-3 (>2.200 VA) — Rp1.699,53/kWh' },
  { tarif: 1444.7, label: 'B-2 (bisnis) — Rp1.444,70/kWh' },
  { tarif: 1114.74, label: 'I-3 (industri) — Rp1.114,74/kWh' },
  { tarif: 996.74, label: 'I-4 (industri besar) — Rp996,74/kWh' },
];

export function rupiahKeKwh(nominalRp, tarifPerKwh) {
  const tarif = Number(tarifPerKwh) || 1352;
  const rp = Number(nominalRp) || 0;
  if (rp <= 0) return null;
  return rp / tarif;
}

export function kwhKeRupiah(kwh, tarifPerKwh) {
  const tarif = Number(tarifPerKwh) || 1352;
  const k = Number(kwh) || 0;
  if (k <= 0) return null;
  return k * tarif;
}

// ---------------------------------------------------------------------------
// UMP 2025 per provinsi (38 provinsi).
// Angka resmi bisa berubah — selalu cek Disnaker setempat.
// ---------------------------------------------------------------------------

export const UMP_PROVINSI = [
  ['Aceh', 3685616],
  ['Sumatera Utara', 2992559],
  ['Sumatera Barat', 2994193],
  ['Riau', 3508776],
  ['Jambi', 3234535],
  ['Sumatera Selatan', 3681571],
  ['Bengkulu', 2670039],
  ['Lampung', 2893070],
  ['Kep. Bangka Belitung', 3876600],
  ['Kep. Riau', 3623654],
  ['DKI Jakarta', 5396761],
  ['Jawa Barat', 2191232],
  ['Jawa Tengah', 2169349],
  ['DI Yogyakarta', 2264081],
  ['Jawa Timur', 2305985],
  ['Banten', 2905120],
  ['Bali', 2996561],
  ['Nusa Tenggara Barat', 2602931],
  ['Nusa Tenggara Timur', 2328970],
  ['Kalimantan Barat', 2878286],
  ['Kalimantan Tengah', 3473621],
  ['Kalimantan Selatan', 3496195],
  ['Kalimantan Timur', 3579314],
  ['Kalimantan Utara', 3580160],
  ['Sulawesi Utara', 3775425],
  ['Sulawesi Tengah', 2915000],
  ['Sulawesi Selatan', 3657527],
  ['Sulawesi Tenggara', 3073552],
  ['Gorontalo', 3221731],
  ['Sulawesi Barat', 3104430],
  ['Maluku', 3141700],
  ['Maluku Utara', 3408000],
  ['Papua Barat', 3615000],
  ['Papua', 4285850],
  ['Papua Tengah', 4285850],
  ['Papua Pegunungan', 4285850],
  ['Papua Selatan', 4285848],
  ['Papua Barat Daya', 3614000],
];

export function lookupUmp(namaProvinsi) {
  const q = String(namaProvinsi || '').trim().toLowerCase();
  if (!q) return null;
  const hit = UMP_PROVINSI.find(([nama]) => nama.toLowerCase() === q)
    || UMP_PROVINSI.find(([nama]) => nama.toLowerCase().includes(q));
  return hit ? { provinsi: hit[0], ump: hit[1] } : null;
}

export function compareSalaryToUmp(gajiBulanan, namaProvinsi) {
  const gaji = Number(gajiBulanan);
  if (!(gaji > 0)) return null;
  const umpInfo = lookupUmp(namaProvinsi);
  if (!umpInfo) return null;
  const selisih = gaji - umpInfo.ump;
  const persen = (selisih / umpInfo.ump) * 100;
  const diAtas = selisih >= 0;
  return {
    gaji, provinsi: umpInfo.provinsi, ump: umpInfo.ump,
    selisih, selisihAbs: Math.abs(selisih),
    persen, persenAbs: Number(Math.abs(persen).toFixed(1)),
    diAtas,
  };
}

// ---------------------------------------------------------------------------
// Weton Jawa — patokan 17 Agustus 1945 = Jumat Legi
// ---------------------------------------------------------------------------

export const NEPTU_HARI = { Senin: 4, Selasa: 3, Rabu: 7, Kamis: 8, Jumat: 6, Sabtu: 9, Minggu: 5 };
export const NEPTU_PASARAN = { Legi: 5, Pahing: 9, Pon: 7, Wage: 4, Kliwon: 8 };

export function calcWeton(tahun, bulan, tanggal) {
  const t = Date.UTC(+tahun, +bulan - 1, +tanggal);
  if (isNaN(t)) return null;
  const anchor = Date.UTC(1945, 7, 17);
  const diff = Math.round((t - anchor) / 86400000);
  const pasaran = PASARAN_NAMES[(((diff % 5) + 5) % 5)];
  const hari = HARI_PENUH[new Date(t).getUTCDay()];
  const neptuHari = NEPTU_HARI[hari];
  const neptuPasaran = NEPTU_PASARAN[pasaran];
  return { hari, pasaran, weton: hari + ' ' + pasaran, neptuHari, neptuPasaran, neptuTotal: neptuHari + neptuPasaran };
}

// ---------------------------------------------------------------------------
// Zakat
// ---------------------------------------------------------------------------

export function calcZakatMaal(totalHarta, hargaEmasPerGram) {
  const harta = +totalHarta || 0;
  const hargaEmas = +hargaEmasPerGram || 0;
  const nisab = 85 * hargaEmas;
  const wajib = hargaEmas > 0 && harta >= nisab;
  return { nisab, wajib, zakat: wajib ? harta * 0.025 : 0 };
}

export function calcZakatFitrah(jumlahJiwa, hargaBerasPerKg) {
  const j = Math.max(1, Math.round(Number(jumlahJiwa)) || 1);
  const b = Number(hargaBerasPerKg) || 0;
  if (!(b > 0)) return null;
  const perJiwa = 2.5 * b;
  return { jiwa: j, hargaBerasPerKg: b, perJiwa, total: perJiwa * j };
}

// ---------------------------------------------------------------------------
// Konversi zona waktu (WIB/WITA/WIT + kota dunia)
// ---------------------------------------------------------------------------

export const ZONE_LIST = [
  ['WIB', 'Asia/Jakarta'], ['WITA', 'Asia/Makassar'], ['WIT', 'Asia/Jayapura'],
  ['Singapura', 'Asia/Singapore'], ['Tokyo', 'Asia/Tokyo'], ['Seoul', 'Asia/Seoul'],
  ['Dubai', 'Asia/Dubai'], ['London', 'Europe/London'], ['Paris', 'Europe/Paris'],
  ['New York', 'America/New_York'], ['Los Angeles', 'America/Los_Angeles'], ['Sydney', 'Australia/Sydney'],
];
export const ZONE_OFFSET = { WIB: 7, WITA: 8, WIT: 9 };

export function convertZonaWaktu(jam, menit, zonaAsal) {
  const hh = Number(jam), mm = Number(menit) || 0;
  if (isNaN(hh)) return null;
  const off = ZONE_OFFSET[zonaAsal] || 7;
  const now = new Date();
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), hh - off, mm));
  const hasil = {};
  for (const [label, tz] of ZONE_LIST) {
    try {
      hasil[label] = new Intl.DateTimeFormat('id-ID', {
        weekday: 'short', day: 'numeric', month: 'short',
        hour: '2-digit', minute: '2-digit', hour12: false, timeZone: tz,
      }).format(d);
    } catch (e) { hasil[label] = '-'; }
  }
  return hasil;
}
