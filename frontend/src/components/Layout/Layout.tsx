import { useRouter } from "next/router";
import React from "react";
import styles from "./Layout.module.css";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();


  const navigateTo = (path: string) => {
    // Only navigate if we're not already on this path
    // Use asPath to get the actual URL including query parameters
    const currentPath = router.asPath.split('?')[0];
    if (currentPath !== path) {
      router.push(path);
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
