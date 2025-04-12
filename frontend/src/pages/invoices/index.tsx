// src/pages/invoices/index.tsx
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import InvoicesLayout from '../../components/Layout/InvoicesLayout';
import { FileText } from 'lucide-react';
import styles from '../../styles/invoices.module.css';

const InvoicesPage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the uploaded invoices page by default
    if (router.pathname === '/invoices') {
      router.push('/invoices/uploaded');
    }
  }, [router]);

  return (
    <>
      <Head>
        <title>Invoices | Zoku</title>
        <meta name="description" content="Manage your invoices" />
      </Head>

      <InvoicesLayout>
        <div className={styles.loadingState}>
          <FileText className={styles.icon} />
          <p>Redirecting to uploaded invoices...</p>
        </div>
      </InvoicesLayout>
    </>
  );
};

export default InvoicesPage;
