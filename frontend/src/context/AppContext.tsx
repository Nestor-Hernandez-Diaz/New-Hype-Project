import React from 'react';
import type { ReactNode } from 'react';
import { AuthProvider } from '../modules/auth/context/AuthContext';
import { NotificationProvider } from './NotificationContext';
import { ModalProvider } from './ModalContext';
import { UIProvider } from './UIContext';
import { ProductProvider } from '../modules/products/context/ProductContext';
import { ClientProvider } from '../modules/clients/context/ClientContext';
import { SalesProvider } from '../modules/sales/context/SalesContext';
import { InventoryProvider } from '../modules/inventory/context/InventoryContext';

/**
 * AppProvider es un componente que anida todos los proveedores de contexto de la aplicación.
 * Esto simplifica el árbol de componentes en App.tsx y centraliza la gestión de contextos.
 */
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ModalProvider>
          <UIProvider>
            <ProductProvider>
              <ClientProvider>
                <InventoryProvider>
                  <SalesProvider>
                    {children}
                  </SalesProvider>
                </InventoryProvider>
              </ClientProvider>
            </ProductProvider>
          </UIProvider>
        </ModalProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};
