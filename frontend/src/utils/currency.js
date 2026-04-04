// Shared INR currency utility — used across all components
export const USD_TO_INR = 83;

// Convert USD stored value → display as ₹
export const toINR = (usd) =>
  `₹${Math.round((usd || 0) * USD_TO_INR).toLocaleString('en-IN')}`;

// Convert INR input → USD for API storage
export const fromINR = (inr) =>
  inr ? parseFloat(inr) : '';

// Format ₹ with /hr suffix
export const toINRHr = (usd) => `${toINR(usd)}/घंटा`;
