import api from '../utils/api';

export const triggerEFMSync = async () => {
  try {
    const res = await api.post('/api/efm-sync/trigger');
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message);
  }
};
