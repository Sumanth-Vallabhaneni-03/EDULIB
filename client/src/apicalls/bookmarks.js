import { axiosInstance } from "./axiosInstance";

export const ToggleBookmark = async (bookId) => {
  const response = await axiosInstance.post("/api/bookmarks/toggle-bookmark", { bookId });
  return response.data;
};

export const GetBookmarks = async () => {
  const response = await axiosInstance.get("/api/bookmarks/get-bookmarks");
  return response.data;
};

export const IsBookmarked = async (bookId) => {
  const response = await axiosInstance.get(`/api/bookmarks/is-bookmarked/${bookId}`);
  return response.data;
};
