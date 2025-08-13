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
    <>
      {showLayout && <Header />}
      {showLayout && <Sidebar />}
      <main
        style={{
          marginLeft: showLayout ? "40px" : 0,
          marginRight: showLayout ? "40px" : 0,
          marginTop: showLayout ? "40px" : 0,
          padding: "20px",
        }}
      >
        {children}
      </main>
    </>
  );
};

export default Layout;
