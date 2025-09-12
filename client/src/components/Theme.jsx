import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#050505',
      contrastText: '#fafafa',
    },
    secondary: {
      main: '#666666',
      contrastText: '#ffffff',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    text: {
      primary: '#050505',
      secondary: '#666666',
    },
    divider: '#e5e5e5',
    error: {
      main: '#ff4444',
      contrastText: '#ffffff',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          border: '1px solid #e5e5e5',
          borderRadius: '8px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#ffffff',
            '& fieldset': { borderColor: '#e5e5e5' },
            '&:hover fieldset': { borderColor: '#cccccc' },
            '&.Mui-focused fieldset': { borderColor: '#050505' },
            '&.Mui-error fieldset': { 
              borderColor: '#ff4444',
              borderWidth: '2px',
            },
          },
          '& .Mui-error': {
            '& .MuiSvgIcon-root': {
              color: '#ff4444',
            },
            '& .MuiFormhelpertext-root': {
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
          borderColor: '#e5e5e5',
          color: '#050505',
          '&:hover': {
            borderColor: '#cccccc',
            backgroundColor: '#f5f5f5',
          },
        },
        contained: {               
          backgroundColor: '#050505',
          color: '#fafafa',
          '&:hover': {
            backgroundColor: '#333333',
          },
          '&:disabled': {
            backgroundColor: '#cccccc',
            color: '#666666',
          },
        },
      },
    },
    MuiFormhelpertext: {
      styleOverrides: {
        root: {
          marginLeft: '0',
        },
      },
    },
  },
});

export default theme;
