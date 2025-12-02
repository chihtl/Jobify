// Enums
export enum JobType {
  FULL_TIME = "full-time",
  PART_TIME = "part-time",
  CONTRACT = "contract",
  FREELANCE = "freelance",
}

export enum ExperienceLevel {
  ENTRY = "entry",
  MID = "mid",
  SENIOR = "senior",
  LEAD = "lead",
}

export enum ApplicationStatus {
  PENDING = "pending",
  REVIEWED = "reviewed",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
}

export enum UserRole {
  USER = "user",
  COMPANY = "company",
  ADMIN = "admin",
}

export enum AdminRole {
  SUPER_ADMIN = "super_admin",
  MODERATOR = "moderator",
}

// Base interfaces
export interface BaseEntity {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

// User related types
export interface Experience {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

export interface User extends BaseEntity {
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  resumeUrl?: string;
  location?: string;
  bio?: string;
  skillIds?: string[];
  experiences?: Experience[];
}

export interface Company extends BaseEntity {
  name: string;
  email: string;
  logoUrl?: string;
  websiteUrl?: string;
  location?: string;
  description?: string;
  employeeCount?: string;
  industry?: string;
  founded?: number;
}

export interface Admin extends BaseEntity {
  name: string;
  email: string;
  role: AdminRole;
}

// Job related types
export interface Category extends BaseEntity {
  name: string;
  description?: string;
  iconUrl?: string;
}

export interface Skill extends BaseEntity {
  name: string;
  categoryId: Category | string;
}

export interface JobPost extends BaseEntity {
  title: string;
  description: string;
  companyId: Company | string;
  categoryId: Category | string;
  skillIds: (Skill | string)[];
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  isActive: boolean;
  expiresAt?: string;
  requirements?: string[];
  benefits?: string[];
  applicationCount?: number;
}

export interface Application extends BaseEntity {
  userId: User | string;
  jobPostId: JobPost | string;
  coverLetter?: string;
  resumeUrl?: string;
  status: ApplicationStatus;
}

export interface SavedJob extends BaseEntity {
  userId: User | string;
  jobPostId: JobPost | string;
}

// API Response types
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name?: string;
    logoUrl?: string;
    type: "user" | "company" | "admin";
    role?: AdminRole;
  };
}

export interface AuthUser {
  id: string;
  email: string;
  type: UserRole;
  role?: AdminRole;
}

// Form types
export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface UpdateUserDto {
  name?: string;
  phone?: string;
  avatarUrl?: string;
  resumeUrl?: string;
  location?: string;
  bio?: string;
  skillIds?: string[];
  experiences?: Experience[];
}

export interface CreateCompanyDto {
  name: string;
  email: string;
  password: string;
  logoUrl?: string;
  websiteUrl?: string;
  location?: string;
  description?: string;
  employeeCount?: string;
  industry?: string;
  founded?: number;
}

export interface UpdateCompanyDto {
  name?: string;
  logoUrl?: string;
  websiteUrl?: string;
  location?: string;
  description?: string;
  employeeCount?: string;
  industry?: string;
  founded?: number;
}

export interface CreateJobPostDto {
  title: string;
  description: string;
  companyId: string;
  categoryId: string;
  skillIds: string[];
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  requirements?: string[];
  benefits?: string[];
  expiresAt?: string;
}

export interface UpdateJobPostDto {
  title?: string;
  description?: string;
  categoryId?: string;
  skillIds?: string[];
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  jobType?: JobType;
  experienceLevel?: ExperienceLevel;
  requirements?: string[];
  benefits?: string[];
  expiresAt?: string;
  isActive?: boolean;
}

// Booking Types
export enum BookingStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
}

export enum BookingType {
  INTERVIEW = "interview",
  MEETING = "meeting",
  PHONE_CALL = "phone_call",
  VIDEO_CALL = "video_call",
}

export interface Booking {
  _id: string;
  companyId: {
    _id: string;
    name: string;
    email: string;
  };
  candidateId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
  };
  applicationId?: {
    _id: string;
    status: string;
    createdAt: string;
  };
  title: string;
  description: string;
  scheduledDate: string;
  duration: number;
  location?: string;
  meetingLink?: string;
  type: BookingType;
  status: BookingStatus;
  notes?: string;
  cancelReason?: string;
  confirmedAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingDto {
  candidateId: string;
  applicationId?: string;
  title: string;
  description: string;
  scheduledDate: string;
  duration: number;
  location?: string;
  meetingLink?: string;
  type: BookingType;
  notes?: string;
}

