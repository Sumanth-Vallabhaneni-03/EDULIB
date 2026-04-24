import { axiosInstance } from "./axiosInstance";

// register a user
export const RegisterUser = async (payload) => {
  try {
    const response = await axiosInstance.post("/api/users/register", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};
//
// login a user
export const LoginUser = async (payload) => {
  try {
    const response = await axiosInstance.post("/api/users/login", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// get user details

export const GetLoggedInUserDetails = async () => {
  try {
    const response = await axiosInstance.get("/api/users/get-logged-in-user");
    return response.data;
  } catch (error) {
    throw error;
  }
}

// get all users
export const GetAllUsers = async (role) => {
  try {
    const response = await axiosInstance.get(`/api/users/get-all-users/${role}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};


// get user by id

export const GetUserById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/users/get-user-by-id/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// bulk import students
export const BulkImportStudents = async (students) => {
  try {
    const response = await axiosInstance.post("/api/users/bulk-import", { students });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Find user by roll number or email (for issue form)
export const FindUser = async (query) => {
  const response = await axiosInstance.get(`/api/users/find-user?query=${encodeURIComponent(query)}`);
  return response.data;
};

// Get users pending approval
export const GetPendingUsers = async () => {
  const response = await axiosInstance.get("/api/users/get-pending-users");
  return response.data;
};

// Approve or reject a user
export const UpdateUserStatus = async (userId, status) => {
  const response = await axiosInstance.post("/api/users/update-user-status", { userId, status });
  return response.data;
};