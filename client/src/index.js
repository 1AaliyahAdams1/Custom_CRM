import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// import { ThemeProvider, createTheme } from '@mui/material/styles';
// import CssBaseline from '@mui/material/CssBaseline';

import { registerLicense } from '@syncfusion/ej2-base';

// Import Syncfusion CSS themes
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-react-buttons/styles/material.css';
import '@syncfusion/ej2-react-inputs/styles/material.css';
import '@syncfusion/ej2-react-dropdowns/styles/material.css';
import '@syncfusion/ej2-react-grids/styles/material.css';
import '@syncfusion/ej2-react-schedule/styles/material.css';
import '@syncfusion/ej2-react-layouts/styles/material.css';
import '@syncfusion/ej2-react-popups/styles/material.css';
import '@syncfusion/ej2-react-notifications/styles/material.css';
//import '@syncfusion/ej2-react-progressbar/styles/material.css'; why is this one giving issues???

//const theme = createTheme();

// Registering Syncfusion license key from .env
registerLicense(process.env.REACT_APP_LICENSE);

const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     <ThemeProvider theme={theme}>
//       <CssBaseline />
//       <App />
//     </ThemeProvider>
//   </React.StrictMode>
// );
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
