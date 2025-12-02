import axios from "axios";
import { toast } from "sonner";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

// Custom params serializer to handle arrays without brackets
const paramsSerializer = (params: any) => {
  const searchParams = new URLSearchParams();

  Object.keys(params).forEach((key) => {
    const value = params[key];

    if (value === undefined || value === null || value === "") {
      // Skip empty values
      return;
    }

    if (Array.isArray(value)) {
      // For arrays, add multiple params with the same key (without brackets)
      value.forEach((item) => {
        if (item !== undefined && item !== null && item !== "") {
          searchParams.append(key, String(item));
        }
      });
    } else {
      // For non-arrays, add normally
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
};

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds timeout
  paramsSerializer: {
    serialize: paramsSerializer,
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      let token = JSON.parse(localStorage.getItem("token") || "null");
      console.log('token: ', token)
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    } else if (error.response?.status === 403) {
      toast.error("Bạn không có quyền thực hiện hành động này");
    } else if (error.response?.status === 404) {
      toast.error("Không tìm thấy tài nguyên");
    } else if (error.response?.status >= 500) {
      toast.error("Lỗi server. Vui lòng thử lại sau");
    } else if (error.code === "ECONNABORTED") {
      toast.error("Kết nối timeout. Vui lòng thử lại");
    } else if (!error.response) {
      toast.error("Lỗi kết nối. Vui lòng kiểm tra internet");
    }

    return Promise.reject(error);
  }
);

// API functions
export const authApi = {
  // Unified login - automatically detects user type
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),

  // User login (deprecated - use unified login instead)
  loginUser: (email: string, password: string) =>
    api.post("/auth/login/user", { email, password }),

  // Company login (deprecated - use unified login instead)
  loginCompany: (email: string, password: string) =>
    api.post("/auth/login/company", { email, password }),

  // Admin login (deprecated - use unified login instead)
  loginAdmin: (email: string, password: string) =>
    api.post("/auth/login/admin", { email, password }),

  // Refresh token
  refreshToken: (token: string) =>
    api.post(
      "/auth/refresh",
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    ),

  // Validate token
  validateToken: () => api.post("/auth/validate"),

  // Check if email exists across all tables (for registration)
  checkEmail: (email: string) => api.post("/auth/check-email", { email }),
};

