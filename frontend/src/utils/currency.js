// Shared INR currency utility — used across all components
// All amounts are stored and handled as INR directly. No USD conversion.

// Format raw INR amount → display as ₹
export const toINR = (amount) =>
  `₹${(amount || 0).toLocaleString('en-IN')}`;

// Return raw INR value for API (no conversion needed)
export const fromINR = (inr) =>
  inr ? parseFloat(inr) : '';

// Format ₹ with /hr suffix
export const toINRHr = (amount) => `${toINR(amount)}/hr`;
