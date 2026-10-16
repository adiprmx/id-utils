import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as id from '../src/index.js';

const approx = (a, b, delta = 0.01) => Math.abs(a - b) <= delta;

describe('anggaran', () => {
  it('totalAnggaranLebaran menjumlahkan 4 pos', () => {
    const r = id.totalAnggaranLebaran(1500000, 3000000, 800000, 450000);
    assert.equal(r.total, 5750000);
    assert.equal(r.transport, 1500000);
  });
  it('ambilAcak mengembalikan n item dari array', () => {
    const r = id.ambilAcak(id.TIPS_LEBARAN, 4);
    assert.equal(r.length, 4);
    r.forEach((t) => assert.ok(id.TIPS_LEBARAN.includes(t)));
  });
  it('rincianAnggaranNikah: katering 40% dari 200jt = 80jt', () => {
    const labels = id.DEFAULT_POS_NIKAH.map((x) => x[0]);
    const pcts = id.DEFAULT_POS_NIKAH.map((x) => x[1]);
    const r = id.rincianAnggaranNikah(200000000, labels, pcts);
    assert.equal(r.items[0].nominal, 80000000);
    assert.equal(r.ok, true);
    assert.equal(r.totalPct, 100);
  });
  it('normalisasiPersen: [1,1] -> [50,50]; [0,0] -> null', () => {
    assert.deepEqual(id.normalisasiPersen([1, 1]), [50, 50]);
    assert.equal(id.normalisasiPersen([0, 0]), null);
  });
});

describe('arisan', () => {
  it('parseNamaArisan membuang baris kosong', () => {
    assert.deepEqual(id.parseNamaArisan('Budi\nSari\n\nAndi'), ['Budi', 'Sari', 'Andi']);
  });
  it('kocokArisan hasilnya anggota list; <2 nama -> null', () => {
    const names = ['Budi', 'Sari', 'Andi'];
    assert.ok(names.includes(id.kocokArisan(names)));
    assert.equal(id.kocokArisan(['A']), null);
  });
  it('keluarkanPemenang membuang pemenang', () => {
    assert.deepEqual(id.keluarkanPemenang(['A', 'B', 'C'], 'B'), ['A', 'C']);
  });
});

describe('kendaraan & SIM', () => {
  it("biayaBalikNama motor: 1% NJKB 15jt + tarif = 920000", () => {
    const r = id.biayaBalikNama('motor', 15000000, 350000, 35000);
    assert.equal(r.bbnKb, 150000);
    assert.equal(r.total, 920000);
  });
  it('biayaPerpanjangSIM SIM C = 150000', () => {
    assert.equal(id.biayaPerpanjangSIM('SIM C').total, 150000);
    assert.equal(id.biayaPerpanjangSIM('SIM A').total, 155000);
  });
});

describe('bunga majemuk', () => {
  it('1jt @12% 1thn compounding bulanan = 1126825.03', () => {
    const r = id.simulasiBungaMajemuk(1000000, 0, 12, 1, 12);
    assert.ok(approx(r.akhir, 1126825.0301319698));
    assert.equal(r.rows.length, 1);
    assert.ok(approx(r.totalBunga, 126825.0301319698));
  });
});

describe('operator & nomor HP', () => {
  it("cekOperator('08123456789') -> Telkomsel", () => {
    const r = id.cekOperator('08123456789');
    assert.equal(r.operator, 'Telkomsel');
    assert.equal(r.nomor, '+628123456789');
    assert.equal(r.prefix, '0812');
  });
  it("cekOperator('0857123456') -> Indosat", () => {
    assert.equal(id.cekOperator('0857123456').operator, 'Indosat');
  });
  it('nomor invalid -> null', () => {
    assert.equal(id.cekOperator('abc'), null);
    assert.equal(id.normalizePhoneNumber('123'), null);
  });
  it('phoneNumberFormats menghasilkan link wa.me', () => {
    const r = id.phoneNumberFormats('081944475875');
    assert.equal(r.digits, '81944475875');
    assert.equal(r.waLink, 'https://wa.me/6281944475875');
  });
});

