import api from "./api";

export const getDeals = async () => {
  const response = await api.get("/deals");
  return response.data;
};

export const getDealById = async (dealId) => {
  const response = await api.get(`/deals/${dealId}`);
  return response.data;
};

export const createDeal = async (dealData) => {
  const response = await api.post("/deals", dealData);
  return response.data;
};

export const getSellerDeals = async () => {
  const response = await api.get(
    "/deals/seller/my-deals"
  );

  return response.data;
};

export const updateDeal = async (
  dealId,
  dealData
) => {
  const response = await api.patch(
    `/deals/${dealId}`,
    dealData
  );

  return response.data;
};

export const importDealsCsv = async (file) => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post(
    "/deals/import-csv",
    formData
  );

  return response.data;
};

export const getDealParticipants = async (
  dealId
) => {
  const response = await api.get(
    `/deals/${dealId}/participants`
  );

  return response.data;
};

export const deleteDeal = async (dealId) => {
  const response = await api.delete(
    `/deals/${dealId}`
  );

  return response.data;
};