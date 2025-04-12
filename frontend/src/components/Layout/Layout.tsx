import { useRouter } from "next/router";
import React, { useState } from "react";
import styles from "./Layout.module.css";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

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
      case "/assistant":
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
          {router.pathname === "/invoices" && (
            <button
              className={styles.uploadButton}
              onClick={() => navigateTo('/upload')}
            >
              Upload Invoice
            </button>
          )}
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
              onMouseEnter={() => setShowTooltip("home")}
              onMouseLeave={() => setShowTooltip(null)}
            >
              <div className={styles.icon}>
                <div className={styles.homeIcon}></div>
              </div>
              {showTooltip === "home" && (
                <div className={styles.tooltip}>Home</div>
              )}
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
              onMouseEnter={() => setShowTooltip("invoices")}
              onMouseLeave={() => setShowTooltip(null)}
            >
              <div className={styles.icon}>
                <div className={styles.invoicesIcon}></div>
              </div>
              {showTooltip === "invoices" && (
                <div className={styles.tooltip}>Invoices</div>
              )}
            </div>

            <div
              className={`${styles.navItem} ${
                router.pathname === "/assistant" ? styles.active : ""
              }`}
              onClick={() => navigateTo("/assistant")}
              onMouseEnter={() => setShowTooltip("assistant")}
              onMouseLeave={() => setShowTooltip(null)}
            >
              <div className={styles.icon}>
                <div className={styles.assistantIcon}></div>
              </div>
              {showTooltip === "assistant" && (
                <div className={styles.tooltip}>Invoice Assistant</div>
              )}
            </div>
          </nav>

          {/* User Profile at Bottom */}
          <div className={styles.profileContainer}>
            <div
              className={styles.profileIcon}
              onMouseEnter={() => setShowTooltip("profile")}
              onMouseLeave={() => setShowTooltip(null)}
            >
              <img
                src="/profile-placeholder.jpg"
                alt="Profile"
                className={styles.avatar}
              />
              {showTooltip === "profile" && (
                <div className={styles.tooltip}>Profile</div>
              )}
            </div>
          </div>
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
