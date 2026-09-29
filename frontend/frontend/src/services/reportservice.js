
import api from "./api";

export const getSellerReport = async () => {
  const response = await api.get("/reports/seller");

  return response.data;
};
