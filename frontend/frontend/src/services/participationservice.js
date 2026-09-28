import api from "./api";

export const joinDeal = async (dealId) => {
  const response = await api.post(
    `/deals/${dealId}/join`
  );

  return response.data;
};

export const leaveDeal = async (dealId) => {
  const response = await api.delete(
    `/deals/${dealId}/leave`
  );

  return response.data;
};

export const getMyDeals = async () => {
  const response = await api.get(
    "/participations/my-deals"
  );

  return response.data;
};