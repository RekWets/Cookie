import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Boxes,
  BookOpen,
  ClipboardList,
  History,
  Settings,
  HelpCircle,
  Sun,
  Moon,
  Lock,
  Unlock,
  Bell,
  Search,
  Sparkles,
  HardDriveDownload,
  Laptop,
  Users,
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
  onOpenSearch?: () => void;
  onOpenExportClone?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile, onOpenSearch, onOpenExportClone }) => {
  const {
    config,
    activeNavTab,
    setActiveNavTab,
    isDarkMode,
    toggleDarkMode,
    isAdminUnlocked,
    lockAdmin,
    executeWithAdminAuth,
  } = useApp();

  const handleNavClick = (tabId: string) => {
    setActiveNavTab(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  const navItemClass = (tabId: string) => {
    const isActive = activeNavTab === tabId;
    return `w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
      isActive
        ? 'bg-[#3E2010] text-[#FBF9F6] shadow-xs dark:bg-[#52301A]'
        : 'text-[#5C3D2E] dark:text-[#C5A898] hover:bg-[#EFEAE2] dark:hover:bg-[#2A1F1B] hover:text-[#2C1810] dark:hover:text-[#F1EAE4]'
    }`;
  };

  return (
    <aside className="w-64 h-full flex flex-col justify-between bg-[#F8F6F2] dark:bg-[#181210] border-r border-[#3E2010]/10 dark:border-[#332219] p-4 select-none overflow-y-auto">
      <div className="space-y-5">
        {/* User Profile header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#3E2010]/10 dark:border-[#332219]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative">
              <img
                src={config.avatarUrl || '/src/assets/images/avatar_yulihanny_1792170727263.jpg'}
                alt={config.nombreUsuario}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-[#3E2010]/20 dark:ring-[#52301A]"
              />
              <span
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#181210] ${
                  isAdminUnlocked ? 'bg-emerald-500' : 'bg-[#D8B490]'
                }`}
              />
            </div>
            <div className="truncate">
              <h2 className="font-display font-semibold text-xs text-[#2C1810] dark:text-[#F1EAE4] truncate">
                {config.nombreUsuario || 'Yulihanny'}
              </h2>
              <span className="text-[11px] text-[#8C6D58] dark:text-[#A0816E] flex items-center gap-1">
                {isAdminUnlocked ? (
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium">Admin Activo</span>
                ) : (
                  <span>Modo Vista</span>
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                if (isAdminUnlocked) {
                  lockAdmin();
                } else {
                  executeWithAdminAuth(() => {}, 'desbloquear sesión de administración');
                }
              }}
              title={isAdminUnlocked ? 'Bloquear clave de administrador' : 'Desbloquear con clave de administrador'}
              className="p-1.5 rounded-lg text-[#5C3D2E] dark:text-[#C5A898] hover:bg-[#EAE4DC] dark:hover:bg-[#2A1F1B] transition-colors"
            >
              {isAdminUnlocked ? (
                <Unlock className="w-4 h-4 text-emerald-600" />
              ) : (
                <Lock className="w-4 h-4 text-[#8C6D58]" />
              )}
            </button>
          </div>
        </div>

        {/* Search input mock / action */}
        <div
          onClick={onOpenSearch}
          className="flex items-center justify-between px-3 py-2 bg-white dark:bg-[#231A16] border border-[#3E2010]/15 dark:border-[#38261E] rounded-xl cursor-pointer hover:border-[#3E2010]/40 transition-colors shadow-2xs"
        >
          <div className="flex items-center gap-2 text-xs text-[#8C6D58] dark:text-[#A0816E]">
            <Search className="w-3.5 h-3.5" />
            <span>Buscar productos...</span>
          </div>
          <kbd className="text-[10px] bg-[#F1ECE4] dark:bg-[#32231C] text-[#6B4B38] dark:text-[#B59685] px-1.5 py-0.5 rounded-md font-mono">
            Ctrl+D
          </kbd>
        </div>

        {/* Section: General */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C6D58] dark:text-[#A0816E] px-3">
            General
          </span>
          <div className="space-y-0.5 pt-1">
            <button
              onClick={() => handleNavClick('dashboard')}
              className={navItemClass('dashboard')}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => handleNavClick('productos')}
              className={navItemClass('productos')}
            >
              <Package className="w-4 h-4" />
              <span>Productos</span>
            </button>
            <button
              onClick={() => handleNavClick('clientes')}
              className={navItemClass('clientes')}
            >
              <Users className="w-4 h-4" />
              <span>Clientes & Deudas</span>
            </button>
            <button
              onClick={() => handleNavClick('inventario')}
              className={navItemClass('inventario')}
            >
              <Boxes className="w-4 h-4" />
              <span>Inventario (Insumos)</span>
            </button>
          </div>
        </div>

        {/* Section: Mi Espacio */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C6D58] dark:text-[#A0816E] px-3">
            Mi Espacio
          </span>
          <div className="space-y-0.5 pt-1">
            <button
              onClick={() => handleNavClick('recetario')}
              className={navItemClass('recetario')}
            >
              <BookOpen className="w-4 h-4" />
              <span>Recetario</span>
            </button>
            <button
              onClick={() => handleNavClick('ventas')}
              className={navItemClass('ventas')}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Ventas</span>
            </button>
            <button
              onClick={() => handleNavClick('actividad')}
              className={navItemClass('actividad')}
            >
              <History className="w-4 h-4" />
              <span>Actividad</span>
            </button>
          </div>
        </div>

        {/* Section: Soporte */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C6D58] dark:text-[#A0816E] px-3">
            Soporte
          </span>
          <div className="space-y-0.5 pt-1">
            <button
              onClick={() => {
                if (onOpenExportClone) onOpenExportClone();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-amber-900 dark:text-amber-300 bg-amber-100/60 dark:bg-amber-950/40 hover:bg-amber-200/70 dark:hover:bg-amber-900/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <HardDriveDownload className="w-4 h-4 text-amber-700 dark:text-amber-400 group-hover:scale-110 transition-transform" />
                <span>Copia Multiequipo</span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-200/80 dark:bg-amber-800/60 font-semibold">
                Exportar
              </span>
            </button>
            <button
              onClick={() => handleNavClick('ajustes')}
              className={navItemClass('ajustes')}
            >
              <Settings className="w-4 h-4" />
              <span>Ajustes</span>
            </button>
            <button
              onClick={() => handleNavClick('ayuda')}
              className={navItemClass('ayuda')}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Help!</span>
            </button>
          </div>
        </div>
      </div>

      {/* Theme toggle bottom */}
      <div className="pt-4 border-t border-[#3E2010]/10 dark:border-[#332219]">
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#5C3D2E] dark:text-[#C5A898] hover:bg-[#EAE4DC] dark:hover:bg-[#2A1F1B] transition-colors"
        >
          <div className="flex items-center gap-2">
            {isDarkMode ? <Moon className="w-4 h-4 text-amber-300" /> : <Sun className="w-4 h-4 text-amber-600" />}
            <span>{isDarkMode ? 'Darkmode' : 'Lightmode'}</span>
          </div>
          <div className="w-7 h-4 bg-[#E2D8CC] dark:bg-[#3D2C24] rounded-full p-0.5 flex items-center">
            <div
              className={`w-3 h-3 rounded-full bg-[#3E2010] dark:bg-[#E8C39E] transition-transform ${
                isDarkMode ? 'translate-x-3' : 'translate-x-0'
              }`}
            />
          </div>
        </button>
      </div>
    </aside>
  );
};
