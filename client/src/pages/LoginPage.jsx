import React, { useState } from "react";
import useLogin from "../utils/auth/useLogin";
import {
  Box,
  CardContent,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  Divider,
  Container,
  Paper,
  Alert,
} from "@mui/material";
import { Email, Lock, Visibility, VisibilityOff, Business, ArrowForward } from "@mui/icons-material";

const LoginPage = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const { login, error, setError } = useLogin();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    await login(identifier, password);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)",
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: 0,
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1), 0 8px 25px rgba(0, 0, 0, 0.08)",
            border: "1px solid rgba(0, 0, 0, 0.06)",
          }}
        >
          <Box
            sx={{
              background: "linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%)",
              p: 4,
              textAlign: "center",
              color: "white",
            }}
          >
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                mb: 2,
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <Business sx={{ fontSize: 32, color: "white" }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, fontSize: { xs: "1.75rem", sm: "2rem" } }}>
              Entertainment.FM CRM
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            <Box component="form" onSubmit={handleSubmit}>
              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              <TextField
                fullWidth
                name="identifier"
                label="Email or Username"
                type="text"
                variant="outlined"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "#fafafa",
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                    },
                    "&.Mui-focused": {
                      backgroundColor: "white",
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: "#666" }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "#fafafa",
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                    },
                    "&.Mui-focused": {
                      backgroundColor: "white",
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: "#666" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={togglePasswordVisibility} edge="end" sx={{ color: "#666" }}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%)",
                  fontSize: "1rem",
                  fontWeight: 600,
                  textTransform: "none",
                  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)",
                    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.3)",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                Login
              </Button>

              <Divider sx={{ my: 3, color: "#ccc" }}></Divider>

              <Box sx={{ textAlign: "center" }}>
                <Button
                  variant="text"
                  size="small"
                  sx={{
                    color: "#666",
                    textTransform: "none",
                    fontSize: "0.875rem",
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                      color: "#2c2c2c",
                    },
                  }}
                >
                  Forgot your password?
                </Button>
              </Box>
            </Box>
          </CardContent>

          <Box
            sx={{
              p: 2,
              backgroundColor: "#fafafa",
              borderTop: "1px solid rgba(0, 0, 0, 0.06)",
              textAlign: "center",
            }}
          >
            <Typography variant="caption" sx={{ color: "#999", fontSize: "0.75rem" }}>
              © 2025 CRM Portal
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
