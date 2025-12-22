import { API_BASE_URL } from "../config/api-config";

const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

const getHeaders = () => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const lunchScheduleService = {
  // Tạo hoặc cập nhật lịch ăn trưa
  async createOrUpdateSchedule(weekStartDate, meals) {
    const response = await fetch(`${API_BASE_URL}/lunch-schedule`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ weekStartDate, meals }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to save schedule");
    }
    return data;
  },

  // Lấy lịch ăn trưa theo tuần
  async getScheduleByWeek(weekStartDate) {
    const response = await fetch(
      `${API_BASE_URL}/lunch-schedule/week?weekStartDate=${weekStartDate}`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch schedule");
    }
    return data;
  },

  // Lấy tất cả lịch ăn trưa
  async getAllSchedules(page = 1, limit = 10) {
    const response = await fetch(
      `${API_BASE_URL}/lunch-schedule?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch schedules");
    }
    return data;
  },

  // Tạo lịch tự động từ lịch sử
  async generateScheduleFromHistory(weekStartDate) {
    const response = await fetch(`${API_BASE_URL}/lunch-schedule/generate`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ weekStartDate }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to generate schedule");
    }
    return data;
  },

  // Xóa lịch ăn trưa
  async deleteSchedule(scheduleId) {
    const response = await fetch(
      `${API_BASE_URL}/lunch-schedule/${scheduleId}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to delete schedule");
    }
    return data;
  },
};

