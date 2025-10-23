
import React from 'react';
// FIX: Corrected import path for types
import { Cek, Varlik } from '../types';

// FIX: Replaced the buggy number-to-text function with a more robust version.
const sayiyiYaziyaCevir = (num: number): string => {
    const birler = ["", "bir", "iki", "üç", "dört", "beş", "altı", "yedi", "sekiz", "dokuz"];
    const onlar = ["", "on", "yirmi", "otuz", "kırk", "elli", "altmış", "yetmiş", "seksen", "doksan"];
    const binler = ["", "bin", "milyon", "milyar"];

    if (num === 0) return "sıfır";

    let str = "";
    let i = 0;

    while (num > 0) {
        let chunk = num % 1000;
        if (chunk > 0) {
            let chunkStr = "";
            let yuz = Math.floor(chunk / 100);
            let on = Math.floor((chunk % 100) / 10);
            let bir = chunk % 10;

            if (yuz > 0) chunkStr += (yuz > 1 ? birler[yuz] : "") + "yüz";
            chunkStr += onlar[on] + birler[bir];
            
            if (i > 0 && chunkStr.length > 0) {
                if (chunkStr === "bir" && i === 1) { // bin, not birbin
                     chunkStr = "";
                }
                chunkStr += binler[i];
            }
            str = chunkStr + str;
        }
        num = Math.floor(num / 1000);
        i++;
    }

    return str.trim();
}

interface OdemeBeyaniSablonuProps {
  cek: Cek;
  varlik: Varlik;
}

const OdemeBeyaniSablonu: React.FC<OdemeBeyaniSablonuProps> = ({ cek, varlik }) => {
  const varlikAdi = varlik.type === 'firma' ? varlik.sirketAdi : `(Hata: Varlık tipi müşteri)`;
  const tutarYaziyla = sayiyiYaziyaCevir(cek.tutar);
  const paraBirimiKodu = cek.paraBirimi.toUpperCase();
  const aliciFirma = "HARDWORKER CONSTRUCTION & ESTATE LTD."; // This should ideally come from settings

  return (
    <div className="w-[800px] bg-white p-16 font-serif text-black text-base" style={{ fontFamily: 'Times New Roman, serif'}}>
      <div className="text-center">
        <h1 className="text-xl font-bold tracking-wider">{aliciFirma}</h1>
        <hr className="border-black my-4" />
      </div>

      <div className="flex justify-between items-center my-10">
        <p><span className="font-bold">MakbuzNo:</span> {cek.makbuzNo}</p>
        <h2 className="text-xl font-bold">ÖDEME BEYANI</h2>
        <p><span className="font-bold">Tarih:</span> {new Date(cek.tanzimTarihi).toLocaleDateString('sv-SE')}</p>
      </div>

      <div className="leading-relaxed text-justify my-10 px-4">
        <p>
            BEN AŞAĞIDA İMZA SAHİBİ <span className="font-bold">{cek.lehtar.toUpperCase()}</span> OLARAK {aliciFirma.toUpperCase()} ADINA,
            {cek.faturaIds.length > 0 ? ` ${cek.faturaIds.join(', ')} NO'LU FATURA ÖDEMELERİ İÇİN` : ' FATURA ÖDEMELERİ İÇİN'} TOPLAM 
            <span className="font-bold"> {cek.paraBirimi}{cek.tutar.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {paraBirimiKodu}</span> 
            <span className="font-bold"> ({tutarYaziyla} {paraBirimiKodu})</span> ÖDEMEYİ ÇEK İLE, ÇEK Tarihi: <span className="font-bold">{new Date(cek.vadeTarihi).toLocaleDateString('sv-SE')}</span> ÇEK No: <span className="font-bold">{cek.cekNo}</span> ALDIĞIMI KABUL VE BEYAN EDERİM.
        </p>
      </div>

      <div className="flex justify-between items-start mt-24">
        <div className="w-2/5 text-center">
            <p className="font-bold">TESLİM EDEN</p>
            <p className="mt-4">{aliciFirma}</p>
            <p className="mt-20">................................................................</p>
        </div>
         <div className="w-2/5 text-center">
            <p className="font-bold">TESLİM ALAN</p>
            <p className="mt-4">{cek.lehtar.toUpperCase()}</p>
            <p className="mt-20">................................................