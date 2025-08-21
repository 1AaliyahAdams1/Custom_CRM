import React from "react";
import { Chip } from "@mui/material";

// Universal formatter
export const formatters = {
  CreatedAt: (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (isNaN(date)) return "-";
    return date.toLocaleDateString(); // or toLocaleString() for date + time
  },

  UpdatedAt: (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (isNaN(date)) return "-";
    return date.toLocaleDateString();
  },

  CloseDate: (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (isNaN(date)) return "-";
    return date.toLocaleDateString();
  },

  DueToStart: (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (isNaN(date)) return "-";
    return date.toLocaleDateString();
  },

  DueToEnd: (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (isNaN(date)) return "-";
    return date.toLocaleDateString();
  },
  PriorityLevelID: (value) => {
    const priorities = {
      1: 'Low',
      2: 'Medium',
      3: 'High',
      4: 'Critical'
    };
    return priorities[value] || value || "-";
  },

  BoolChips: (value) => {
    if (value === true) return <Chip label="Yes" size="small" color="success" />;
    if (value === false) return <Chip label="No" size="small" color="error" />;
    return <Chip label="N/A" size="small" color="default" />;
  },

  street_address: (value, row) => {
    const fullAddress = [row.street_address1, row.street_address2, row.street_address3]
      .filter(Boolean)
      .join(" ");
    return fullAddress || "-";
  },
  annual_revenue: (value) => {
    if (!value) return "-";
    return new Intl.NumberFormat().format(value);
  },

  Value: (value) => {
    if (!value) return "-";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  },
  Probability: (value) => {
    if (!value && value !== 0) return "-";
    return `${value}%`;
  },
};

