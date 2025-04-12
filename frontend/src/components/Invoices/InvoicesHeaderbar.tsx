// src/components/Invoices/InvoicesHeaderbar.tsx
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../../styles/invoices.module.css';
import { Upload } from 'lucide-react';

const InvoicesHeaderbar: React.FC = () => {
  const router = useRouter();

  // Function to determine if a specific path is active
  const isActive = (path: string) => {
    return router.pathname === path;
  };

  return (
    <div className={styles.invoicesContainer}>
      <div className={styles.tabsContainer}>
        <Link href="/invoices/uploaded" passHref>
          <div className={`${styles.tab} ${isActive('/invoices/uploaded') ? styles.activeTab : ''}`}>
            Uploaded
          </div>
        </Link>
        <Link href="/invoices/processed" passHref>
          <div className={`${styles.tab} ${isActive('/invoices/processed') ? styles.activeTab : ''}`}>
            Processed
          </div>
        </Link>
      </div>

      <div className={styles.uploadButtonWrapper}>
        <Link href="/invoices/upload" passHref>
          <button className={styles.uploadButton}>
            <Upload className={styles.uploadIcon} />
            Upload Invoice
          </button>
        </Link>
      </div>
    </div>
  );
};

export default InvoicesHeaderbar;
