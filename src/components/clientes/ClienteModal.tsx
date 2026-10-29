import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Cliente } from '../../types';
import { X, UserPlus, Phone, MapPin } from 'lucide-react';

interface ClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  clienteToEdit?: Cliente | null;
}

export const ClienteModal: React.FC<ClienteModalProps> = ({
  isOpen,
  onClose,
  clienteToEdit,
}) => {
  const { addCliente, updateCliente, executeWithAdminAuth } = useApp();

  const [nombre, setNombre] = useState(clienteToEdit?.nombre || '');
  const [telefono, setTelefono] = useState(clienteToEdit?.telefono || '');
  const [referencia, setReferencia] = useState(clienteToEdit?.referencia || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      alert('Por favor ingresa el nombre del cliente');
      return;
    }

    executeWithAdminAuth(() => {
      if (clienteToEdit) {
        updateCliente({
          ...clienteToEdit,
          nombre,
          telefono,
          referencia,
        });
      } else {
        addCliente({
          nombre,
          telefono,
          referencia,
        });
      }
      onClose();
    }, clienteToEdit ? `actualizar datos de ${nombre}` : `agregar al cliente ${nombre}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white dark:bg-[#1E1714] rounded-2xl shadow-2xl border border-[#3E2010]/20 dark:border-[#52301A] overflow-hidden">
        {/* Header */}
        <div className="bg-[#3E2010] text-[#FBF9F6] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-[#E8C39E]" />
            <h3 className="font-display font-bold text-base">
              {clienteToEdit ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#D8B490] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#5C3D2E] dark:text-[#C5A898]">
              Nombre Completo del Cliente:
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Nelson, July, Lilian..."
              className="w-full py-2 px-3 bg-[#FBF9F6] dark:bg-[#261C18] border border-[#3E2010]/20 rounded-xl text-xs font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#5C3D2E] dark:text-[#C5A898] flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" />
              <span>Teléfono / WhatsApp:</span>
            </label>
            <input
              type="text"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Ej: +58 412 1234567"
              className="w-full py-2 px-3 bg-[#FBF9F6] dark:bg-[#261C18] border border-[#3E2010]/20 rounded-xl text-xs font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#5C3D2E] dark:text-[#C5A898] flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>Referencia / Ubicación / Nota:</span>
            </label>
            <textarea
              rows={3}
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
              placeholder="Ej: Hermana de Nelson, vecina calle 4, entrega a domicilio..."
              className="w-full py-2 px-3 bg-[#FBF9F6] dark:bg-[#261C18] border border-[#3E2010]/20 rounded-xl text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#3E2010]/10">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 text-xs font-medium text-[#6B4B38] bg-[#F1ECE4] rounded-xl hover:bg-[#E7DFD4]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="py-2.5 px-6 text-xs font-semibold text-white bg-[#3E2010] hover:bg-[#2C160B] rounded-xl shadow-xs"
            >
              Guardar Cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
