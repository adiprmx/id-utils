# @adiprmx/id-utils

[![npm version](https://img.shields.io/npm/v/@adiprmx/id-utils.svg)](https://www.npmjs.com/package/@adiprmx/id-utils)
[![license: MIT](https://img.shields.io/npm/l/@adiprmx/id-utils.svg)](LICENSE)
[![node](https://img.shields.io/node/v/@adiprmx/id-utils.svg)](package.json)

112 pure-JavaScript utilities for the calculations Indonesians actually do: PPh 21 income tax, zakat, THR holiday allowance, Javanese weton days, QRIS merchant fees, electricity tokens, BPJS dues. Zero dependencies, no DOM, works in Node and browsers.

## Install

```sh
npm install @adiprmx/id-utils
```

## Quick examples

```js
import { calcPPh21, calcZakatMaal, calcWeton } from '@adiprmx/id-utils';

// monthly income tax on Rp 12jt salary, status TK/0
calcPPh21(12000000, 2000000, 240000, 'TK/0').pphBln; // 814000

// zakat on Rp 200jt of wealth, gold at Rp 1.4jt/gram
calcZakatMaal(200000000, 1400000).zakat; // 5000000

// what Javanese day was Indonesia's independence day?
calcWeton(1945, 8, 17).weton; // 'Jumat Legi'
```

## Contents

- [Tax & payroll](#tax--payroll)
- [Zakat & Islamic finance](#zakat--islamic-finance)
- [Money & bills](#money--bills)
- [Fines & vehicle](#fines--vehicle)
- [Phone & dates](#phone--dates)
- [Schedules](#schedules)
- [Design notes](#design-notes)

## Tax & payroll

- `calcPPh21(gajiPokokBln, tunjanganBln, iuranBln, statusPtkp)` — monthly and yearly PPh 21 income tax, with PTKP table (PMK 101/2016) and progressive rates. Returns tax per month/year, take-home pay, and per-bracket breakdown.
  ```js
  calcPPh21(12000000, 2000000, 240000, 'TK/0').pphBln; // 814000
  ```
- `pphProgresif(pkp)` — progressive tax on yearly taxable income. Returns total and per-bracket detail.
- `PTKP`, `PTKP_LABEL` — the lookup tables.
- `calcThr(gajiSatuBulan, masaKerjaBulan)` — holiday allowance, prorated if under 12 months.
  ```js
  calcThr(5000000, 8); // 3333333.33
  ```
- `overtimePay(gaji, jamHariKerja, jamHariLibur)` — overtime with workday/holiday multipliers (wage/hour = salary/173).
- `overtimePaySimple(gaji, jam)` — simpler version: first hour 1.5x, rest 2x.
- `calcPesangon(gajiBulanan, masaKerjaTahun, alasan)` — severance estimate (UP, UPMK, UPH) per PP 35/2021. `alasan`: 'biasa', 'efisiensi', 'pensiun', 'meninggal'.
- `bpjsContribution(kelas, jiwa)` — BPJS Kesehatan dues per household ('1', '2', '3').

## Zakat & Islamic finance

- `calcZakatMaal(totalHarta, hargaEmasPerGram)` — nisab is 85 grams of gold; 2.5% when reached.
  ```js
  calcZakatMaal(200000000, 1400000); // { nisab: 119000000, wajib: true, zakat: 5000000 }
  ```
- `calcZakatFitrah(jumlahJiwa, hargaBerasPerKg)` — 2.5 kg of rice per person.
- `islamicInheritance(harta, opts)` — simplified faraidh estimate. `opts`: `{ pasangan: 'suami'|'istri'|'none', anakLaki, anakPerempuan, adaAyah, adaIbu }`. This is an estimate, not a fatwa.
- `gregorianToHijri(y, m, d)` / `hijriToGregorian(y, m, d)` — Kuwaiti algorithm; can differ 1–2 days from official rukyat.
- `calcWeton(tahun, bulan, tanggal)` — Javanese weton day with neptu. Reference: 17 Aug 1945 = Jumat Legi.
  ```js
  calcWeton(1945, 8, 17); // { weton: 'Jumat Legi', neptuTotal: 11, ... }
  ```
- `memorialDates(y, m, d)` — 40/100/1000-day memorial dates with Javanese pasaran.
- `NEPTU_HARI`, `NEPTU_PASARAN` — the neptu tables.

## Money & bills

- `cicilanFlat(pokok, bungaTahunanPct, bulan)` / `cicilanAnuitas(pokok, bungaTahunanPct, bulan)` — loan installments, flat vs annuity. `bandingkanCicilan(...)` picks the cheaper one.
- `simulasiBungaMajemuk(P, PMT, rPct, tahun, freq)` — compound interest simulation with monthly deposits.
- `splitBill(total, pajakPct, servicePct, orang)` / `roundBillUp(nilai, kelipatan)` — split a bill, round it up.
- `restoBillTotal(struk, pajakPct, servicePct, orang)` — restaurant total with tax and service charge.
- `tieredDiscount(harga, discounts)` — stacked discounts, each applied to the remaining price.
- `marketplaceFees(hargaJual, markets)` — seller fees per marketplace; `MARKETPLACE_DEFAULTS` included.
- `calcMdrQris(nominal, kategori)` — QRIS merchant discount rate with BI free thresholds. `kategori`: 'mikro', 'kecil', 'menengah', 'besar', 'pendidikan', 'khusus', or 'kustom'.
- `rupiahKeKwh(nominalRp, tarifPerKwh)` / `kwhKeRupiah(kwh, tarifPerKwh)` — prepaid electricity conversion. `TARIF_LISTRIK` included.
- `gadaiSim(taksiran, tenorHari, loanPct, sewaPct)` — pawnshop simulation.
- `goldPriceFromWeight(gram, hargaPerGram)` / `goldWeightFromBudget(budget, hargaPerGram)` — gold price helpers.
- `kurbanShare(hewan, harga, peserta)` — qurban cost sharing ('sapi' max 7, 'kambing' max 1).
- `emergencyFundProgress(pengeluaranBulanan, kali, tabunganSaatIni)` / `emergencyFundTarget(pengeluaranBulanan, status)` — emergency fund math.
- `kocokArisan(names)`, `parseNamaArisan(teks)`, `keluarkanPemenang(names, winner)` — arisan drawing.
- `iuranPerKK(targetDana, jmlKK)`, `kasStats(warga, targetDana)`, `nominalBaruKK(...)`, `formatTanggalID(iso)` — neighborhood fund bookkeeping.

## Fines & vehicle

- `hitungDendaPajakSTNK(pkb, sw, bulanTelat)` — late vehicle tax fine (2%/month PKB capped at 24 months, tiered SWDKLLJ).
- `sptLateFine(jenisWp, bln, pajakTerutang)` — late annual tax return fine.
- `biayaBalikNama(jenis, njkb, pkb, swdkllj)` — vehicle ownership transfer cost ('motor'/'mobil').
- `biayaPerpanjangSIM(golongan, pnbp, kesehatan, psikotes)` — driving license renewal cost.
- `tilangLookup(id)` / `TILANG_TABLE` — max traffic fines per UU No. 22/2009 (court decides the final amount).
- `lookupPlat(input)` / `PLAT_NOMOR` — Indonesian license plate region codes.
  ```js
  lookupPlat('B').wilayah; // 'DKI Jakarta & Bodetabek'
  ```

## Phone & dates

- `normalizePhoneNumber(s)` / `phoneNumberFormats(s)` — normalize Indonesian mobile numbers, get 08xx/+62 formats and wa.me link.
- `cekOperator(nomor)` / `deteksiOperator(d)` / `OPERATOR_SELULER` — carrier lookup by prefix.
- `hitungMundur(target, now)` — countdown breakdown; `tahunBaruBerikutnya(now)`, `natalBerikutnya(now)`, `parseTanggalISO(s)`.
- `convertZonaWaktu(jam, menit, zonaAsal)` — convert a time across WIB/WITA/WIT and world cities.
- `lookupUmp(namaProvinsi)` / `compareSalaryToUmp(gaji, provinsi)` — 2025 provincial minimum wages (38 provinces, `UMP_PROVINSI`).

## Schedules

- `generateJadwalPiket(namaList, hariAktif, tglMulaiISO, jumlahHari)` — rotating duty roster.
- `generateJadwalRonda(namaList, perMalam, tglMulaiISO)` — 14-night patrol roster.
- `generateJadwalShift(pola, karyawan, tglMulaiISO, nHari)` — shift roster; `DEFAULT_POLA` included.
- `totalAnggaranLebaran(transport, thr, parcel, zakat)` / `rincianAnggaranNikah(budget, labels, pcts)` / `normalisasiPersen(pcts)` — event budgeting; `DEFAULT_POS_NIKAH` and `TIPS_LEBARAN` included.

## Design notes

- All inputs are plain numbers. No string parsing, no formatting helpers — the library returns raw numbers; format them yourself.
- Functions return `null` (or `{ error }`) on invalid input instead of throwing, except the schedule generators which throw on missing required arguments.
- Rates and tables (PTKP, tax brackets, neptu, UMP 2025, QRIS tiers, electricity tariffs) are copied from the source tools. Official figures change; verify against the relevant authority for anything binding.
- Religious calculations (zakat, waris, Hijri conversion, weton) are practical estimates.

## License

MIT — see LICENSE.
