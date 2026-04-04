export const toINR = (amount) =>
  `₹${(amount || 0).toLocaleString('en-IN')}`;
export const fromINR = (inr) =>
  inr ? parseFloat(inr) : '';

export const toINRHr = (amount) => `${toINR(amount)}/hr`;