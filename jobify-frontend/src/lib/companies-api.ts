import axios from "axios";
import { API_BASE_URL } from "./api";

const companiesApi = {
  // Get a list of all companies
  getCompanies: async (params?: any) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/companies`, {
        params,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response;
    } catch (error) {
      console.error("Error getting companies:", error);
      throw error;
    }
  },

  // Get a single company by ID
  getCompany: async (id: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/companies/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response;
    } catch (error) {
      console.error("Error getting company:", error);
      throw error;
    }
  },

  // Update company profile
  updateCompany: async (id: string, data: any) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/companies/${id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response;
    } catch (error) {
      console.error("Error updating company:", error);
      throw error;
    }
  },

  // Search companies
  searchCompanies: async (query: string, params?: any) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/companies/search`, {
        params: {
          q: query,
          ...params,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response;
    } catch (error) {
      console.error("Error searching companies:", error);
      throw error;
    }
  },
};

export default companiesApi;