export interface UpdateBookingDto {
  title?: string;
  description?: string;
  scheduledDate?: string;
  duration?: number;
  location?: string;
  meetingLink?: string;
  type?: BookingType;
  notes?: string;
  status?: BookingStatus;
  cancelReason?: string;
}

export interface CreateApplicationDto {
  userId: string;
  jobPostId: string;
  coverLetter?: string;
  resumeUrl?: string;
}

export interface UpdateApplicationStatusDto {
  status: ApplicationStatus;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  iconUrl?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  iconUrl?: string;
}

export interface CreateSkillDto {
  name: string;
  categoryId: string;
}

export interface UpdateSkillDto {
  name?: string;
  categoryId?: string;
}

export interface CreateAdminDto {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
}

export interface UpdateAdminDto {
  name?: string;
  role?: AdminRole;
}

// Filter and search types
export interface JobSearchFilters {
  search?: string;
  categoryId?: string;
  skillIds?: string[];
  location?: string;
  minSalary?: number;
  maxSalary?: number;
  jobType?: JobType[];
  experienceLevel?: ExperienceLevel[];
  companyId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "updatedAt" | "salaryMin" | "salaryMax";
  sortOrder?: "asc" | "desc";
}

export interface ApplicationFilters {
  userId?: string;
  jobPostId?: string;
  companyId?: string;
  status?: ApplicationStatus;
  page?: number;
  limit?: number;
}

export interface CompanySearchFilters {
  query?: string;
  location?: string;
  industry?: string;
  employeeCount?: string;
  page?: number;
  limit?: number;
}

// Statistics types
export interface SystemStats {
  users: {
    total: number;
    newThisMonth: number;
  };
  companies: {
    total: number;
    newThisMonth: number;
  };
  jobPosts: {
    total: number;
    active: number;
    newThisMonth: number;
  };
  applications: {
    total: number;
    pending: number;
    newThisMonth: number;
  };
  categories: {
    total: number;
  };
  skills: {
    total: number;
  };
}

export interface CompanyJobStats {
  totalJobs: number;
  activeJobs: number;
  inactiveJobs: number;
  avgSalaryMin: number;
  avgSalaryMax: number;
}

export interface UserApplicationStats {
  pending: number;
  reviewed: number;
  accepted: number;
  rejected: number;
  total: number;
}

export interface CompanyApplicationStats {
  pending: number;
  reviewed: number;
  accepted: number;
  rejected: number;
  total: number;
}

// UI State types
export interface LoadingState {
  [key: string]: boolean;
}

export interface ErrorState {
  [key: string]: string | null;
}

// Component Props types
export interface ButtonProps {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
}

export interface InputProps {
  label?: string;
  error?: string;
  type?:
    | "text"
    | "email"
    | "password"
    | "number"
    | "tel"
    | "url"
    | "search"
    | "date"
    | "time"
    | "datetime-local";
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  min?: string;
  max?: string;
}

export interface SelectProps {
  label?: string;
  error?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

// Context types
export interface AuthContextType {
  user: User | Company | Admin | null;
  userType: UserRole | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateProfile: (data: User | Company | Admin) => Promise<void>;
  isAuthenticated: boolean;
}

export interface UIContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  loading: LoadingState;
  setLoading: (key: string, loading: boolean) => void;
  errors: ErrorState;
  setError: (key: string, error: string | null) => void;
}

// Hook return types
export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UsePaginatedApiResult<T> {
  data: T[];
  pagination: PaginationMeta | null;
  loading: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
  hasNextPage: boolean;
}

// Form validation schemas (for Zod)
export interface FormErrors {
  [key: string]: string;
}

// Search suggestion types
export interface SearchSuggestion {
  type: "job" | "company" | "skill" | "category";
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
}

// File upload types
export interface FileUploadResult {
  url: string;
  filename: string;
  size: number;
  type: string;
}

// Notification types
export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// Navigation types
export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType;
  children?: NavItem[];
  requireAuth?: boolean;
  roles?: UserRole[];
}

// Table types
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
  width?: string;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  onSort?: (key: keyof T, direction: "asc" | "desc") => void;
  sortKey?: keyof T;
  sortDirection?: "asc" | "desc";
  className?: string;
}

export default {};
