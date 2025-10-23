

import React, { useState } from 'react';
// FIX: Corrected import path
import { Page } from '../types';
// FIX: Corrected import path
import { UserProfile, Ayarlar, MenuItem, Kullanici, Rol } from '../types';
import { 
    HomeIcon, UserCircleIcon, UsersIcon, ReceiptIcon, BriefcaseIcon, ChequeIcon, CogIcon, LogoutIcon, 
    CalculatorIcon, SafeIcon, ClipboardListIcon, TagIcon, DocumentTextIcon, PieChartIcon, HomeModernIcon,
    PhotographIcon, UsersGroupIcon, PaperAirplaneIcon
// FIX: Corrected import path
} from './icons/AppIcons';
import ChevronDoubleLeftIcon from './icons/ChevronDoubleLeftIcon';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  onLogout: () => void;
  profile: UserProfile;
  ayarlar: Ayarlar;
  aktifKullanici: Kullanici;
  roller: Rol[];
}

const iconMap: { [key: string]: React.ReactNode } = {
    HomeIcon: <HomeIcon />,
    UserCircleIcon: <UserCircleIcon />,
    UsersIcon: <UsersIcon />,
    ReceiptIcon: <ReceiptIcon />,
    BriefcaseIcon: <BriefcaseIcon />,
    ChequeIcon: <ChequeIcon />,
    CogIcon: <CogIcon />,
    LogoutIcon: <LogoutIcon />,
    CalculatorIcon: <CalculatorIcon />,
    SafeIcon: <SafeIcon />,
    ClipboardListIcon: <ClipboardListIcon />,
    TagIcon: <TagIcon />,
    DocumentTextIcon: <DocumentTextIcon />,
    PieChartIcon: <PieChartIcon />,
    HomeModernIcon: <HomeModernIcon />,
    PhotographIcon: <PhotographIcon />,
    UsersGroupIcon: <UsersGroupIcon />,
    PaperAirplaneIcon: <PaperAirplaneIcon />
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, currentPage, setCurrentPage, onLogout, ayarlar, aktifKullanici, roller }) => {
  const [openSubMenus, setOpenSubMenus] = useState<{ [key: string]: boolean }>({});
  
  const userRole = roller.find(r => r.id === aktifKullanici.rolId);

  const hasPermission = (pageId: string) => {
    if (!userRole) return false;
    // Admins always have access
    if (userRole.ad === 'Admin') return true;
    const permission = userRole.izinler[pageId as Page];
    return permission && permission !== 'yok';
  };


  const renderMenuItem = (item: MenuItem, isSubItem = false) => {
    if (!item.visible) return null;

    if (item.children && isOpen) {
      const visibleChildren = item.children.filter(child => child.visible && hasPermission(child.id));
      if (visibleChildren.length === 0) return null;

      const isParentActive = visibleChildren.some(child => child.id === currentPage);
      const isSubMenuOpen = openSubMenus[item.id] ?? isParentActive;

      return (
        <li key={item.id}>
          <button 
            onClick={() => setOpenSubMenus(prev => ({...prev, [item.id]: !isSubMenuOpen}))}
            className={`flex items-center p-2 text-base font-normal rounded-lg w-full text-left transition-colors ${
              isParentActive ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            {iconMap[item.icon]}
            <span className="ml-3 flex-1 whitespace-nowrap">{item.label}</span>
            <svg className={`w-6 h-6 transition-transform ${isSubMenuOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
          </button>
          {isSubMenuOpen && (
            <ul className="py-2 space-y-2">
              {visibleChildren.map(child => renderMenuItem(child, true))}
            </ul>
          )}
        </li>
      );
    }

    if (!hasPermission(item.id)) return null;

    const baseClasses = "flex items-center p-2 rounded-lg transition-colors";
    const activeClasses = 'bg-indigo-700 text-white';
    const inactiveClasses = 'text-gray-300 hover:bg-gray-700';

    const className = `${baseClasses} ${currentPage === item.id ? activeClasses : inactiveClasses} ${isSubItem && isOpen ? 'pl-11 text-sm' : 'text-base'}`;

    return (
      <li key={item.id}>
        <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(item.id as Page); }} className={className} title={!isOpen ? item.label : ''}>
          {iconMap[item.icon]}
          {isOpen && <span className="ml-3">{item.label}</span>}
        </a>
      </li>
    );
  };


  return (
    <div className={`fixed top-0 left-0 h-full bg-gray-900 text-white flex flex-col p-4 shadow-lg transition-all duration-300 z-30 ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className={`mb-10 text-center transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
        <h1 className="text-2xl font-bold">Hardworker</h1>
      </div>
      <ul className="space-y-2 flex-grow overflow-y-auto overflow-x-hidden">
        {ayarlar.menuItems.map(item => renderMenuItem(item))}
      </ul>
      <div className="pt-4 border-t border-gray-700">
         {renderMenuItem({ id: 'settings', label: 'Ayarlar', icon: 'CogIcon', visible: true })}
         {renderMenuItem({ id: 'profile', label: 'Profil', icon: 'UserCircleIcon', visible: true })}
         <hr className="my-2 border-gray-700" />
         <a
            href="#"
            onClick={(e) => { e.preventDefault(); onLogout(); }}
            className={`flex items-center p-2 text-base font-normal rounded-lg text-red-400 hover:bg-red-600 hover:text-white ${!isOpen && 'justify-center'}`}
            title={!isOpen ? 'Çıkış Yap' : ''}
          >
            <LogoutIcon />
            {isOpen && <span className="ml-3">Çıkış Yap</span>}
          </a>
      </div>
      <div className="pt-4 mt-auto border-t border-gray-700">
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="w-full flex items-center justify-center p-2 text-gray-400 hover:bg-gray-700 rounded-lg"
        >
            <div className={`transition-transform duration-300 ${!isOpen && 'rotate-180'}`}>
                <ChevronDoubleLeftIcon />
            </div>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
