import { useRouter } from "next/router";
import React from "react";
import styles from "./Dashboard.module.css";

const Dashboard: React.FC = () => {
  const router = useRouter();

  const navigateTo = (path: string) => {
    router.push(path);
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
          className={`${styles.navItem} ${styles.active}`}
          onClick={() => navigateTo("/upload")}
        >
          <div className={styles.icon}>
            <div className={styles.arrowUp}></div>
          </div>
          <span>Upload Documents</span>
        </div>
        <div className={styles.navItem}>
          <div className={styles.icon}>
            <div className={styles.box}></div>
          </div>
          <span>My Documents</span>
        </div>
        <div className={styles.navItem}>
          <div className={styles.icon}>
            <div className={styles.chat}></div>
          </div>
          <span>Chat Assistant</span>
        </div>
        <div className={styles.navItem}>
          <div className={styles.icon}>
            <div className={styles.cross}></div>
          </div>
          <span>Extractions</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Quick Stats */}
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

        {/* Recent Activity */}
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
