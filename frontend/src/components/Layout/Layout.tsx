// src/components/Layout/Layout.tsx - Updated with Prompt Library
import { useRouter } from "next/router";
import React, { useState } from "react";
import styles from "./Layout.module.css";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Check if current path is in specific sections
  const isInvoicesSection = router.pathname.startsWith('/invoices');
  const isPromptOptimizerSection = router.pathname.startsWith('/eu_act/prompt-optimizer');
  const isPromptLibrarySection = router.pathname.startsWith('/eu_act/prompt-library'); // NEW

  const navigateTo = (path: string) => {
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
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>
            {isPromptOptimizerSection
              ? 'AI Governance & Compliance'
              : isPromptLibrarySection
                ? 'Prompt Library & Templates'  // NEW: Library header
                : 'Document Processing'
            }
          </h1>
          <button className={styles.uploadButton}>
            Upload Document
          </button>
        </div>
      </header>

      <div className={styles.mainWrapper}>
        {/* Slim Sidebar */}
        <aside className={styles.slimSidebar}>
          <nav className={styles.nav}>
            {/* Home/Dashboard */}
            <div
              className={`${styles.navItem} ${router.pathname === "/home" ? styles.active : ""
                }`}
              onClick={() => navigateTo("/home")}
              onMouseEnter={() => setHoveredItem('home')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className={styles.icon}>
                <div className={styles.homeIcon}></div>
              </div>
              {hoveredItem === 'home' && (
                <div className={styles.tooltip}>Dashboard</div>
              )}
            </div>

            {/* My Documents */}
            <div
              className={`${styles.navItem} ${isInvoicesSection ? styles.active : ""
                }`}
              onClick={() => navigateTo("/invoices")}
              onMouseEnter={() => setHoveredItem('documents')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className={styles.icon}>
                <div className={styles.invoicesIcon}></div>
              </div>
              {hoveredItem === 'documents' && (
                <div className={styles.tooltip}>My Documents</div>
              )}
            </div>

            {/* Prompt Optimizer */}
            <div
              className={`${styles.navItem} ${isPromptOptimizerSection ? styles.active : ""
                }`}
              onClick={() => navigateTo("/eu_act/prompt-optimizer")}
              onMouseEnter={() => setHoveredItem('promptOptimizer')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className={styles.icon}>
                <div className={styles.promptOptimizerIcon}></div>
              </div>
              {hoveredItem === 'promptOptimizer' && (
                <div className={styles.tooltip}>Prompt Optimizer</div>
              )}
            </div>

            {/* NEW: Prompt Library */}
            <div
              className={`${styles.navItem} ${isPromptLibrarySection ? styles.active : ""
                }`}
              onClick={() => navigateTo("/eu_act/prompt-library")}
              onMouseEnter={() => setHoveredItem('promptLibrary')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className={styles.icon}>
                <div className={styles.promptLibraryIcon}></div>
              </div>
              {hoveredItem === 'promptLibrary' && (
                <div className={styles.tooltip}>Prompt Library</div>
              )}
            </div>

            {/* Chat Assistant */}
            <div
              className={`${styles.navItem} ${router.pathname === "/invoiceassistant" ? styles.active : ""
                }`}
              onClick={() => navigateTo("/invoiceassistant")}
              onMouseEnter={() => setHoveredItem('assistant')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className={styles.icon}>
                <div className={styles.assistantIcon}></div>
              </div>
              {hoveredItem === 'assistant' && (
                <div className={styles.tooltip}>Chat Assistant</div>
              )}
            </div>
            {/* AI Risk Assessment */}
            <div
              className={`${styles.navItem} ${router.pathname.startsWith('/eu_act/risk-assessment') ? styles.active : ""}`}
              onClick={() => navigateTo("/eu_act/risk-assessment")}
              onMouseEnter={() => setHoveredItem('riskAssessment')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className={styles.icon}>
                <div className={styles.riskAssessmentIcon}></div>
              </div>
              {hoveredItem === 'riskAssessment' && (
                <div className={styles.tooltip}>AI Risk Assessment</div>
              )}
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
