// src/pages/invoices/processed.tsx
import React, { useState } from 'react';
import Head from 'next/head';
import InvoicesLayout from '../../components/Layout/InvoicesLayout';
import InvoiceList from '../../components/Invoices/Invoices';
import styles from '../../styles/invoices.module.css';

const ProcessedInvoicesPage: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState<number>(0);

  return (
    <>
      <Head>
        <title>Processed Invoices | Zoku</title>
        <meta name="description" content="View your processed invoices" />
      </Head>

      <InvoicesLayout>
        <InvoiceList key={refreshKey} filterStatus="processed" />
      </InvoicesLayout>
    </>
  );
};

export default ProcessedInvoicesPage;
