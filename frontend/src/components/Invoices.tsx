import React, { useState } from 'react';
import Layout from '../components/Layout/Layout';
import styles from './Invoices.module.css';

const Invoices = () => {
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Sample invoice data - replace with actual data in your implementation
  const invoices = [
    { id: 'INV-001', vendor: 'Office Supplies Inc.', date: '2025-04-01', amount: '$245.50', status: 'Processed' },
    { id: 'INV-002', vendor: 'Tech Solutions LLC', date: '2025-03-28', amount: '$1,200.00', status: 'Pending' },
    { id: 'INV-003', vendor: 'Marketing Services Co.', date: '2025-03-25', amount: '$850.75', status: 'Processed' },
    { id: 'INV-004', vendor: 'Utility Provider', date: '2025-03-20', amount: '$145.30', status: 'Processed' },
    { id: 'INV-005', vendor: 'Consulting Group', date: '2025-03-15', amount: '$3,500.00', status: 'Pending' },
  ];

  return (
    <Layout>
      <div className={styles.container}>
        {showUploadForm ? (
          <div className={styles.uploadSection}>
            <div className={styles.uploadCard}>
              <h2>Upload New Invoice</h2>
              <p>Drag and drop your invoice files here or click to browse</p>
              <div className={styles.dropzone}>
                <input type="file" className={styles.fileInput} />
                <div className={styles.uploadIcon}></div>
                <p>Supported formats: PDF, JPG, PNG</p>
              </div>
              <div className={styles.buttonGroup}>
                <button
                  className={styles.cancelButton}
                  onClick={() => setShowUploadForm(false)}
                >
                  Cancel
                </button>
                <button className={styles.uploadButton}>Upload Invoice</button>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.invoicesList}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Vendor</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(invoice => (
                  <tr key={invoice.id}>
                    <td>{invoice.id}</td>
                    <td>{invoice.vendor}</td>
                    <td>{invoice.date}</td>
                    <td>{invoice.amount}</td>
                    <td>
                      <span className={`${styles.status} ${styles[invoice.status.toLowerCase()]}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td>
                      <button className={styles.actionButton}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Invoices;
