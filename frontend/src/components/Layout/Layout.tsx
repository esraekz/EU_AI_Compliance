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
          className={`${styles.navItem} ${
            router.pathname === "/dashboard" ? styles.active : ""
          }`}
          onClick={() => navigateTo("/dashboard")}
        >
          <div className={styles.icon}>
            <div className={styles.dashboardIcon}></div>
          </div>
          <span>Dashboard</span>
        </div>
        <div
          className={`${styles.navItem} ${
            router.pathname === "/upload" ? styles.active : ""
          }`}
          onClick={() => navigateTo("/upload")}
        >
          <div className={styles.icon}>
            <div className={styles.uploadIcon}></div>
          </div>
          <span>Upload Documents</span>
        </div>
        <div
          className={`${styles.navItem} ${
            router.pathname === "/documents" ? styles.active : ""
          }`}
          onClick={() => navigateTo("/documents")}
        >
          <div className={styles.icon}>
            <div className={styles.documentsIcon}></div>
          </div>
          <span>My Documents</span>
        </div>
        <div
          className={`${styles.navItem} ${
            router.pathname === "/chat" ? styles.active : ""
          }`}
          onClick={() => navigateTo("/chat")}
        >
          <div className={styles.icon}>
            <div className={styles.chatIcon}></div>
          </div>
          <span>Chat Assistant</span>
        </div>
        <div
          className={`${styles.navItem} ${
            router.pathname === "/extractions" ? styles.active : ""
          }`}
          onClick={() => navigateTo("/extractions")}
        >
          <div className={styles.icon}>
            <div className={styles.extractionsIcon}></div>
          </div>
          <span>Extractions</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>{children}</main>
    </div>
  );
};

export default Layout;