describe('cicilan', () => {
  it('cicilanFlat 20jt 12% 12bln: bunga 2.4jt', () => {
    const r = id.cicilanFlat(20000000, 12, 12);
    assert.equal(r.totalBunga, 2400000);
    assert.ok(approx(r.perBulan, 1866666.6667));
  });
  it('cicilanAnuitas 20jt 12% 12bln: perBulan ~1776975.77', () => {
    const r = id.cicilanAnuitas(20000000, 12, 12);
    assert.ok(approx(r.perBulan, 1776975.7735668323, 0.001));
    assert.ok(approx(r.totalBayar, 21323709.282801986, 0.01));
  });
  it('bandingkanCicilan: anuitas lebih ringan', () => {
    assert.equal(id.bandingkanCicilan(20000000, 12, 12).lebihRingan, 'anuitas');
  });
});

describe('countdown', () => {
  it('hitungMundur 1 Mar -> 10 Mar 2027 = 9 hari', () => {
    const r = id.hitungMundur(new Date(2027, 2, 10), new Date(2027, 2, 1));
    assert.equal(r.sudahTiba, false);
    assert.equal(r.hari, 9);
    assert.equal(r.jam, '00');
  });
  it('target lewat -> sudahTiba', () => {
    assert.equal(id.hitungMundur(new Date(2020, 0, 1), new Date(2026, 0, 1)).sudahTiba, true);
  });
  it('tahunBaruBerikutnya & natalBerikutnya', () => {
    assert.equal(id.tahunBaruBerikutnya(new Date(2026, 6, 1)).getFullYear(), 2027);
    const xmas = id.natalBerikutnya(new Date(2026, 6, 1));
    assert.equal(xmas.getMonth(), 11);
    assert.equal(xmas.getDate(), 25);
  });
});

describe('denda pajak & SPT', () => {
  it('hitungDendaPajakSTNK 3 bln: denda 21000 + 26250', () => {
    const r = id.hitungDendaPajakSTNK(350000, 35000, 3);
    assert.equal(r.dendaPkb, 21000);
    assert.equal(r.persenDendaSw, 0.75);
    assert.equal(r.dendaSw, 26250);
    assert.equal(r.total, 432250);
  });
  it('sptLateFine OP 3 bln terutang 5jt = 400000', () => {
    const r = id.sptLateFine('op', 3, 5000000);
    assert.deepEqual({ denda: r.denda, bunga: r.bunga, total: r.total }, { denda: 100000, bunga: 300000, total: 400000 });
  });
  it('sptLateFine badan: denda 1jt', () => {
    assert.equal(id.sptLateFine('badan', 0, 1000000).denda, 1000000);
  });
});

describe('tilang', () => {
  it("tilangLookup('sim').denda = 1000000", () => {
    assert.equal(id.tilangLookup('sim').denda, 1000000);
    assert.equal(id.tilangLookup('sim').pasal, 'Pasal 281');
  });
  it('id tak dikenal -> fallback entri pertama', () => {
    assert.equal(id.tilangLookup('ngawur').id, id.TILANG_TABLE[0].id);
  });
});

describe('diskon & marketplace', () => {
  it('tieredDiscount 200rb [50,20] -> 80000', () => {
    const r = id.tieredDiscount(200000, [50, 20]);
    assert.equal(r.hargaAkhir, 80000);
    assert.equal(r.totalHemat, 120000);
    assert.equal(r.tahapan[0].potongan, 100000);
  });
  it('marketplaceFees Shopee 10% dari 100rb', () => {
    const r = id.marketplaceFees(100000, id.MARKETPLACE_DEFAULTS)[0];
    assert.equal(r.feeRp, 10000);
    assert.equal(r.bersih, 90000);
  });
});

describe('hijriah', () => {
  it('gregorianToHijri(2026,10,17) weekday = Sabtu', () => {
    const h = id.gregorianToHijri(2026, 10, 17);
    assert.equal(h.weekday, 'Sabtu');
    assert.ok(id.HIJRI_MONTHS.includes(h.monthName));
  });
  it('round-trip masehi->hijri->masehi kembali utuh', () => {
    const h = id.gregorianToHijri(2026, 10, 17);
    const g = id.hijriToGregorian(h.y, h.m, h.d);
    assert.deepEqual([g.y, g.m, g.d], [2026, 10, 17]);
  });
});

