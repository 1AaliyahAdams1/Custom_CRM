import React, { useState } from "react";
import useLogin from "../utils/auth/useLogin";
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  Container,
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
        height: "100vh",
        width: "100vw",
        display: "flex",
        position: "fixed",
        top: 0,
        left: 0,
        overflow: "hidden",
      }}
    >
      {/* Left Side - Diagonal Wave Background */}
      <Box
        sx={{
          flex: { xs: 1, md: 1 },
          width: { xs: "100%", md: "50%" },
          height: "100%",
          position: "relative",
          display: { xs: "none", md: "flex" },
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          background: "#000000",
        }}
      >
        {/* Animated Diagonal Wave Layers */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
          }}
        >
          {/* Diagonal Wave 1 - Top */}
          <svg
            style={{
              position: "absolute",
              width: "150%",
              height: "150%",
              top: "-25%",
              left: "-25%",
              transform: "rotate(-35deg)",
              opacity: 0.15,
              animation: "wave1 16s ease-in-out infinite",
            }}
            viewBox="0 0 1440 800"
            preserveAspectRatio="none"
          >
            <path
              fill="#ffffff"
              d="M0,0 L1440,0 L1440,200 C1120,250 840,150 720,200 C600,250 320,150 0,200 Z"
            />
          </svg>

          {/* Diagonal Wave 2 */}
          <svg
            style={{
              position: "absolute",
              width: "150%",
              height: "150%",
              top: "-25%",
              left: "-25%",
              transform: "rotate(-35deg)",
              opacity: 1,
              animation: "wave2 14s ease-in-out infinite",
            }}
            viewBox="0 0 1440 800"
            preserveAspectRatio="none"
          >
            <path
              fill="#1a1a1a"
              d="M0,400 C320,300 420,500 720,400 C1020,300 1120,500 1440,400 L1440,800 L0,800 Z"
            />
          </svg>

          {/* Diagonal Wave 3 */}
          <svg
            style={{
              position: "absolute",
              width: "160%",
              height: "160%",
              top: "-30%",
              left: "-30%",
              transform: "rotate(-35deg)",
              opacity: 0.12,
              animation: "wave3 18s ease-in-out infinite reverse",
            }}
            viewBox="0 0 1440 800"
            preserveAspectRatio="none"
          >
            <path
              fill="#ffffff"
              d="M0,500 C360,400 540,600 720,500 C900,400 1080,600 1440,500 L1440,800 L0,800 Z"
            />
          </svg>

          {/* Diagonal Wave 4 */}
          <svg
            style={{
              position: "absolute",
              width: "180%",
              height: "180%",
              top: "-40%",
              left: "-40%",
              transform: "rotate(-35deg)",
              opacity: 0.08,
              animation: "wave4 20s ease-in-out infinite",
            }}
            viewBox="0 0 1440 800"
            preserveAspectRatio="none"
          >
            <path
              fill="#ffffff"
              d="M0,300 C400,200 600,400 720,350 C840,300 1040,450 1440,350 L1440,800 L0,800 Z"
            />
          </svg>

          {/* Diagonal Wave 5 - Bottom */}
          <svg
            style={{
              position: "absolute",
              width: "170%",
              height: "170%",
              top: "-35%",
              left: "-35%",
              transform: "rotate(-35deg)",
              opacity: 0.6,
              animation: "wave5 15s ease-in-out infinite reverse",
            }}
            viewBox="0 0 1440 800"
            preserveAspectRatio="none"
          >
            <path
              fill="#0a0a0a"
              d="M0,650 C360,600 480,700 720,650 C960,600 1080,700 1440,650 L1440,800 L0,800 Z"
            />
          </svg>
        </Box>

        {/* Floating light overlays */}
        <Box
          sx={{
            position: "absolute",
            top: "10%",
            left: "20%",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
            animation: "float 12s ease-in-out infinite",
            filter: "blur(60px)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: "15%",
            right: "10%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)",
            animation: "float 18s ease-in-out infinite reverse",
            filter: "blur(80px)",
          }}
        />

        {/* Logo and text */}
        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            textAlign: "center",
            px: 6,
          }}
        >
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)",
              mb: 4,
              boxShadow:
                "0 20px 60px rgba(255, 255, 255, 0.2), 0 0 40px rgba(255, 255, 255, 0.1)",
              animation: "pulse 3s ease-in-out infinite",
            }}
          >
            <Business sx={{ fontSize: 60, color: "#000" }} />
          </Box>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              mb: 2,
              color: "#ffffff",
              textShadow: "0 4px 30px rgba(255, 255, 255, 0.3)",
              letterSpacing: "-0.02em",
            }}
          >
            Entertainment.FM
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              fontWeight: 300,
              letterSpacing: "0.15em",
              mb: 4,
            }}
          >
            CUSTOMER RELATIONSHIP MANAGEMENT
          </Typography>
          <Box
            sx={{
              width: "80px",
              height: "2px",
              background: "linear-gradient(90deg, transparent, #ffffff, transparent)",
              margin: "0 auto",
            }}
          />
        </Box>
      </Box>

      {/* Right Side - Login Form */}
      <Box
        sx={{
          flex: { xs: 1, md: 1 },
          width: { xs: "100%", md: "50%" },
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          position: "relative",
          padding: 3,
          overflowY: "auto",
        }}
      >
        <Container maxWidth="sm">
          <Box sx={{ width: "100%", maxWidth: "480px", margin: "0 auto" }}>
            {isSubmitting && (
              <LinearProgress
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  zIndex: 1,
                  background: "rgba(0, 0, 0, 0.05)",
                  "& .MuiLinearProgress-bar": {
                    background: "linear-gradient(90deg, #000000, #333333, #000000)",
                  },
                }}
              />
            )}

            {/* Header */}
            <Box sx={{ mb: 5, textAlign: "center" }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  mb: 1,
                  color: "#000000",
                  letterSpacing: "-0.01em",
                }}
              >
                Welcome Back
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "#666666", fontWeight: 400 }}
              >
                Sign in to your account
              </Typography>
            </Box>

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit}>
              {error && (
                <Fade in={true}>
                  <Alert
                    severity="error"
                    sx={{
                      mb: 3,
                      borderRadius: 2,
                      background: "#000000",
                      color: "#ffffff",
                      border: "1px solid #333333",
                      "& .MuiAlert-icon": { color: "#ffffff" },
                      animation: "slideIn 0.3s ease-out",
                    }}
                    icon={<ErrorOutline />}
                  >
                    {error || "Invalid email/username or password"}
                  </Alert>
                </Fade>
              )}

              {/* Identifier */}
              <TextField
                fullWidth
                name="identifier"
                label="Email or Username"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (error) setError("");
                  if (fieldErrors.identifier)
                    setFieldErrors((p) => ({ ...p, identifier: "" }));
                }}
                error={!!fieldErrors.identifier}
                helperText={fieldErrors.identifier}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: "#333333" }} />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Password */}
              <TextField
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                  if (fieldErrors.password)
                    setFieldErrors((p) => ({ ...p, password: "" }));
                }}
                error={!!fieldErrors.password}
                helperText={fieldErrors.password}
                sx={{ mb: 4 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: "#333333" }} />
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
                  py: 2,
                  borderRadius: 2,
                  background: "#000000",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  textTransform: "none",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
                  position: "relative",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: "-100%",
                    width: "100%",
                    height: "100%",
                    background:
                      "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
                    transition: "left 0.5s",
                  },
                  "&:hover": {
                    background: "#1a1a1a",
                    boxShadow: "0 15px 40px rgba(0, 0, 0, 0.4)",
                    transform: "translateY(-3px)",
                    "&::before": { left: "100%" },
                  },
                  "&:disabled": {
                    background: "#cccccc",
                    color: "rgba(0, 0, 0, 0.5)",
                  },
                }}
              >
                {isSubmitting ? "Signing In..." : "Login"}
              </Button>

              <Box sx={{ mt: 3, textAlign: "center" }}>
                <Button
                  variant="text"
                  size="small"
                  sx={{
                    color: "#666666",
                    fontWeight: 500,
                    "&:hover": {
                      color: "#000000",
                      background: "rgba(0, 0, 0, 0.05)",
                    },
                  }}
                >
                  Forgot your password?
                </Button>
              </Box>
            </Box>

            {/* Footer */}
            <Box sx={{ mt: 6, textAlign: "center" }}>
              <Typography variant="caption" sx={{ color: "#999999" }}>
                © 2025 CRM Portal
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Animations */}
      <style jsx>{`
        @keyframes wave1 {
          0%, 100% { transform: rotate(-35deg) translateY(0); }
          50% { transform: rotate(-35deg) translateY(20px); }
        }
        @keyframes wave2 {
          0%, 100% { transform: rotate(-35deg) translateY(0); }
          50% { transform: rotate(-35deg) translateY(-30px); }
        }
        @keyframes wave3 {
          0%, 100% { transform: rotate(-35deg) translateY(0); }
          50% { transform: rotate(-35deg) translateY(20px); }
        }
        @keyframes wave4 {
          0%, 100% { transform: rotate(-35deg) translateY(0); }
          50% { transform: rotate(-35deg) translateY(-40px); }
        }
        @keyframes wave5 {
          0%, 100% { transform: rotate(-35deg) translateY(0); }
          50% { transform: rotate(-35deg) translateY(-25px); }
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -20px) scale(1.05); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Box>
  );
};

export default LoginPage;