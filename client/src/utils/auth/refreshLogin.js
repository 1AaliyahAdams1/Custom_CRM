import { fetchUserRoles, fetchCurrentUser } from "../../services/auth/authService";

export async function refreshLogin() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  try {
    const user = await fetchCurrentUser();  
    const roles = await fetchUserRoles();

    return { user, roles };
  } catch (err) {
    if (err.response?.status === 401) {
      // Token expired or invalid, clear storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    throw err;
  }
}
