// LoginPage.jsx (with empty-field validation)
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
  Fade,
  LinearProgress,
} from "@mui/material";
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Business,
  ArrowForward,
  ErrorOutline,
} from "@mui/icons-material";

const LoginPage = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ identifier: "", password: "" });

  const { login, error, setError } = useLogin();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset field errors
    setFieldErrors({ identifier: "", password: "" });

    let hasError = false;
    if (!identifier.trim()) {
      setFieldErrors((prev) => ({ ...prev, identifier: "Email/username is required" }));
      hasError = true;
    }
    if (!password.trim()) {
      setFieldErrors((prev) => ({ ...prev, password: "Password is required" }));
      hasError = true;
    }

    if (hasError) return;

    setIsSubmitting(true);
    try {
      await login(identifier, password);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

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
            boxShadow:
              "0 20px 60px rgba(0, 0, 0, 0.1), 0 8px 25px rgba(0, 0, 0, 0.08)",
            border: "1px solid rgba(0, 0, 0, 0.06)",
            position: "relative",
          }}
        >
          {isSubmitting && (
            <LinearProgress
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1,
              }}
            />
          )}

          {/* Header */}
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
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Entertainment.FM CRM
            </Typography>
          </Box>

          {/* Form */}
          <CardContent sx={{ p: 4 }}>
            <Box component="form" onSubmit={handleSubmit}>
              {/* Backend error */}
              {error && (
                <Fade in={true}>
                  <Alert
                    severity="error"
                    sx={{
                      mb: 3,
                      borderRadius: 2,
                      animation: "shake 0.5s ease-in-out",
                    }}
                    icon={<ErrorOutline />}
                  >
                    {error || "Invalid email/username or password"}
                  </Alert>
                </Fade>
              )}

              {/* Identifier Field */}
              <TextField
                fullWidth
                name="identifier"
                label="Email or Username"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (error) setError("");
                  if (fieldErrors.identifier) {
                    setFieldErrors((prev) => ({ ...prev, identifier: "" }));
                  }
                }}
                error={!!fieldErrors.identifier}
                helpertext={fieldErrors.identifier}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: "#666" }} />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Password Field */}
              <TextField
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                  if (fieldErrors.password) {
                    setFieldErrors((prev) => ({ ...prev, password: "" }));
                  }
                }}
                error={!!fieldErrors.password}
                helpertext={fieldErrors.password}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: "#666" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={togglePasswordVisibility} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Submit */}
              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={isSubmitting}
                endIcon={isSubmitting ? null : <ArrowForward />}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%)",
                  fontSize: "1rem",
                  fontWeight: 600,
                  textTransform: "none",
                  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)",
                    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.3)",
                    transform: "translateY(-1px)",
                  },
                  "&:disabled": {
                    color: "rgba(255, 255, 255, 0.5)",
                  },
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                {isSubmitting ? "Signing In..." : "Login"}
              </Button>

              <Divider sx={{ my: 3, color: "#ccc" }} />

              <Box sx={{ textAlign: "center" }}>
                <Button variant="text" size="small" sx={{ color: "#666" }}>
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
            <Typography variant="caption" sx={{ color: "#999" }}>
              © 2025 CRM Portal
            </Typography>
          </Box>
        </Paper>
      </Container>

      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }
      `}</style>
    </Box>
  );
};

export default LoginPage;
