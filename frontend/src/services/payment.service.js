import API from './api';

export const createPaymentOrder = (booking_id) =>
  API.post('/payments/create-order', { booking_id });

export const verifyPayment = (data) =>
  API.post('/payments/verify', data);

export const getPaymentByBooking = (bookingId) =>
  API.get(`/payments/booking/${bookingId}`);