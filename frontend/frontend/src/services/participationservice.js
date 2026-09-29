
import api from "./api";

// Customer: Get all my participations
export const getMyParticipations = async () => {
  const response = await api.get("/participations/my");
  return response.data;
};

// Customer: Check my participation in one deal
export const getMyDealParticipation = async (dealId) => {
  const response = await api.get(
    `/participations/deals/${dealId}/mine`
  );

  return response.data;
};

// Customer: Join or rejoin a deal
export const joinDeal = async (dealId, joinData) => {
  const response = await api.post(
    `/participations/${dealId}/join`,
    joinData
  );

  return response.data;
};

// Customer: Leave a deal
export const leaveDeal = async (dealId) => {
  const response = await api.post(
    `/participations/${dealId}/leave`
  );

  return response.data;
};