describe('weton & selamatan', () => {
  it('calcWeton(1945,8,17) = Jumat Legi, neptu 11', () => {
    const w = id.calcWeton(1945, 8, 17);
    assert.equal(w.weton, 'Jumat Legi');
    assert.equal(w.neptuTotal, 11);
  });
  it('memorialDates: wafat 1 Jan 2026 -> 40 harian 9 Feb 2026 Senin', () => {
    const r = id.memorialDates(2026, 1, 1);
    assert.equal(r[0].label, '40 harian');
    assert.equal(r[0].dayName, 'Senin');
    assert.equal(r[0].date.getUTCFullYear(), 2026);
    assert.equal(r[0].date.getUTCMonth(), 1);
    assert.equal(r[0].date.getUTCDate(), 9);
    assert.equal(r.length, 3);
  });
});

describe('lembur', () => {
  it('overtimePay 5jt, 2 jam kerja + 8 jam libur = 592485.55', () => {
    const r = id.overtimePay(5000000, 2, 8);
    assert.ok(approx(r.total, 592485.5491329479, 1));
    assert.ok(approx(r.upahPerJam, 5000000 / 173, 0.001));
  });
  it('overtimePaySimple 5jt 2 jam = 101156.07', () => {
    const r = id.overtimePaySimple(5000000, 2);
    assert.ok(approx(r.total, 101156.06936416184));
    assert.equal(r.rincian[0].faktor, 1.5);
  });
});

describe('resto & patungan', () => {
  it('restoBillTotal 350rb + pajak 10% + service 5% / 4 org', () => {
    const r = id.restoBillTotal(350000, 10, 5, 4);
    assert.equal(r.total, 402500);
    assert.equal(r.perOrang, 100625);
  });
  it('splitBill 150rb pajak 10% service 5% / 4 = 43125/org', () => {
    assert.equal(id.splitBill(150000, 10, 5, 4).perOrang, 43125);
  });
  it('roundBillUp 43125 ke 500 = 43500', () => {
    assert.equal(id.roundBillUp(43125, 500), 43500);
  });
});

describe('waris', () => {
  it('1.2M: istri 150jt, ibu 200jt, ayah 200jt, anak L 433.33jt, P 216.67jt', () => {
    const r = id.islamicInheritance(1200000000, { pasangan: 'istri', anakLaki: 1, anakPerempuan: 1, adaAyah: true, adaIbu: true });
    const by = (l) => r.rows.find((x) => x.label === l).nominal;
    assert.equal(by('Istri'), 150000000);
    assert.equal(by('Ibu'), 200000000);
    assert.equal(by('Ayah'), 200000000);
    assert.ok(approx(by('Anak laki-laki × 1'), 433333333.33, 1));
    assert.ok(approx(by('Anak perempuan × 1'), 216666666.67, 1));
    assert.equal(r.totalPersen, 100);
  });
});

describe('bpjs', () => {
  it("bpjsContribution('2', 4) = 400rb/bln", () => {
    const r = id.bpjsContribution('2', 4);
    assert.equal(r.perBulan, 400000);
    assert.equal(r.perTahun, 4800000);
  });
});

describe('kas rt', () => {
  it('iuranPerKK 300rb / 30 = 10000', () => {
    assert.equal(id.iuranPerKK(300000, 30), 10000);
  });
  it("formatTanggalID('2026-10-17') = 'Sabtu, 17 Okt 2026'", () => {
    assert.equal(id.formatTanggalID('2026-10-17'), 'Sabtu, 17 Okt 2026');
  });
  it('kasStats menghitung terkumpul & tunggak', () => {
    const r = id.kasStats(
      [{ nama: 'A', nominal: 10000, lunas: true }, { nama: 'B', nominal: 10000, lunas: false }],
      300000
    );
    assert.equal(r.terkumpul, 20000);
    assert.equal(r.sisa, 280000);
    assert.equal(r.tunggak.length, 1);
  });
});

