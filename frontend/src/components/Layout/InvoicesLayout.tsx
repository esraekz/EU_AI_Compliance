// src/components/Invoices/InvoicesLayout.tsx
import React, { ReactNode } from 'react';
import styles from './InvoicesLayout.module.css';
import InvoicesHeaderbar from '../../components/Invoices/InvoicesHeaderbar';

interface InvoicesLayoutProps {
  children: ReactNode;
}

const InvoicesLayout: React.FC<InvoicesLayoutProps> = ({ children }) => {
  return (
    <div className={styles.container}>
      <InvoicesHeaderbar />
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
};

export default InvoicesLayout;
