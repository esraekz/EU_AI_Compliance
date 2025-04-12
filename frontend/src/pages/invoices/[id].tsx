// zoku/frontend/pages/invoices/[id].tsx
import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import InvoiceViewer from '../../components/InvoiceViewer/InvoiceViewer';


const InvoiceViewerPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <>
      <Head>
        <title>View Invoice | Zoku</title>
        <meta name="description" content="View and process invoice" />
      </Head>


        {id ? (
          <InvoiceViewer invoiceId={id as string} />
        ) : (
          <div className="text-center py-12">Loading...</div>
        )}
     
    </>
  );
};

export default InvoiceViewerPage;
