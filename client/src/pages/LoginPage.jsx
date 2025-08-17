// Enhanced LoginPage.jsx with live validation + fixed server error handling
import React, { useState, useEffect } from "react";
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
  CheckCircle,
  ErrorOutline,
} from "@mui/icons-material";

// Validation utility functions
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validateUsername = (username) => /^[a-zA-Z0-9_-]{3,}$/.test(username); // min 3 chars, letters/numbers/_/-

const isEmail = (identifier) => identifier.includes("@");

const validateIdentifier = (identifier) => {
  if (!identifier || identifier.trim().length === 0) {
    return { isValid: false, message: "Email or username is required" };
  }
  if (identifier.length < 3) {
    return { isValid: false, message: "Must be at least 3 characters long" };
  }
  if (isEmail(identifier)) {
    if (!validateEmail(identifier)) {
      return { isValid: false, message: "Please enter a valid email address" };
    }
  } else {
    if (!validateUsername(identifier)) {
      return {
        isValid: false,
        message:
          "Username can only contain letters, numbers, hyphens, and underscores",
      };
    }
  }
  return { isValid: true, message: "" };
};

const validatePassword = (password) => {
  if (!password || password.length === 0) {
    return { isValid: false, message: "Password is required" };
  }
  if (password.length < 6) {
    return {
      isValid: false,
      message: "Password must be at least 6 characters long",
    };
  }
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);

  if (password.length >= 8 && hasUpperCase && hasLowerCase && hasNumbers) {
    return { isValid: true, message: "Strong password", strength: "strong" };
  } else if (password.length >= 6) {
    return { isValid: true, message: "Password accepted", strength: "medium" };
  }
  return { isValid: true, message: "" };
};

const LoginPage = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation states
  const [identifierValidation, setIdentifierValidation] = useState({
    isValid: null,
    message: "",
    touched: false,
  });
  const [passwordValidation, setPasswordValidation] = useState({
    isValid: null,
    message: "",
    strength: null,
    touched: false,
  });
  const [formTouched, setFormTouched] = useState(false);

  const { login, error, setError } = useLogin();

  // Live validation for identifier
  useEffect(() => {
    if (identifierValidation.touched) {
      const validation = validateIdentifier(identifier);
      setIdentifierValidation((prev) => ({
        ...prev,
        isValid: validation.isValid,
        message: validation.message,
      }));
    }
  }, [identifier, identifierValidation.touched]);

  // Live validation for password
  useEffect(() => {
    if (passwordValidation.touched) {
      const validation = validatePassword(password);
      setPasswordValidation((prev) => ({
        ...prev,
        isValid: validation.isValid,
        message: validation.message,
        strength: validation.strength,
      }));
    }
  }, [password, passwordValidation.touched]);

  const handleIdentifierChange = (e) => {
    const value = e.target.value;
    setIdentifier(value);
    if (error) setError(""); // clear server error on change
    if (!identifierValidation.touched) {
      setIdentifierValidation((prev) => ({ ...prev, touched: true }));
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (error) setError(""); // clear server error on change
    if (!passwordValidation.touched) {
      setPasswordValidation((prev) => ({ ...prev, touched: true }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormTouched(true);

    const identifierVal = validateIdentifier(identifier);
    const passwordVal = validatePassword(password);

    setIdentifierValidation({
      isValid: identifierVal.isValid,
      message: identifierVal.message,
      touched: true,
    });
    setPasswordValidation({
      isValid: passwordVal.isValid,
      message: passwordVal.message,
      strength: passwordVal.strength,
      touched: true,
    });

    if (identifierVal.isValid && passwordVal.isValid) {
      setIsSubmitting(true);
      try {
        await login(identifier, password);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const getFieldColor = (validation) =>
    !validation.touched ? "primary" : validation.isValid ? "success" : "error";

  const getPasswordStrengthColor = () => {
    if (!passwordValidation.strength) return "#ddd";
    switch (passwordValidation.strength) {
      case "strong":
        return "#4caf50";
      case "medium":
        return "#ff9800";
      default:
        return "#f44336";
    }
  };

  const isFormValid =
    identifierValidation.isValid && passwordValidation.isValid;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)",
        padding: 2,
      }}>
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
          }}>
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
            }}>
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
              }}>
              <Business sx={{ fontSize: 32, color: "white" }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Entertainment.FM CRM
            </Typography>
          </Box>

          {/* Form */}
          <CardContent sx={{ p: 4 }}>
            <Box component="form" onSubmit={handleSubmit}>
              {error && (
                <Fade in={true}>
                  <Alert
                    severity="error"
                    sx={{
                      mb: 3,
                      borderRadius: 2,
                      animation: "shake 0.5s ease-in-out",
                    }}
                    icon={<ErrorOutline />}>
                    {error}
                  </Alert>
                </Fade>
              )}

              {/* Identifier Field */}
              <TextField
                fullWidth
                name="identifier"
                label="Email or Username"
                value={identifier}
                onChange={handleIdentifierChange}
                required
                color={getFieldColor(identifierValidation)}
                error={
                  identifierValidation.touched && !identifierValidation.isValid
                }
                helperText={
                  identifierValidation.touched
                    ? identifierValidation.message ||
                      (identifierValidation.isValid ? "Looks good!" : "")
                    : "Enter your email address or username"
                }
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email
                        sx={{
                          color: identifierValidation.touched
                            ? identifierValidation.isValid
                              ? "success.main"
                              : "error.main"
                            : "#666",
                        }}
                      />
                    </InputAdornment>
                  ),
                  endAdornment: identifierValidation.touched &&
                    identifierValidation.isValid && (
                      <InputAdornment position="end">
                        <CheckCircle
                          sx={{ color: "success.main", fontSize: 20 }}
                        />
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
                onChange={handlePasswordChange}
                required
                color={getFieldColor(passwordValidation)}
                error={
                  passwordValidation.touched && !passwordValidation.isValid
                }
                helperText={
                  passwordValidation.touched
                    ? passwordValidation.message
                    : "Enter your password (minimum 6 characters)"
                }
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock
                        sx={{
                          color: passwordValidation.touched
                            ? passwordValidation.isValid
                              ? "success.main"
                              : "error.main"
                            : "#666",
                        }}
                      />
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
                disabled={isSubmitting || (formTouched && !isFormValid)}
                endIcon={isSubmitting ? null : <ArrowForward />}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  background:
                    isFormValid && !isSubmitting
                      ? "linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%)"
                      : "linear-gradient(135deg, #ccc 0%, #999 100%)",
                  fontSize: "1rem",
                  fontWeight: 600,
                  textTransform: "none",
                  boxShadow:
                    isFormValid && !isSubmitting
                      ? "0 8px 20px rgba(0, 0, 0, 0.2)"
                      : "0 4px 10px rgba(0, 0, 0, 0.1)",
                  "&:hover":
                    isFormValid && !isSubmitting
                      ? {
                          background:
                            "linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)",
                          boxShadow: "0 12px 30px rgba(0, 0, 0, 0.3)",
                          transform: "translateY(-1px)",
                        }
                      : {},
                  "&:disabled": {
                    color: "rgba(255, 255, 255, 0.5)",
                  },
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}>
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
<<<<<<< HEAD
            }}>
            <Typography variant="caption" sx={{ color: "#999" }}>
              © 2025 CRM Portal
=======
            }}
          >
            <Typography variant="caption" sx={{ color: "#999", fontSize: "0.75rem" }}>
              © 2025 CRM Prototype
>>>>>>> 136b0a4d8d94add01ec2032edcd5adb77ce1b0a1
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