describe('jadwal', () => {
  it('generateJadwalPiket: 19/10 Senin = Andi', () => {
    const r = id.generateJadwalPiket(['Andi', 'Budi', 'Citra'], [1, 2, 3, 4, 5], '2026-10-19', 7);
    assert.equal(r[0].petugas, 'Andi');
    assert.equal(r[0].hari, 'Senin');
    assert.equal(r[5].petugas, null); // Sabtu libur
  });
  it('generateJadwalRonda: malam 1 tim A,B; malam 2 tim C,D', () => {
    const r = id.generateJadwalRonda(['A', 'B', 'C', 'D'], 2, '2026-10-17');
    assert.deepEqual(r[0].tim, ['A', 'B']);
    assert.deepEqual(r[1].tim, ['C', 'D']);
    assert.equal(r.length, 14);
  });
  it('generateJadwalShift: hari ke-3 Andi=Malam, Budi=Libur', () => {
    const r = id.generateJadwalShift(id.DEFAULT_POLA, ['Andi', 'Budi'], '2026-10-19', 4);
    assert.equal(r[2].shift['Andi'].kode, 'M');
    assert.equal(r[2].shift['Budi'].libur, true);
  });
});

describe('dana darurat & emas & gadai & kurban', () => {
  it('emergencyFundProgress 5jt x6 tabungan 10jt', () => {
    const r = id.emergencyFundProgress(5000000, 6, 10000000);
    assert.equal(r.target, 30000000);
    assert.equal(r.sisa, 20000000);
    assert.ok(approx(r.progresPersen, 33.333, 0.01));
  });
  it("emergencyFundTarget menikah = 6x pengeluaran", () => {
    assert.equal(id.emergencyFundTarget(5000000, 'menikah'), 30000000);
  });
  it('goldPriceFromWeight 2.5gr @1.4jt = 3.5jt', () => {
    assert.equal(id.goldPriceFromWeight(2.5, 1400000).total, 3500000);
  });
  it('goldWeightFromBudget 5jt @1.4jt: keping bulat 3', () => {
    const r = id.goldWeightFromBudget(5000000, 1400000);
    assert.equal(r.kepingBulat, 3);
    assert.equal(r.nilaiKepingBulat, 4200000);
  });
  it('gadaiSim 2jt 30 hari: tebus 1839600', () => {
    const r = id.gadaiSim(2000000, 30);
    assert.equal(r.pinjaman, 1800000);
    assert.equal(r.periode, 2);
    assert.equal(r.tebus, 1839600);
  });
  it('kurbanShare sapi 21jt / 7 = 3jt per orang', () => {
    const r = id.kurbanShare('sapi', 21000000, ['A', 'B', 'C', 'D', 'E', 'F', 'G']);
    assert.equal(r.iuranPerOrang, 3000000);
  });
});

describe('pesangon', () => {
  it('multiplier: 5.5 thn -> UP 6x, UPMK 2x', () => {
    assert.equal(id.severanceUpMultiplier(5.5), 6);
    assert.equal(id.severanceUpmkMultiplier(5.5), 2);
  });
  it('calcPesangon 5jt 5.5thn biasa = 46jt', () => {
    const r = id.calcPesangon(5000000, 5.5, 'biasa');
    assert.equal(r.up, 30000000);
    assert.equal(r.upmk, 10000000);
    assert.equal(r.uph, 6000000);
    assert.equal(r.total, 46000000);
  });
  it('calcPesangon efisiensi: UP kena rasio 0.5', () => {
    const r = id.calcPesangon(5000000, 5.5, 'efisiensi');
    assert.equal(r.up, 15000000);
    assert.equal(r.total, 28750000);
  });
});

describe('qris', () => {
  it("calcMdrQris 200rb 'kecil': potongan 1400", () => {
    const r = id.calcMdrQris(200000, 'kecil');
    assert.equal(r.rate, 0.7);
    assert.equal(r.potongan, 1400);
    assert.equal(r.diterima, 198600);
  });
  it("calcMdrQris 50rb 'mikro': bebas potongan", () => {
    const r = id.calcMdrQris(50000, 'mikro');
    assert.equal(r.rate, 0);
    assert.equal(r.diterima, 50000);
  });
});

