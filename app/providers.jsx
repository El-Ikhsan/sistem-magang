'use client';

import { LayoutProvider } from '../layout/context/layoutcontext';
import { PrimeReactProvider } from 'primereact/api';
import { AuthProvider } from '../layout/context/AuthContext';

export function Providers({ children }) {
  return (
    <PrimeReactProvider>
      <AuthProvider>
        <LayoutProvider>
          {children}
        </LayoutProvider>
      </AuthProvider>
    </PrimeReactProvider>
  );
}
