/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { VentasView } from './components/ventas/VentasView';
import { RecetarioView } from './components/recetario/RecetarioView';
import { InventarioView } from './components/inventario/InventarioView';
import { ClientesView } from './components/clientes/ClientesView';
import { DashboardView } from './components/dashboard/DashboardView';
import { ProductosView } from './components/productos/ProductosView';
import { ActividadView } from './components/actividad/ActividadView';
import { AjustesView } from './components/ajustes/AjustesView';
import { AyudaView } from './components/ayuda/AyudaView';
import { AdminAuthModal } from './components/modals/AdminAuthModal';
import { RecetaModal } from './components/recetario/RecetaModal';
import { ElaborarModal } from './components/recetario/ElaborarModal';
import { InsumoModal } from './components/inventario/InsumoModal';
import { ClienteModal } from './components/clientes/ClienteModal';
import { SearchModal } from './components/modals/SearchModal';
import { Receta, Insumo, Cliente } from './types';
import {
  Menu,
  X,
  Lock,
  Unlock,
  Search,
  Flame,
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Boxes,
  Users,
  DollarSign,
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    activeNavTab,
    setActiveNavTab,
    isAdminUnlocked,
    lockAdmin,
    executeWithAdminAuth,
    setSelectedLoteId,
    config,
  } = useApp();

  // Mobile drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [elaborarModalOpen, setElaborarModalOpen] = useState(false);
  const [elaborarRecetaId, setElaborarRecetaId] = useState<string | null>(null);

  const [recetaModalOpen, setRecetaModalOpen] = useState(false);
  const [recetaToEdit, setRecetaToEdit] = useState<Receta | null>(null);

  const [insumoModalOpen, setInsumoModalOpen] = useState(false);
  const [insumoToEdit, setInsumoToEdit] = useState<Insumo | null>(null);

  const [clienteModalOpen, setClienteModalOpen] = useState(false);
  const [clienteToEdit, setClienteToEdit] = useState<Cliente | null>(null);

  // Global Ctrl+D shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers
  const handleOpenElaborar = (recetaId?: string) => {
    setElaborarRecetaId(recetaId || null);
    setElaborarModalOpen(true);
  };

  const handleOpenNewReceta = () => {
    setRecetaToEdit(null);
    setRecetaModalOpen(true);
  };

  const handleOpenEditReceta = (receta: Receta) => {
    setRecetaToEdit(receta);
    setRecetaModalOpen(true);
  };

  const handleOpenNewInsumo = () => {
    setInsumoToEdit(null);
    setInsumoModalOpen(true);
  };

  const handleOpenEditInsumo = (insumo: Insumo) => {
    setInsumoToEdit(insumo);
    setInsumoModalOpen(true);
  };

  const handleOpenNewCliente = () => {
    setClienteToEdit(null);
    setClienteModalOpen(true);
  };

  const handleOpenEditCliente = (cliente: Cliente) => {
    setClienteToEdit(cliente);
    setClienteModalOpen(true);
  };

  const getPageTitle = () => {
    switch (activeNavTab) {
      case 'dashboard':
        return 'Dashboard';
      case 'productos':
        return 'Productos Terminados';
      case 'inventario':
        return 'Inventario de Insumos';
      case 'recetario':
        return 'Recetario';
      case 'ventas':
        return 'Ventas / Clientes';
      case 'clientes':
        return 'Directorio de Clientes';
      case 'actividad':
        return 'Actividad Reciente';
      case 'ajustes':
        return 'Ajustes del Sistema';
      case 'ayuda':
        return 'Ayuda & Tutorial';
      default:
        return 'DulceGestión';
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FBF9F6] dark:bg-[#150F0D] text-[#2C1810] dark:text-[#F1EAE4]">
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full">
        <Sidebar onOpenSearch={() => setIsSearchOpen(true)} />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 h-full z-10 bg-white dark:bg-[#181210] shadow-2xl">
            <Sidebar
              onCloseMobile={() => setMobileMenuOpen(false)}
              onOpenSearch={() => {
                setMobileMenuOpen(false);
                setIsSearchOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-14 shrink-0 bg-white dark:bg-[#1A1310] border-b border-[#3E2010]/10 dark:border-[#332219] px-4 sm:px-6 flex items-center justify-between gap-4 select-none">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg text-[#5C3D2E] dark:text-[#C5A898] hover:bg-[#F1ECE4] dark:hover:bg-[#2A1F1B] md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm sm:text-base text-[#2C1810] dark:text-[#F1EAE4]">
                {getPageTitle()}
              </span>
              <span className="hidden sm:inline text-xs text-[#8C6D58] dark:text-[#A0816E]">
                • {config.nombreNegocio || 'Repostería'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Currency Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#F8F6F2] dark:bg-[#261C18] border border-[#3E2010]/10 rounded-full text-[11px] font-mono text-[#5C3D2E] dark:text-[#C5A898]">
              <span>Tasa:</span>
              <strong className="text-[#3E2010] dark:text-[#E8C39E]">
                1 $ = {config.tasaCambioBsUSD} Bs
              </strong>
            </div>

            {/* Quick Search */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-xl text-[#5C3D2E] dark:text-[#C5A898] hover:bg-[#F1ECE4] dark:hover:bg-[#2A1F1B] transition-colors"
              title="Buscar (Ctrl+D)"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Quick Hornear Button */}
            <button
              onClick={() => handleOpenElaborar()}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#3E2010] hover:bg-[#28150A] text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Hornear Lote</span>
            </button>

            {/* Admin PIN status button */}
            <button
              onClick={() => {
                if (isAdminUnlocked) {
                  lockAdmin();
                } else {
                  executeWithAdminAuth(() => {}, 'activar modo administrador');
                }
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                isAdminUnlocked
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200'
                  : 'bg-[#F1ECE4] dark:bg-[#261C18] text-[#6B4B38] dark:text-[#B59685] hover:bg-[#E8DFD3]'
              }`}
            >
              {isAdminUnlocked ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Admin Activo</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-[#8C6D58]" />
                  <span className="hidden sm:inline">Clave Admin</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* View Switcher */}
        <main className="flex-1 flex overflow-hidden">
          {activeNavTab === 'dashboard' && (
            <DashboardView
              onOpenElaborarModal={() => handleOpenElaborar()}
              onOpenNewInsumoModal={handleOpenNewInsumo}
              onOpenNewClienteModal={handleOpenNewCliente}
            />
          )}

          {activeNavTab === 'ventas' && (
            <VentasView
              onOpenElaborarModal={() => handleOpenElaborar()}
              onOpenClienteModal={handleOpenNewCliente}
            />
          )}

          {activeNavTab === 'recetario' && (
            <RecetarioView
              onOpenNewRecetaModal={handleOpenNewReceta}
              onOpenEditRecetaModal={handleOpenEditReceta}
              onOpenElaborarModal={handleOpenElaborar}
            />
          )}

          {activeNavTab === 'inventario' && (
            <InventarioView
              onOpenNewInsumoModal={handleOpenNewInsumo}
              onOpenEditInsumoModal={handleOpenEditInsumo}
            />
          )}

          {activeNavTab === 'clientes' && (
            <ClientesView
              onOpenNewClienteModal={handleOpenNewCliente}
              onOpenEditClienteModal={handleOpenEditCliente}
            />
          )}

          {activeNavTab === 'productos' && (
            <ProductosView onOpenElaborarModal={() => handleOpenElaborar()} />
          )}

          {activeNavTab === 'actividad' && <ActividadView />}

          {activeNavTab === 'ajustes' && <AjustesView />}

          {activeNavTab === 'ayuda' && <AyudaView />}
        </main>

        {/* Mobile Bottom Navigation (APK style as shown in Screenshot 2) */}
        <nav className="sm:hidden h-14 shrink-0 bg-white dark:bg-[#1A1310] border-t border-[#3E2010]/10 dark:border-[#332219] flex items-center justify-around px-2 z-20">
          {[
            { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
            { id: 'recetario', label: 'Recetario', icon: BookOpen },
            { id: 'ventas', label: 'Ventas', icon: ClipboardList },
            { id: 'inventario', label: 'Insumos', icon: Boxes },
            { id: 'clientes', label: 'Clientes', icon: Users },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeNavTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNavTab(item.id)}
                className={`flex flex-col items-center justify-center w-12 py-1 transition-all ${
                  isActive
                    ? 'text-[#3E2010] dark:text-[#E8C39E] font-bold'
                    : 'text-[#8C6D58] dark:text-[#A0816E]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[10px] mt-0.5">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Global Modals */}
      <AdminAuthModal />

      <RecetaModal
        isOpen={recetaModalOpen}
        onClose={() => setRecetaModalOpen(false)}
        recetaToEdit={recetaToEdit}
      />

      <ElaborarModal
        isOpen={elaborarModalOpen}
        onClose={() => setElaborarModalOpen(false)}
        defaultRecetaId={elaborarRecetaId}
      />

      <InsumoModal
        isOpen={insumoModalOpen}
        onClose={() => setInsumoModalOpen(false)}
        insumoToEdit={insumoToEdit}
      />

      <ClienteModal
        isOpen={clienteModalOpen}
        onClose={() => setClienteModalOpen(false)}
        clienteToEdit={clienteToEdit}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectReceta={(id) => {
          setActiveNavTab('recetario');
        }}
        onSelectLote={(id) => {
          setSelectedLoteId(id);
          setActiveNavTab('ventas');
        }}
        onSelectCliente={(id) => {
          setActiveNavTab('clientes');
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
