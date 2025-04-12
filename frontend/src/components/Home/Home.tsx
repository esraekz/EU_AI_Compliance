import React from 'react';
import styles from './Home.module.css';

const Home: React.FC = () => {
  return (
    <div className={styles.homeContainer}>
      <section className={styles.hero}>
        <h1>Welcome to Zoku</h1>
        <p className={styles.subtitle}>Intelligent Document Processing for Modern Businesses</p>

        <div className={styles.description}>
          <p>
            Zoku streamlines your document workflow by automatically extracting key information from
            invoices and business documents. Our AI-powered platform helps you process documents faster,
            reduce manual data entry, and gain valuable insights from your business paperwork.
          </p>
        </div>
      </section>

      <section className={styles.features}>
        <h2>Key Features</h2>

        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}></div>
            <h3>Automated Extraction</h3>
            <p>Extract vendor details, amounts, dates, and line items automatically from invoices with high accuracy.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}></div>
            <h3>Document Management</h3>
            <p>Centralize all your invoices and business documents in one secure, searchable repository.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}></div>
            <h3>AI Assistant</h3>
            <p>Ask questions about your documents and get instant answers from our intelligent assistant.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}></div>
            <h3>Workflow Integration</h3>
            <p>Seamlessly connect with your existing accounting and business systems.</p>
          </div>
        </div>
      </section>

      <section className={styles.benefits}>
        <h2>Why Choose Zoku?</h2>

        <div className={styles.benefitsList}>
          <div className={styles.benefitItem}>
            <h3>Save Time</h3>
            <p>Reduce manual data entry by up to 90%, freeing your team to focus on high-value tasks.</p>
          </div>

          <div className={styles.benefitItem}>
            <h3>Increase Accuracy</h3>
            <p>Minimize human error in document processing with our advanced machine learning algorithms.</p>
          </div>

          <div className={styles.benefitItem}>
            <h3>Gain Insights</h3>
            <p>Unlock valuable business intelligence from your documents with powerful analytics tools.</p>
          </div>

          <div className={styles.benefitItem}>
            <h3>Scale Effortlessly</h3>
            <p>Process thousands of documents as easily as you process ten, with no additional staffing needed.</p>
          </div>
        </div>
      </section>

      <section className={styles.getStarted}>
        <h2>Ready to Get Started?</h2>
        <p>Upload your first invoice and see the power of intelligent document processing in action.</p>
        <button className={styles.uploadButton} onClick={() => window.location.href = '/invoices'}>
          Upload Your First Invoice
        </button>
      </section>
    </div>
  );
};

export default Home;
