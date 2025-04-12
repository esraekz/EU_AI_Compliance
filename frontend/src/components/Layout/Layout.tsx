import { useRouter } from "next/router";
import React from "react";
import styles from "./Layout.module.css";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();


  const navigateTo = (path: string) => {
    // Prevent navigating to the current path
    if (router.pathname !== path) {
      router.push(path);
    }
  };

  // Determine the page title based on the current route
  const getPageTitle = () => {
    switch (router.pathname) {
      case "/home":
        return "Home";
      case "/invoices":
        return "Invoices";
      case "/invoiceassistant":
        return "Invoice Assistant";
      default:
        return "Zoku";
    }
  };

  return (
    <div className={styles.layoutContainer}>
      {/* Top Banner */}
      <header className={styles.topBanner}>
        <div className={styles.logoSection}>
          <div className={styles.logo}>
            <span className={styles.z}>Z</span><span className={styles.oku}>OKU</span>
          </div>
        </div>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>{getPageTitle()}</h1>
        </div>
      </header>

      <div className={styles.mainWrapper}>
        {/* Slim Sidebar */}
        <aside className={styles.slimSidebar}>
          {/* Navigation */}
          <nav className={styles.nav}>
            <div
              className={`${styles.navItem} ${
                router.pathname === "/home" ? styles.active : ""
              }`}
              onClick={() => navigateTo("/home")}
            >
              <div className={styles.icon}>
                <div className={styles.homeIcon}></div>
              </div>
            </div>

            <div
              className={`${styles.navItem} ${
                router.pathname === "/invoices" ||
                router.pathname === "/upload" ||
                router.pathname === "/extractions"
                  ? styles.active
                  : ""
              }`}
              onClick={() => navigateTo("/invoices")}
            >
              <div className={styles.icon}>
                <div className={styles.invoicesIcon}></div>
              </div>
            </div>

            <div
              className={`${styles.navItem} ${
                router.pathname === "/invoiceassistant" ? styles.active : ""
              }`}
              onClick={() => navigateTo("/invoiceassistant")}
            >
              <div className={styles.icon}>
                <div className={styles.assistantIcon}></div>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
