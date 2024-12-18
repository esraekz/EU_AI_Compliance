import { useRouter } from "next/router";
import React from "react";
import styles from "./Layout.module.css";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();

  const navigateTo = (path: string) => {
    router.push(path);
  };

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div
          className={`${styles.navItem} ${router.pathname === "/dashboard" ? styles.active : ""}`}
          onClick={() => navigateTo("/dashboard")}
        >
          <span>Dashboard</span>
        </div>
        <div
          className={`${styles.navItem} ${router.pathname === "/upload" ? styles.active : ""}`}
          onClick={() => navigateTo("/upload")}
        >
          <span>Upload Documents</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>{children}</main>
    </div>
  );
};

export default Layout;
