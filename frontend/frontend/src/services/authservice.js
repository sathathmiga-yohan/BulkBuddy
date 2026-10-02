import api from "./api";
// Frontend-லிருந்து backend-ன் authentication APIs (register, login, me) call பண்ணுவதற்காக.
// ==========================
// REGISTER USER
// ==========================================
// User Register page-ல் details கொடுக்கிறார். Frontend அந்த data-ஐ backend-க்கு கொண்டு போகணும்.
export const registerUser = async (userData) => {
  const response = await api.post("/auth/register", userData);

  return response.data;
};

// LOGIN USER
// User email/password கொடுக்கிறார். அதை backend-க்கு கொண்டு போகணும்.
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
// Login ஆன பிறகு “இப்ப login ஆகி இருக்கிற user யார்?” என்று frontend-க்கு தெரிய வேண்டிய நேரம் வரும்.
export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");

  return response.data;
};

// ==========================================
// LOGOUT USER
// ==========================================
// User logout click பண்ணினால் browser-ல் வைத்த JWT token வேண்டாம்.
export const logoutUser = () => {
  localStorage.removeItem("token");
};