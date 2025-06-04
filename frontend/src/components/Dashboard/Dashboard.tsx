// Complete Debug Dashboard.tsx
import { useRouter } from "next/router";
import React from "react";
import styles from "./Dashboard.module.css";

const Dashboard: React.FC = () => {
  const router = useRouter();

  const navigateTo = (path: string) => {
    console.log('Navigating to:', path); // Debug log
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

      {/* Sidebar - FULL DEBUG VERSION */}
      <aside className={styles.sidebar}>

        {/* Test Item 1 - Should always be visible */}
        <div style={{
          padding: '15px 20px',
          backgroundColor: 'blue',
          color: 'white',
          margin: '5px',
          border: '2px solid white'
        }}>
          TEST 1 - BLUE
        </div>

        {/* Original Upload Documents */}
        <div
          className={`${styles.navItem} ${isActive("/upload") ? styles.active : ""}`}
          onClick={() => navigateTo("/upload")}
        >
          <div className={styles.icon}>
            <div className={styles.arrowUp}></div>
          </div>
          <span>Upload Documents</span>
        </div>

        {/* Test Item 2 - Between original items */}
        <div style={{
          padding: '15px 20px',
          backgroundColor: 'green',
          color: 'white',
          margin: '5px',
          border: '2px solid white'
        }}>
          TEST 2 - GREEN
        </div>

        {/* Original My Documents */}
        <div
          className={`${styles.navItem} ${isActive("/invoices") ? styles.active : ""}`}
          onClick={() => navigateTo("/invoices")}
        >
          <div className={styles.icon}>
            <div className={styles.box}></div>
          </div>
          <span>My Documents</span>
        </div>

        {/* Test Item 3 - Red Prompt Optimizer */}
        <div
          style={{
            padding: '15px 20px',
            backgroundColor: 'red',
            color: 'yellow',
            margin: '5px',
            border: '3px solid lime',
            cursor: 'pointer'
          }}
          onClick={() => navigateTo("/eu_act/prompt-optimizer")}
        >
          🔴 PROMPT OPTIMIZER CLICK ME
        </div>

        {/* Original Chat */}
        <div
          className={`${styles.navItem} ${isActive("/chat") ? styles.active : ""}`}
          onClick={() => navigateTo("/chat")}
        >
          <div className={styles.icon}>
            <div className={styles.chat}></div>
          </div>
          <span>Chat Assistant</span>
        </div>

        {/* Test Item 4 - Bottom test */}
        <div style={{
          padding: '15px 20px',
          backgroundColor: 'purple',
          color: 'white',
          margin: '5px',
          border: '2px solid white'
        }}>
          TEST 4 - PURPLE
        </div>

        {/* Original Extractions */}
        <div className={styles.navItem}>
          <div className={styles.icon}>
            <div className={styles.cross}></div>
          </div>
          <span>Extractions</span>
        </div>

      </aside>

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
