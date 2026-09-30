import api from "./api";

// Get all public deals
export const getDeals = async () => {
    const response = await api.get("/deals");
    return response.data;
};

// Get a single deal by ID
export const getDealById = async (dealId) => {
    const response = await api.get(`/deals/${dealId}`);
    return response.data;
};

// Seller: Create a new deal
export const createDeal = async (dealData) => {
    const response = await api.post("/deals", dealData);
    return response.data;
};

// Seller: Get own deals
export const getSellerDeals = async () => {
    const response = await api.get("/deals/seller/my-deals");
    return response.data;
};

export const updateDeal = async (dealId, dealData) => {
    const response = await api.patch(
        `/deals/${dealId}`,
        dealDatawwwww
    );

    return response.data;
};

// Seller: Delete own deal
export const deleteDeal = async (dealId) => {
    const response = await api.delete(`/deals/${dealId}`);
    return response.data;
};

// Seller: Import deals from CSV
export const importDealsCsv = async (file) => {
    const formData = new FormData();

    formData.append("file", file);

    const response = await api.post(
        "/deals/import-csv",
        formData
    );

    return response.data;
};


export const getSellerDealParticipants = async (dealId) => {
    const response = await api.get(
        `/participations/seller/deals/${dealId}`
    );

    return response.data;
};