describe('plat nomor', () => {
  it("lookupPlat('B') = DKI Jakarta & Bodetabek", () => {
    assert.equal(id.lookupPlat('B').wilayah, 'DKI Jakarta & Bodetabek');
  });
  it("lookupPlat('DK') = Bali", () => {
    assert.equal(id.lookupPlat('DK').wilayah, 'Bali');
  });
  it('kode tak dikenal -> tidakDikenal', () => {
    assert.equal(id.lookupPlat('XX').tidakDikenal, true);
  });
});

describe('pph21', () => {
  it('pphProgresif 60jt = 3jt', () => {
    assert.equal(id.pphProgresif(60000000).total, 3000000);
  });
  it('gaji 12jt + tunj 2jt TK/0: pph/bln 814000', () => {
    const r = id.calcPPh21(12000000, 2000000, 240000, 'TK/0');
    assert.equal(r.pphBln, 814000);
    assert.equal(r.pphThn, 9768000);
    assert.equal(r.pkp, 105120000);
    assert.equal(r.takeHome, 12946000);
  });
  it('input invalid -> null', () => {
    assert.equal(id.calcPPh21(0, 0, 0, 'TK/0'), null);
    assert.equal(id.calcPPh21(5000000, 0, 0, 'XX'), null);
  });
});

describe('thr', () => {
  it('calcThr 5jt 8 bln = 3333333.33', () => {
    assert.ok(approx(id.calcThr(5000000, 8), 3333333.3333));
  });
  it('calcThr >= 12 bln = gaji penuh', () => {
    assert.equal(id.calcThr(5000000, 12), 5000000);
    assert.equal(id.calcThr(5000000, 18), 5000000);
  });
});

describe('token listrik', () => {
  it('rupiahKeKwh 100rb @1352 = 73.964', () => {
    assert.ok(approx(id.rupiahKeKwh(100000, 1352), 73.96449704142012, 1e-9));
  });
  it('kwhKeRupiah 10 kwh = 13520', () => {
    assert.equal(id.kwhKeRupiah(10, 1352), 13520);
  });
});

describe('ump', () => {
  it("lookupUmp('DKI Jakarta').ump = 5396761", () => {
    assert.equal(id.lookupUmp('DKI Jakarta').ump, 5396761);
  });
  it('lookupUmp case-insensitive', () => {
    assert.equal(id.lookupUmp('jakarta').provinsi, 'DKI Jakarta');
  });
  it('compareSalaryToUmp 4.5jt di Jakarta: di bawah UMP', () => {
    const r = id.compareSalaryToUmp(4500000, 'DKI Jakarta');
    assert.equal(r.diAtas, false);
    assert.equal(r.selisih, -896761);
  });
});

describe('zakat', () => {
  it('calcZakatMaal 200jt @emas 1.4jt: zakat 5jt', () => {
    const r = id.calcZakatMaal(200000000, 1400000);
    assert.equal(r.nisab, 119000000);
    assert.equal(r.wajib, true);
    assert.equal(r.zakat, 5000000);
  });
  it('di bawah nisab -> tidak wajib', () => {
    const r = id.calcZakatMaal(50000000, 1400000);
    assert.equal(r.wajib, false);
    assert.equal(r.zakat, 0);
  });
  it('calcZakatFitrah 4 jiwa @beras 15rb = 150rb', () => {
    const r = id.calcZakatFitrah(4, 15000);
    assert.equal(r.perJiwa, 37500);
    assert.equal(r.total, 150000);
  });
});

describe('zona waktu', () => {
  it('convertZonaWaktu 12:00 WIB: 12 zona, Tokyo 14.00', () => {
    const r = id.convertZonaWaktu(12, 0, 'WIB');
    assert.equal(Object.keys(r).length, 12);
    assert.ok(r['WIB'].includes('12.00'));
    assert.ok(r['Tokyo'].includes('14.00'));
  });
});

describe('data tables', () => {
  it('UMP_PROVINSI 38 provinsi', () => {
    assert.equal(id.UMP_PROVINSI.length, 38);
  });
  it('TILANG_TABLE 8 pelanggaran', () => {
    assert.equal(id.TILANG_TABLE.length, 8);
  });
  it('OPERATOR_SELULER 5 operator', () => {
    assert.equal(id.OPERATOR_SELULER.length, 5);
  });
  it("PTKP['TK/0'] = 54000000", () => {
    assert.equal(id.PTKP['TK/0'], 54000000);
  });
});
