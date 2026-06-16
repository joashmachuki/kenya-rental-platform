import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const checkUnlockStatus = async (listingId: number, token: string) => {
  const res = await axios.get(`${API_URL}/check-unlock/${listingId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const mockPayment = async (data: { phone_number: string; listing_id: number; payment_type: string }, token: string) => {
  const res = await axios.post(`${API_URL}/mock-stk-push`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};