export const usersApi = {
  // Get current user profile
  getProfile: () => api.get("/users/profile"),

  // Update user profile
  updateProfile: (data: any) => api.patch("/users/profile", data),

  // Create user account
  createUser: (data: any) => api.post("/users", data),

  // Get all users (admin only)
  getUsers: (params?: any) => api.get("/users", { params }),

  // Get user by ID
  getUserById: (id: string) => api.get(`/users/${id}`),

  // Update user by ID
  updateUser: (id: string, data: any) => api.patch(`/users/${id}`, data),

  // Delete user
  deleteUser: (id: string) => api.delete(`/users/${id}`),

  // Upload avatar
  uploadAvatar: (id: string, file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return api.post(`/users/${id}/upload-avatar`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Upload resume
  uploadResume: (id: string, file: File) => {
    const formData = new FormData();
    formData.append("resume", file);
    return api.post(`/users/${id}/upload-resume`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Get avatar URL
  getAvatarUrl: (id: string, filename: string) =>
    `${API_BASE_URL}/users/${id}/avatar/${filename}`,

  // Search candidates with vector similarity and filters
  searchCandidates: (params?: any) =>
    api.get("/users/candidates/search", { params }),

  // Get resume download URL
  getResumeUrl: (id: string, filename: string) =>
    `${API_BASE_URL}/users/${id}/resume/${filename}`,
};

export const companiesApi = {
  // Get all companies
  getCompanies: (params?: any) => api.get("/companies", { params }),

  // Get company by ID
  getCompanyById: (id: string) => api.get(`/companies/${id}`),

  // Create company
  createCompany: (data: any) => api.post("/companies", data),

  // Update company
  updateCompany: (id: string, data: any) => api.patch(`/companies/${id}`, data),

  // Search companies
  searchCompanies: (params: any) => api.get("/companies/search", { params }),

  // Delete company
  deleteCompany: (id: string) => api.delete(`/companies/${id}`),
};

export const jobsApi = {
  // Get all job posts
  getJobs: (params?: any) => api.get("/job-posts", { params }),

  // Get all job posts
  getJobsByAdmin: (params?: any) => api.get("/job-posts/admin", { params }),

  // Get job by ID
  getJobById: (id: string) => api.get(`/job-posts/${id}`),

  // Create job post
  createJob: (data: any) => api.post("/job-posts", data),

  // Update job post
  updateJob: (id: string, data: any) => api.patch(`/job-posts/${id}`, data),

  // Delete job post
  deleteJob: (id: string) => api.delete(`/job-posts/${id}`),

  // Toggle job active status
  toggleJobActive: (id: string) => api.patch(`/job-posts/${id}/toggle-active`),

  // Get jobs by company
  getJobsByCompany: (companyId: string, params?: any) =>
    api.get(`/job-posts/company/${companyId}`, { params }),

  // Get company job stats
  getCompanyJobStats: (companyId: string) =>
    api.get(`/job-posts/company/${companyId}/stats`),

  // Get search suggestions
  getSearchSuggestions: (query: string) =>
    api.get(`/job-posts/search-suggestions?q=${query}`),

  // Get expired jobs
  getExpiredJobs: (params?: any) => api.get("/job-posts/expired", { params }),

  // Deactivate expired jobs
  deactivateExpiredJobs: () => api.post("/job-posts/deactivate-expired"),
};

export const applicationsApi = {
  // Apply for job
  applyForJob: (data: any) => api.post("/applications", data),

  // Get all applications
  getApplications: (params?: any) => api.get("/applications", { params }),

  // Get application by ID
  getApplicationById: (id: string) => api.get(`/applications/${id}`),

  // Update application status
  updateApplicationStatus: (id: string, status: string) =>
    api.patch(`/applications/${id}/status`, { status }),

  // Get applications by user
  getApplicationsByUser: (userId: string, params?: any) =>
    api.get(`/applications/user/${userId}`, { params }),

  // Get simple applications list by user
  getApplicationsByUserSimple: (userId: string) =>
    api.get(`/applications/user/${userId}/simple`),

  // Get user application stats
  getUserApplicationStats: (userId: string) =>
    api.get(`/applications/user/${userId}/stats`),

  // Get applications by job post
  getApplicationsByJobPost: (jobPostId: string, params?: any) =>
    api.get(`/applications/job-post/${jobPostId}`, { params }),

  // Get applications by company
  getApplicationsByCompany: (companyId: string, params?: any) =>
    api.get(`/applications/company/${companyId}`, { params }),

  // Get detailed applications by company
  getApplicationsByCompanyDetailed: (companyId: string) =>
    api.get(`/applications/company/${companyId}/detailed`),

  // Get company application stats
  getCompanyApplicationStats: (companyId: string) =>
    api.get(`/applications/company/${companyId}/stats`),

  // Check if user already applied
  checkExistingApplication: (userId: string, jobPostId: string) =>
    api.get(
      `/applications/check-existing?userId=${userId}&jobPostId=${jobPostId}`
    ),

  // Delete application
  deleteApplication: (id: string) => api.delete(`/applications/${id}`),
};

export const savedJobsApi = {
  // Save job
  saveJob: (data: any) => api.post("/saved-jobs", data),

  // Toggle save job
  toggleSaveJob: (data: any) => api.post("/saved-jobs/toggle", data),

  // Get saved jobs by user
  getSavedJobsByUser: (userId: string, params?: any) =>
    api.get(`/saved-jobs/user/${userId}`, { params }),

  // Get saved job stats
  getSavedJobStats: (userId: string) =>
    api.get(`/saved-jobs/user/${userId}/stats`),

  // Get saved job IDs
  getSavedJobIds: (userId: string) =>
    api.get(`/saved-jobs/user/${userId}/job-ids`),

  // Check if job is saved
  checkSavedJob: (userId: string, jobPostId: string) =>
    api.get(`/saved-jobs/check-saved?userId=${userId}&jobPostId=${jobPostId}`),

  // Unsave job
  unsaveJob: (userId: string, jobPostId: string) =>
    api.delete(`/saved-jobs/unsave?userId=${userId}&jobPostId=${jobPostId}`),

  // Delete saved job by ID
  deleteSavedJob: (id: string) => api.delete(`/saved-jobs/${id}`),
};

export const categoriesApi = {
  // Get all categories
  getCategories: (params?: any) => api.get("/categories", { params }),

  // Get simple categories list
  getCategoriesSimple: () => api.get("/categories/simple"),

  // Get category by ID
  getCategoryById: (id: string) => api.get(`/categories/${id}`),

  // Create category
  createCategory: (data: any) => api.post("/categories", data),

  // Update category
  updateCategory: (id: string, data: any) =>
    api.patch(`/categories/${id}`, data),

  // Delete category
  deleteCategory: (id: string) => api.delete(`/categories/${id}`),

  // Search categories
  searchCategories: (params: any) => api.get("/categories/search", { params }),
};

export const skillsApi = {
  // Get all skills
  getSkills: (params?: any) => api.get("/skills", { params }),

  // Get simple skills list
  getSkillsSimple: () => api.get("/skills/simple"),

  // Get skill by ID
  getSkillById: (id: string) => api.get(`/skills/${id}`),

  // Create skill
  createSkill: (data: any) => api.post("/skills", data),

  // Update skill
  updateSkill: (id: string, data: any) => api.patch(`/skills/${id}`, data),

  // Delete skill
  deleteSkill: (id: string) => api.delete(`/skills/${id}`),

  // Get skills by category
  getSkillsByCategory: (categoryId: string, params?: any) =>
    api.get(`/skills/category/${categoryId}`, { params }),

  // Search skills
  searchSkills: (params: any) => api.get("/skills/search", { params }),
};

export const adminsApi = {
  // Get all admins
  getAdmins: (params?: any) => api.get("/admins", { params }),

  // Get admin by ID
  getAdminById: (id: string) => api.get(`/admins/${id}`),

  // Create admin
  createAdmin: (data: any) => api.post("/admins", data),

  // Update admin
  updateAdmin: (id: string, data: any) => api.patch(`/admins/${id}`, data),

  // Delete admin
  deleteAdmin: (id: string) => api.delete(`/admins/${id}`),

  // Get system stats
  getSystemStats: () => api.get("/admins/system-stats"),
};

// Applications API
export const applicationApi = {
  createApplication: (data: any) => api.post("/applications", data),
  getApplications: (params: any = {}) => api.get("/applications", { params }),
  getApplication: (id: string) => api.get(`/applications/${id}`),
  getUserApplications: (userId: string, params: any = {}) =>
    api.get(`/applications/user/${userId}`, { params }),
  getJobApplications: (jobId: string, params: any = {}) =>
    api.get(`/applications/job-post/${jobId}`, { params }),
  updateApplicationStatus: (id: string, status: string) =>
    api.patch(`/applications/${id}/status`, { status }),
  deleteApplication: (id: string) => api.delete(`/applications/${id}`),
  checkExistingApplication: (jobId: string, userId: string) =>
    api.get(`/applications/check-existing?jobPostId=${jobId}&userId=${userId}`),
};

// AI API
export const aiApi = {
  // Optimize CV using AI
  optimizeCV: (data: { userId: string; resumeUrl: string; jobId: string }) =>
    api.post("/ai/optimize-cv", data),
  // Find candidates using AI
  findCandidates: (jobId: string) => api.post(`/ai/find-candidates/${jobId}`),
};

// Bookings API
export const bookingsApi = {
  // Create a new booking
  create: (data: any) => api.post("/bookings", data),

  // Get all bookings
  getAll: (params?: any) => api.get("/bookings", { params }),

  // Get bookings by company
  getByCompany: (companyId: string, params?: any) =>
    api.get(`/bookings/company/${companyId}`, { params }),

  // Get bookings by candidate
  getByCandidate: (candidateId: string, params?: any) =>
    api.get(`/bookings/candidate/${candidateId}`, { params }),

  // Check existing booking between company and candidate
  checkExisting: (companyId: string, candidateId: string) =>
    api.get(`/bookings/check/${companyId}/${candidateId}`),

  // Get booking by ID
  getById: (id: string) => api.get(`/bookings/${id}`),

  // Update booking
  update: (id: string, data: any) => api.patch(`/bookings/${id}`, data),

  // Delete booking
  delete: (id: string) => api.delete(`/bookings/${id}`),
};

export default api;
