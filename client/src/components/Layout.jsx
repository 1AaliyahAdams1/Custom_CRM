import React from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  const location = useLocation();
  const hideLayout = location.pathname === "/login";
  const user = localStorage.getItem("user");
  const showLayout = !hideLayout && user;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {showLayout && <Sidebar />}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {showLayout && <Header />}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            backgroundColor: '#fafafa',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
