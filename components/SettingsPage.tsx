import React, { useState, useRef } from 'react';
import { produce } from 'immer';
import { Ayarlar, ParaBirimi, CekDurumu, MenuItem, Kullanici, Rol, Page } from '../types';
import { TrashIcon, PlusIcon, DragHandleIcon, EditIcon } from './icons/AppIcons';
import PageOverlay from './PageOverlay';

// --- Helper Components for User Management ---
const RolDuzenleModal: React.FC<{
    rol: Rol | null;
    onClose: () => void;
    onSave: (rol: Omit<Rol, 'id'> | Rol) => void;
    menuItems: MenuItem[];
}> = ({ rol, onClose, onSave, menuItems }) => {
    const [localRol, setLocalRol] = useState<Partial<Rol>>(rol || { ad: '', izinler: {} });

    const allPages: {id: Page, label: string}[] = menuItems.flatMap(item => 
        item.children ? item.children.map(child => ({ id: child.id as Page, label: child.label })) : [{ id: item.id as Page, label: item.label }]
    );
    
    const handleSave = () => {
        if (!localRol.ad) {
            alert("Rol adı boş olamaz.");
            return;
        }
        onSave(localRol as Omit<Rol, 'id'> | Rol);
    }
    
    return (
        <PageOverlay title={rol ? 'Rolü Düzenle' : 'Yeni Rol Ekle'} onClose={onClose} size="2xl" footer={<>
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-slate-200 text-slate-800 hover:bg-slate-300">İptal</button>
            <button onClick={handleSave} className="bg-indigo-600 text-white px-4 py-2 rounded-md">Kaydet</button>
        </>}>
            <div className="space-y-4">
                <input value={localRol.ad || ''} onChange={e => setLocalRol(r => ({...r, ad: e.target.value}))} placeholder="Rol Adı" required/>
                <div className="space-y-2">
                    {allPages.map(page => (
                        <div key={page.id} className="grid grid-cols-4 items-center py-2 border-b border-slate-200 last:border-b-0">
                            <span className="font-medium text-slate-800">{page.label}</span>
                            <div className="col-span-3 flex items-center justify-start gap-6">
                                <label className="flex items-center gap-2 text-slate-700 cursor-pointer"><input type="radio" value="yok" checked={!localRol.izinler?.[page.id] || localRol.izinler[page.id] === 'yok'} onChange={() => setLocalRol(produce(draft => { if(!draft.izinler) draft.izinler = {}; draft.izinler[page.id] = 'yok'; }))} /> Gizle</label>
                                <label className="flex items-center gap-2 text-slate-700 cursor-pointer"><input type="radio" value="okuma" checked={localRol.izinler?.[page.id] === 'okuma'} onChange={() => setLocalRol(produce(draft => { if(!draft.izinler) draft.izinler = {}; draft.izinler[page.id] = 'okuma'; }))} /> Sadece Okuma</label>
                                <label className="flex items-center gap-2 text-slate-700 cursor-pointer"><input type="radio" value="tam" checked={localRol.izinler?.[page.id] === 'tam'} onChange={() => setLocalRol(produce(draft => { if(!draft.izinler) draft.izinler = {}; draft.izinler[page.id] = 'tam'; }))} /> Tam Erişim</label>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </PageOverlay>
    );
}

const KullaniciDuzenleModal: React.FC<{
    kullanici: Kullanici | null;
    roller: Rol[];
    onClose: () => void;
    onSave: (kullanici: Omit<Kullanici, 'id'> | Kullanici) => void;
}> = ({ kullanici, roller, onClose, onSave }) => {
    const [localKullanici, setLocalKullanici] = useState<Partial<Kullanici>>(kullanici || { kullaniciAdi: '', sifre: '', rolId: 0});

    const handleSave = () => {
        if(!localKullanici.kullaniciAdi || !localKullanici.sifre || !localKullanici.rolId){
            alert("Tüm alanlar zorunludur.");
            return;
        }
        onSave(localKullanici as Omit<Kullanici, 'id'> | Kullanici);
    }
    
    return (
        <PageOverlay title={kullanici ? "Kullanıcıyı Düzenle" : "Yeni Kullanıcı Ekle"} onClose={onClose} size="lg" footer={<>
            <button onClick={onClose} className="px-4 py-2 rounded-md bg-slate-200 text-slate-800 hover:bg-slate-300">İptal</button>
            <button onClick={handleSave} className="bg-indigo-600 text-white px-4 py-2 rounded-md">Kaydet</button>
        </>}>
            <div className="space-y-4">
                <input value={localKullanici.kullaniciAdi} onChange={e => setLocalKullanici(k => ({...k, kullaniciAdi: e.target.value}))} placeholder="Kullanıcı Adı" required />
                <input type="password" value={localKullanici.sifre} onChange={e => setLocalKullanici(k => ({...k, sifre: e.target.value}))} placeholder="Şifre" required />
                <select value={localKullanici.rolId} onChange={e => setLocalKullanici(k => ({...k, rolId: Number(e.target.value)}))} required>
                    <option value={0} disabled>Rol Seçin...</option>
                    {roller.map(r => <option key={r.id} value={r.id}>{r.ad}</option>)}
                </select>
            </div>
        </PageOverlay>
    )
}


interface SettingsPageProps {
  ayarlar: Ayarlar;
  onSave: (yeniAyarlar: Ayarlar) => void;
  kullanicilar: Kullanici[];
  roller: Rol[];
  onKullaniciSave: (kullanici: Omit<Kullanici, 'id'> | Kullanici) => void;
  onKullaniciDelete: (id: number) => void;
  onRolSave: (rol: Omit<Rol, 'id'> | Rol) => void;
  onRolDelete: (id: number) => void;
  appDataForBackup: any;
  onRestore: (backupData: any) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ ayarlar, onSave, kullanicilar, roller, onKullaniciSave, onKullaniciDelete, onRolSave, onRolDelete, appDataForBackup, onRestore }) => {
  const [localAyarlar, setLocalAyarlar] = useState<Ayarlar>(ayarlar);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);
  const [draggedItem, setDraggedItem] = useState<MenuItem | null>(null);
  const [activeTab, setActiveTab] = useState('sirket');
  const [rolModal, setRolModal] = useState<{acik: boolean, rol: Rol | null}>({acik: false, rol: null});
  const [kullaniciModal, setKullaniciModal] = useState<{acik: boolean, kullanici: Kullanici | null}>({acik: false, kullanici: null});

  const handleSave = () => {
    onSave(localAyarlar);
    alert('Ayarlar kaydedildi!');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, section: keyof Ayarlar, field: string) => {
    const { value } = e.target;
    setLocalAyarlar(produce(draft => { (draft[section] as any)[field] = value; }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => { setLocalAyarlar(prev => ({ ...prev, logo: event.target?.result as string })); };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleListChange = <T,>(listName: keyof Ayarlar, index: number, field: keyof T, value: string) => {
    setLocalAyarlar(produce(draft => { ((draft[listName] as T[])[index] as any)[field] = value; }));
  };

  const handleListAdd = <T,>(listName: keyof Ayarlar, newItem: T) => {
    setLocalAyarlar(produce(draft => { (draft[listName] as T[]).push(newItem); }));
  };
  
  const handleListDelete = (listName: keyof Ayarlar, index: number) => {
    setLocalAyarlar(produce(draft => { (draft[listName] as any[]).splice(index, 1); }));
  };

  const handleDragStart = (e: React.DragEvent, item: MenuItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetItem: MenuItem) => {
    e.preventDefault();
    if (!draggedItem) return;

    const reorder = (items: MenuItem[]): MenuItem[] => {
      const draggedIndex = items.findIndex(i => i.id === draggedItem.id);
      const targetIndex = items.findIndex(i => i.id === targetItem.id);

      if (draggedIndex > -1 && targetIndex > -1) {
        const newItems = [...items];
        const [removed] = newItems.splice(draggedIndex, 1);
        newItems.splice(targetIndex, 0, removed);
        return newItems;
      }
      return items.map(item => item.children ? { ...item, children: reorder(item.children) } : item);
    };
    
    setLocalAyarlar(produce(draft => { draft.menuItems = reorder(draft.menuItems); }));
    setDraggedItem(null);
  };
  
  const handleBackup = () => {
    const dataStr = JSON.stringify(appDataForBackup, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    const date = new Date().toISOString().split('T')[0];
    link.download = `hardworker-backup-${date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setLocalAyarlar(produce(draft => {
        draft.backupConfig.lastBackup = new Date().toISOString();
    }));
    alert('Yedekleme dosyası indirildi. Ayarlardaki "Son Yedekleme" tarihini kalıcı kılmak için "Ayarları Kaydet" butonuna tıklamayı unutmayın.');
  };

  const handleRestoreFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (window.confirm("Mevcut tüm verileriniz seçtiğiniz yedekleme dosyasındaki verilerle değiştirilecektir. Bu işlem geri alınamaz. Emin misiniz?")) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const restoredData = JSON.parse(event.target?.result as string);
                    onRestore(restoredData);
                    if (restoredData.ayarlar) {
                        setLocalAyarlar(restoredData.ayarlar);
                    }
                } catch (error) {
                    console.error("Restore error:", error);
                    alert('Geçersiz veya bozuk yedekleme dosyası.');
                }
            };
            reader.readAsText(file);
        }
    }
    if (e.target) e.target.value = '';
  };

  const renderTabButton = (tabId: string, label: string) => (
      <button onClick={() => setActiveTab(tabId)} className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === tabId ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
          {label}
      </button>
  );

  return (
    <div className="w-full space-y-8">
        <header className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">Ayarlar</h1>
            <p className="text-slate-500 mt-2 text-lg">Uygulama genelindeki ayarları yönetin.</p>
        </header>
        
        <div className="flex justify-center gap-2 border-b pb-4">
            {renderTabButton('sirket', 'Şirket & Finans')}
            {renderTabButton('menu', 'Menü Yönetimi')}
            {renderTabButton('kullanici', 'Kullanıcı Yönetimi')}
        </div>

        <div className="max-w-4xl mx-auto">
           {activeTab === 'sirket' && (
             <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Şirket Bilgileri</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input value={localAyarlar.sirketBilgileri.ad} onChange={e => handleInputChange(e, 'sirketBilgileri', 'ad')} placeholder="Şirket Adı"/>
                        <input value={localAyarlar.sirketBilgileri.vergiDairesi} onChange={e => handleInputChange(e, 'sirketBilgileri', 'vergiDairesi')} placeholder="Vergi Dairesi"/>
                        <input value={localAyarlar.sirketBilgileri.vergiNumarasi} onChange={e => handleInputChange(e, 'sirketBilgileri', 'vergiNumarasi')} placeholder="Vergi Numarası"/>
                        <input value={localAyarlar.sirketBilgileri.telefon} onChange={e => handleInputChange(e, 'sirketBilgileri', 'telefon')} placeholder="Telefon"/>
                        <input value={localAyarlar.sirketBilgileri.email} onChange={e => handleInputChange(e, 'sirketBilgileri', 'email')} placeholder="E-posta"/>
                        <input value={localAyarlar.sirketBilgileri.webSitesi} onChange={e => handleInputChange(e, 'sirketBilgileri', 'webSitesi')} placeholder="Web Sitesi"/>
                        <textarea value={localAyarlar.sirketBilgileri.adres} onChange={e => handleInputChange(e, 'sirketBilgileri', 'adres')} placeholder="Adres" className="md:col-span-2" rows={3}/>
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-xl shadow-md">
                     <h2 className="text-xl font-bold text-slate-800 mb-4">Finansal Ayarlar</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-semibold text-slate-700 mb-2">Para Birimleri</h3>
                            {localAyarlar.paraBirimleri.map((p, i) => (
                                <div key={i} className="flex items-center gap-2 mb-2">
                                    <input value={p.kod} onChange={e => handleListChange<ParaBirimi>('paraBirimleri', i, 'kod', e.target.value)} placeholder="Kod"/>
                                    <input value={p.sembol} onChange={e => handleListChange<ParaBirimi>('paraBirimleri', i, 'sembol', e.target.value)} placeholder="Sembol"/>
                                    <button onClick={() => handleListDelete('paraBirimleri', i)} className="text-red-500 p-2"><TrashIcon/></button>
                                </div>
                            ))}
                            <button onClick={() => handleListAdd<ParaBirimi>('paraBirimleri', {kod: '', sembol: ''})} className="text-indigo-600 text-sm font-semibold flex items-center gap-1 mt-2"><PlusIcon/>Ekle</button>
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-700 mb-2">Ödeme Tipleri</h3>
                            {localAyarlar.odemeTipleri.map((tip, i) => (
                                <div key={i} className="flex items-center gap-2 mb-2">
                                    <input value={tip} onChange={e => { const v = e.target.value; setLocalAyarlar(produce(d => { d.odemeTipleri[i] = v; })); }} placeholder="Ödeme Tipi Adı" />
                                    <button onClick={() => handleListDelete('odemeTipleri', i)} className="text-red-500 p-2"><TrashIcon/></button>
                                </div>
                            ))}
                            <button onClick={() => handleListAdd<string>('odemeTipleri', '')} className="text-indigo-600 text-sm font-semibold flex items-center gap-1 mt-2"><PlusIcon/>Ekle</button>
                        </div>
                         <div>
                            <h3 className="font-semibold text-slate-700 mb-2">Çek Durumları</h3>
                            {localAyarlar.cekDurumlari.map((d, i) => (
                                <div key={i} className="flex items-center gap-2 mb-2">
                                    <input value={d.durum} onChange={e => handleListChange<CekDurumu>('cekDurumlari', i, 'durum', e.target.value)} placeholder="Durum Adı"/>
                                    <input type="color" value={d.renk} onChange={e => handleListChange<CekDurumu>('cekDurumlari', i, 'renk', e.target.value)} className="h-10 w-10 p-1 border rounded-md"/>
                                    <button onClick={() => handleListDelete('cekDurumlari', i)} className="text-red-500 p-2"><TrashIcon/></button>
                                </div>
                            ))}
                             <button onClick={() => handleListAdd<CekDurumu>('cekDurumlari', {durum: '', renk: '#cccccc'})} className="text-indigo-600 text-sm font-semibold flex items-center gap-1 mt-2"><PlusIcon/>Ekle</button>
                        </div>
                         <div>
                            <h3 className="font-semibold text-slate-700 mb-2">Kasa Kategorileri</h3>
                            {localAyarlar.kasaKategorileri.map((kategori, i) => (
                                <div key={i} className="flex items-center gap-2 mb-2">
                                    <input value={kategori} onChange={e => { const v = e.target.value; setLocalAyarlar(produce(d => { d.kasaKategorileri[i] = v; })); }} placeholder="Kategori Adı" />
                                    <button onClick={() => handleListDelete('kasaKategorileri', i)} className="text-red-500 p-2"><TrashIcon/></button>
                                </div>
                            ))}
                            <button onClick={() => handleListAdd<string>('kasaKategorileri', '')} className="text-indigo-600 text-sm font-semibold flex items-center gap-1 mt-2"><PlusIcon/>Ekle</button>
                        </div>
                     </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Yedekleme ve Geri Yükleme</h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={handleBackup}
                                className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Şimdi Yedekle
                            </button>
                            <button
                                onClick={() => restoreInputRef.current?.click()}
                                className="w-full bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Yedekten Geri Yükle
                            </button>
                            <input
                                type="file"
                                ref={restoreInputRef}
                                className="hidden"
                                accept=".json"
                                onChange={handleRestoreFileSelect}
                            />
                        </div>
                        <div className="border-t pt-4">
                            <label className="block text-sm font-medium text-slate-700">Otomatik Yedekleme Zamanlaması</label>
                            <select
                                value={localAyarlar.backupConfig.auto}
                                onChange={e => setLocalAyarlar(produce(draft => { draft.backupConfig.auto = e.target.value as any; }))}
                                className="mt-1 w-full p-2 border border-slate-300 rounded-md"
                            >
                                <option value="off">Kapalı</option>
                                <option value="daily">Günlük</option>
                                <option value="weekly">Haftalık</option>
                            </select>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">
                                Son Yedekleme: 
                                {localAyarlar.backupConfig.lastBackup 
                                    ? ` ${new Date(localAyarlar.backupConfig.lastBackup).toLocaleString('tr-TR')}`
                                    : ' Hiç yedek alınmadı.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
           )}

           {activeTab === 'menu' && (
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Menü Yönetimi</h2>
                    <p className="text-sm text-slate-500 mb-4">Menü öğelerini sürükleyip bırakarak yeniden sıralayabilirsiniz.</p>
                    <div className="space-y-1">
                        {localAyarlar.menuItems.map(item => (
                            <div key={item.id} onDrop={(e) => handleDrop(e, item)} onDragOver={(e) => e.preventDefault()}>
                                <div draggable onDragStart={(e) => handleDragStart(e, item)} className="flex items-center justify-between p-2 rounded bg-slate-100 cursor-move">
                                    <div className="flex items-center gap-2">
                                        <DragHandleIcon />
                                        <span className="font-medium text-slate-700">{item.label}</span>
                                    </div>
                                    <input type="checkbox" checked={item.visible} onChange={e => { const v = e.target.checked; setLocalAyarlar(produce(d => { d.menuItems.find(i=>i.id===item.id)!.visible = v; }))}}/>
                                </div>
                                {item.children && (
                                    <div className="ml-6 mt-1 space-y-1">
                                        {item.children.map(child => (
                                            <div key={child.id} className="flex items-center justify-between p-2 rounded bg-slate-50">
                                                 <span className="font-medium text-slate-600">{child.label}</span>
                                                 <input type="checkbox" checked={child.visible} onChange={e => { const v = e.target.checked; setLocalAyarlar(produce(d => { d.menuItems.find(i=>i.id===item.id)!.children!.find(c=>c.id===child.id)!.visible = v; }))}}/>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
           )}

           {activeTab === 'kullanici' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <div className="flex justify-between items-center mb-4">
                             <h2 className="text-xl font-bold text-slate-800">Roller</h2>
                             <button onClick={() => setRolModal({acik: true, rol: null})} className="flex items-center gap-2 bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg"><PlusIcon/>Yeni Rol</button>
                        </div>
                        <ul className="divide-y divide-slate-200">
                            {roller.map(r => <li key={r.id} className="py-2 flex justify-between items-center"><span className="text-slate-900 font-medium">{r.ad}</span><div className="space-x-2"><button onClick={() => setRolModal({acik: true, rol: r})} className="text-sky-600 hover:text-sky-800"><EditIcon/></button><button onClick={() => onRolDelete(r.id)} className="text-red-600 hover:text-red-800"><TrashIcon/></button></div></li>)}
                        </ul>
                    </div>
                     <div className="bg-white p-6 rounded-xl shadow-md">
                        <div className="flex justify-between items-center mb-4">
                             <h2 className="text-xl font-bold text-slate-800">Kullanıcılar</h2>
                             <button onClick={() => setKullaniciModal({acik: true, kullanici: null})} className="flex items-center gap-2 bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg"><PlusIcon/>Yeni Kullanıcı</button>
                        </div>
                        <ul className="divide-y divide-slate-200">
                            {kullanicilar.map(k => <li key={k.id} className="py-2 flex justify-between items-center"><span className="text-slate-900 font-medium">{k.kullaniciAdi}</span> <span className="text-sm text-slate-500">{roller.find(r=>r.id===k.rolId)?.ad}</span> <div className="space-x-2"><button onClick={() => setKullaniciModal({acik: true, kullanici: k})} className="text-sky-600 hover:text-sky-800"><EditIcon/></button><button onClick={() => onKullaniciDelete(k.id)} className="text-red-600 hover:text-red-800"><TrashIcon/></button></div></li>)}
                        </ul>
                    </div>
                </div>
           )}
        </div>

        <footer className="text-center pt-4">
            <button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg shadow-md">
                Ayarları Kaydet
            </button>
        </footer>
        
        {rolModal.acik && <RolDuzenleModal rol={rolModal.rol} onClose={() => setRolModal({acik: false, rol: null})} onSave={onRolSave} menuItems={ayarlar.menuItems}/>}
        {kullaniciModal.acik && <KullaniciDuzenleModal kullanici={kullaniciModal.kullanici} roller={roller} onClose={() => setKullaniciModal({acik: false, kullanici: null})} onSave={onKullaniciSave}/>}
    </div>
  );
};

export default SettingsPage;
