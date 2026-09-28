import api from "./api";

export const getDealOutcomes = async () => {
  const response = await api.get(
    "/reports/deal-outcomes"
  );

  return response.data;
};

export const getParticipationReport = async () => {
  const response = await api.get(
    "/reports/participation"
  );

  return response.data;
};

export const getSellerSales = async () => {
  const response = await api.get(
    "/reports/seller-sales"
  );

  return response.data;
};