// src/auth/useAuth.js
export const useAuth = () => {
  try {
    let user = JSON.parse(localStorage.getItem("kadSunInfo"));
    user = user?.token;
    return { user };
  } catch (error) {
    console.error("Error parsing auth data from localStorage:", error);
    // Clear corrupted data
    localStorage.removeItem("kadSunInfo");
    return { user: null };
  }
};
