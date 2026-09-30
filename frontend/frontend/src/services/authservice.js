import api from "./api";

// ==========================================
// REGISTER USER
// ==========================================
export const registerUser = async (userData) => {
  const response = await api.post("/auth/register", userData);

  return response.data;
};

// LOGIN USER
// ==========================================
export const loginUser = async (email, password) => {
  const formData = new URLSearchParams();

  formData.append("username", email);
  formData.append("password", password);

  const response = await api.post(
    "/auth/login",
    formData,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data;
};

// ==========================================
// GET CURRENT LOGGED-IN USER
// ==========================================
export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");

  return response.data;
};

// ==========================================
// LOGOUT USER
// ==========================================
export const logoutUser = () => {
  localStorage.removeItem("token");
};