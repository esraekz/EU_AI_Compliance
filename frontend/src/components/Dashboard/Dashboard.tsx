// Corrected Dashboard.tsx
import { useRouter } from "next/router";
import React from "react";
import styles from "./Dashboard.module.css";

const Dashboard: React.FC = () => {
  const router = useRouter();

  const navigateTo = (path: string) => {
    router.push(path);
  };

  // Helper function to check if current route is active
  const isActive = (path: string) => {
    return router.pathname === path;
  };

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <header className={styles.header}>
        <h1>Document Management Dashboard</h1>
      </header>

      {/* Sidebar */}
      <aside className={styles.sidebar}>
        {/* Navigation */}
        <div
          className={`${styles.navItem} ${isActive("/upload") ? styles.active : ""}`}
          onClick={() => navigateTo("/upload")}
        >
          <div className={styles.icon}>
            <div className={styles.arrowUp}></div>
          </div>
          <span>Upload Documents</span>
        </div>

        <div
          className={`${styles.navItem} ${isActive("/invoices") ? styles.active : ""}`}
          onClick={() => navigateTo("/invoices")}
        >
          <div className={styles.icon}>
            <div className={styles.box}></div>
          </div>
          <span>My Documents</span>
        </div>

        <div
          className={`${styles.navItem} ${isActive("/chat") ? styles.active : ""}`}
          onClick={() => navigateTo("/chat")}
        >
          <div className={styles.icon}>
            <div className={styles.chat}></div>
          </div>
          <span>Chat Assistant</span>
        </div>

        {/* TEMPORARY DEBUG: Prompt Optimizer Navigation Item */}
        <div
          className={styles.navItem}
          onClick={() => navigateTo("/eu_act/prompt-optimizer")}
          style={{
            backgroundColor: 'red !important',
            color: 'yellow !important',
            border: '3px solid lime !important',
            margin: '10px 0 !important'
          }}
        >
          <div className={styles.icon}>
            <div style={{
              width: '15px',
              height: '15px',
              backgroundColor: 'yellow',
              borderRadius: '50%'
            }}></div>
          </div>
          <span style={{ color: 'yellow', fontWeight: 'bold' }}>
            🔴 PROMPT OPTIMIZER
          </span>
        </div>

        <div className={styles.navItem}>
          <div className={styles.icon}>
            <div className={styles.cross}></div>
          </div>
          <span>Extractions</span>
        </div>
      </aside>


      {/* ADD THE DEBUG ITEM HERE - AFTER Extractions */}
      <div
        className={styles.navItem}
        onClick={() => navigateTo("/eu_act/prompt-optimizer")}
        style={{
          backgroundColor: 'red !important',
          color: 'yellow !important',
          border: '3px solid lime !important',
          margin: '10px 0 !important'
        }}
      >
        <div className={styles.icon}>
          <div style={{
            width: '15px',
            height: '15px',
            backgroundColor: 'yellow',
            borderRadius: '50%'
          }}></div>
        </div>
        <span style={{ color: 'yellow', fontWeight: 'bold' }}>
          🔴 PROMPT OPTIMIZER
        </span>
      </div>


      {/* Main Content */}
      <main className={styles.mainContent}>
        <section className={styles.stats}>
          <div className={styles.statBox}>
            <p>Total Documents</p>
            <h2>24</h2>
          </div>
          <div className={styles.statBox}>
            <p>Recent Extractions</p>
            <h2>12</h2>
          </div>
        </section>

        <section className={styles.recentActivity}>
          <h3>Recent Activity</h3>
          <div className={styles.activityList}>
            <div className={styles.activityItem}>
              <p>Document uploaded: Contract.pdf</p>
              <small>2 minutes ago</small>
            </div>
            <div className={styles.activityItem}>
              <p>Extraction completed: Invoice.pdf</p>
              <small>15 minutes ago</small>
            </div>
            <div className={styles.activityItem}>
              <p>Chat session: Analysis of Report.pdf</p>
              <small>1 hour ago</small>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
