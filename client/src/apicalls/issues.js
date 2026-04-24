import { axiosInstance } from "./axiosInstance";

export const GetIssues = async (payload) => {
  const response = await axiosInstance.post("/api/issues/get-issues", payload);
  return response.data;
};

export const IssueBook = async (payload) => {
  const response = await axiosInstance.post("/api/issues/issue-new-book", payload);
  return response.data;
};

export const ReturnBook = async (payload) => {
  const response = await axiosInstance.post("/api/issues/return-book", payload);
  return response.data;
};

export const DeleteIssue = async (payload) => {
  const response = await axiosInstance.post("/api/issues/delete-issue", payload);
  return response.data;
};

export const EditIssue = async (payload) => {
  const response = await axiosInstance.post("/api/issues/edit-issue", payload);
  return response.data;
};

export const MarkFinePaid = async (issueId, note = "") => {
  const response = await axiosInstance.post("/api/issues/mark-fine-paid", { issueId, note });
  return response.data;
};

export const MarkFineWaived = async (issueId, note = "") => {
  const response = await axiosInstance.post("/api/issues/mark-fine-waived", { issueId, note });
  return response.data;
};

export const GetOverdueIssues = async () => {
  const response = await axiosInstance.get("/api/issues/get-overdue");
  return response.data;
};

export const GetDueSoonIssues = async () => {
  const response = await axiosInstance.get("/api/issues/get-due-soon");
  return response.data;
};

export const GetDashboardStats = async () => {
  const response = await axiosInstance.get("/api/issues/get-stats");
  return response.data;
};