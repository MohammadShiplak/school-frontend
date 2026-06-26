import axiosInstance from "./axiosInstance";

export const getClasses = (pageNumber = 1, pageSize = 100) => {
  return axiosInstance.get("/api/Class", {
    params: { pageNumber, pageSize },
  });
};
