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
        <nav>
          <div
            className={`${styles.navItem} ${styles.active}`}
            onClick={() => navigateTo("/upload")}
          >
            <div className={styles.icon}>
              <div className={styles.arrowUp}></div>
            </div>
            <span>Upload Documents</span>
          </div>
          {/* Other navigation items */}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Dashboard content */}
      </main>
    </div>
  );
};

export default Dashboard;
