import { createTheme } from "@mui/material/styles";

// Function to create theme based on mode
export const createAppTheme = (mode = 'light') => {
  const isLight = mode === 'light';
  
  return createTheme({
    palette: {
      mode: mode,
      primary: {
        main: isLight ? '#050505' : '#fafafa',
        contrastText: isLight ? '#fafafa' : '#050505',
        dark: isLight ? '#333333' : '#cccccc',
      },
      secondary: {
        main: isLight ? '#666666' : '#999999',
        contrastText: '#ffffff',
      },
      background: {
        default: isLight ? '#fafafa' : '#121212',
        paper: isLight ? '#ffffff' : '#1e1e1e',
      },
      text: {
        primary: isLight ? '#050505' : '#fafafa',
        secondary: isLight ? '#666666' : '#b0b0b0',
      },
      divider: isLight ? '#e5e5e5' : '#333333',
      error: {
        main: '#ff4444',
        contrastText: '#ffffff',
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            // Hide scrollbar for Chrome, Safari and Opera
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            // Hide scrollbar for IE, Edge and Firefox
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          },
          // Also hide scrollbar for any scrollable element
          '*::-webkit-scrollbar': {
            display: 'none',
          },
          '*': {
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            border: isLight ? '1px solid #e5e5e5' : '1px solid #333333',
            borderRadius: '8px',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: isLight ? '#ffffff' : '#1e1e1e',
              '& fieldset': { 
                borderColor: isLight ? '#e5e5e5' : '#333333' 
              },
              '&:hover fieldset': { 
                borderColor: isLight ? '#cccccc' : '#555555' 
              },
              '&.Mui-focused fieldset': { 
                borderColor: isLight ? '#050505' : '#fafafa' 
              },
              '&.Mui-error fieldset': { 
                borderColor: '#ff4444',
                borderWidth: '2px',
              },
            },
            '& .Mui-error': {
              '& .MuiSvgIcon-root': {
                color: '#ff4444',
              },
              '& .MuiFormHelperText-root': {
                color: '#ff4444',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginLeft: '0',
              },
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            '&.Mui-error': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#ff4444',
                borderWidth: '2px',
              },
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          outlined: {
            borderColor: isLight ? '#e5e5e5' : '#333333',
            color: isLight ? '#050505' : '#fafafa',
            '&:hover': {
              borderColor: isLight ? '#cccccc' : '#555555',
              backgroundColor: isLight ? '#f5f5f5' : '#2a2a2a',
            },
          },
          contained: {               
            backgroundColor: isLight ? '#050505' : '#fafafa',
            color: isLight ? '#fafafa' : '#050505',
            '&:hover': {
              backgroundColor: isLight ? '#333333' : '#cccccc',
            },
            '&:disabled': {
              backgroundColor: isLight ? '#cccccc' : '#444444',
              color: isLight ? '#666666' : '#888888',
            },
          },
        },
      },
      MuiFormHelperText: {
        styleOverrides: {
          root: {
            marginLeft: '0',
          },
        },
      },
    },
  });
};

export default createAppTheme('light');