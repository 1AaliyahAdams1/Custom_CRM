//COMPONENT : Header bar

//IMPORTS
import React from "react";

// Simple header component displaying the app title with styling
const Header = () => {
  return (
    // Semantic header element with inline styles applied
    <header style={styles.header}>
      {/* Main title of the CRM app */}
      <h1 style={styles.title}>Entertainment.FM CRM</h1>
    </header>
  );
};

// Inline styles object to style the header and title elements
const styles = {
  header: {
    height: "60px",                 // Fixed height for the header bar
    // backgroundColor: "#0d47a1", 
    backgroundColor: "black",    // Dark blue background color
    color: "#fff",                 // White text color
    display: "flex",               // Flexbox to align content
    alignItems: "center",          // Vertically center the text
    padding: "0 20px",             // Horizontal padding inside header
  },
  title: {
    margin: 0,                    // Remove default margin on h1
    fontSize: "20px",             // Font size for the title text
  },
};

export default Header;
