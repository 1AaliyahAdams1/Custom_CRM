//COMPONENT: Navigation/Sidebar

//IMPORTS
import React from "react";
import { Link } from "react-router-dom";

// Sidebar component renders a vertical navigation menu with links to app pages
const Sidebar = () => {
  return (
    // Semantic aside element for sidebar navigation
    <aside style={styles.sidebar}>
      <nav>
        {/* Unordered list for navigation items */}
        <ul style={styles.ul}>
          {/* Each list item contains a React Router Link for SPA navigation */}
          <li><Link to="/dashboard" style={styles.link}>Dashboard</Link></li>
          <li><Link to="/accounts" style={styles.link}>Accounts</Link></li>
          <li><Link to="/contacts" style={styles.link}>Contacts</Link></li>
          <li><Link to="/deals" style={styles.link}>Deals</Link></li>
          <li><Link to="/activities" style={styles.link}>Activities</Link></li>
          <li><Link to="/" style={styles.link}>Logout</Link></li>
        </ul>
      </nav>
    </aside>
  );
};

// Inline styles object to style the sidebar and links
const styles = {
  sidebar: {
    width: "200px",              // Fixed width for sidebar
    backgroundColor: "#eeeeee",  // Light gray background
    height: "100vh",             // Full viewport height
    padding: "20px 0",           // Vertical padding top and bottom
    boxSizing: "border-box",     // Include padding in element's width and height
    position: "fixed",           // Fix sidebar to viewport
    top: "60px",                 // Position below a fixed header of height 60px
    left: 0,                    // Stick to the left edge
  },
  ul: {
    listStyle: "none",           // Remove bullet points
    padding: 0,                  // Remove default padding
    margin: 0,                   // Remove default margin
  },
  link: {
    display: "block",            // Make link fill the container width
    padding: "10px 20px",        // Spacing inside each link
    textDecoration: "none",      // Remove underline
    color: "#333",               // Dark gray text color
  },
};

export default Sidebar;
