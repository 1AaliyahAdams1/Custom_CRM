import React from "react";
import { useLocation } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import Header from "./Header";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  const location = useLocation();
  const { currentTheme, getSpacing } = useSettings();
  
  const hideLayout = location.pathname === "/login";
  const user = localStorage.getItem("user");
  const showLayout = !hideLayout && user;

  return (
    <div 
      style={{ 
        display: 'flex', 
        minHeight: '100vh', 
        margin: 0, 
        padding: 0,
        backgroundColor: currentTheme.background.default,
        color: currentTheme.text.primary,
        transition: 'all 0.3s ease'
      }}
    >
      {showLayout && <Sidebar />}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {showLayout && <Header />}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: `${getSpacing(20)}px`,
            backgroundColor: currentTheme.background.default,
            margin: 0,
            transition: 'all 0.3s ease'
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;