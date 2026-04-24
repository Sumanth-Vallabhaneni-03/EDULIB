import { axiosInstance } from "./axiosInstance";

export const AddRequest = async (bookId, note = "") => {
  const response = await axiosInstance.post("/api/requests/add-request", { book: bookId, note });
  return response.data;
};

export const GetRequests = async () => {
  const response = await axiosInstance.get("/api/requests/get-requests");
  return response.data;
};

export const UpdateRequestStatus = async (requestId, status) => {
  const response = await axiosInstance.post("/api/requests/update-request-status", { requestId, status });
  return response.data;
};

export const DeleteRequest = async (requestId) => {
  const response = await axiosInstance.post("/api/requests/delete-request", { requestId });
  return response.data;
};
