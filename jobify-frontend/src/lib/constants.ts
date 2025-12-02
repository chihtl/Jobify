import { AdminRole, ApplicationStatus, ExperienceLevel, JobType } from './types';

// API Constants
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN_USER: '/auth/login/user',
    LOGIN_COMPANY: '/auth/login/company',
    LOGIN_ADMIN: '/auth/login/admin',
    REFRESH: '/auth/refresh',
    VALIDATE: '/auth/validate',
  },
  USERS: '/users',
  COMPANIES: '/companies',
  JOBS: '/job-posts',
  APPLICATIONS: '/applications',
  SAVED_JOBS: '/saved-jobs',
  CATEGORIES: '/categories',
  SKILLS: '/skills',
  ADMINS: '/admins',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  SIDEBAR_STATE: 'sidebarState',
  RECENT_SEARCHES: 'recentSearches',
  FILTERS: 'jobFilters',
  PREFERENCES: 'userPreferences',
} as const;

// Job Type Options
export const JOB_TYPE_OPTIONS = [
  { value: JobType.FULL_TIME, label: 'Toàn thời gian', icon: '' },
  { value: JobType.PART_TIME, label: 'Bán thời gian', icon: '' },
  { value: JobType.CONTRACT, label: 'Hợp đồng', icon: '' },
  { value: JobType.FREELANCE, label: 'Freelance', icon: '' },
] as const;

// Experience Level Options
export const EXPERIENCE_LEVEL_OPTIONS = [
  { value: ExperienceLevel.ENTRY, label: 'Mới đi làm', icon: '', color: '#10b981' },
  { value: ExperienceLevel.MID, label: 'Trung cấp', icon: '', color: '#f59e0b' },
  { value: ExperienceLevel.SENIOR, label: 'Cao cấp', icon: '', color: '#3b82f6' },
  { value: ExperienceLevel.LEAD, label: 'Lãnh đạo', icon: '', color: '#8b5cf6' },
] as const;

// Application Status Options
export const APPLICATION_STATUS_OPTIONS = [
  { value: ApplicationStatus.PENDING, label: 'Chờ xử lý', color: '#f59e0b', bgColor: '#fef3c7' },
  { value: ApplicationStatus.REVIEWED, label: 'Đã xem', color: '#3b82f6', bgColor: '#dbeafe' },
  { value: ApplicationStatus.ACCEPTED, label: 'Chấp nhận', color: '#10b981', bgColor: '#d1fae5' },
  { value: ApplicationStatus.REJECTED, label: 'Từ chối', color: '#ef4444', bgColor: '#fee2e2' },
];

// Admin Role Options
export const ADMIN_ROLE_OPTIONS = [
  { value: AdminRole.SUPER_ADMIN, label: 'Super Admin', description: 'Quyền quản trị tối cao' },
  { value: AdminRole.MODERATOR, label: 'Moderator', description: 'Quản lý nội dung và người dùng' },
] as const;

// Salary Ranges
export const SALARY_RANGES = [
  { min: 0, max: 10000000, label: 'Dưới 10 triệu' },
  { min: 10000000, max: 20000000, label: '10 - 20 triệu' },
  { min: 20000000, max: 30000000, label: '20 - 30 triệu' },
  { min: 30000000, max: 50000000, label: '30 - 50 triệu' },
  { min: 50000000, max: 100000000, label: '50 - 100 triệu' },
  { min: 100000000, max: null, label: 'Trên 100 triệu' },
] as const;

// Company Sizes
export const COMPANY_SIZES = [
  { value: '1-10', label: '1-10 nhân viên' },
  { value: '11-50', label: '11-50 nhân viên' },
  { value: '51-200', label: '51-200 nhân viên' },
  { value: '201-500', label: '201-500 nhân viên' },
  { value: '501-1000', label: '501-1000 nhân viên' },
  { value: '1000+', label: 'Trên 1000 nhân viên' },
] as const;

// Industries
export const INDUSTRIES = [
  'Công nghệ thông tin',
  'Tài chính - Ngân hàng',
  'Y tế - Chăm sóc sức khỏe',
  'Giáo dục - Đào tạo',
  'Bán lẻ - Thương mại điện tử',
  'Sản xuất',
  'Bất động sản',
  'Du lịch - Khách sạn',
  'Truyền thông - Quảng cáo',
  'Năng lượng',
  'Giao thông vận tải',
  'Nông nghiệp',
  'Dịch vụ tư vấn',
  'Khác',
] as const;

// Vietnamese Cities
export const CITIES = [
  'Hồ Chí Minh',
  'Hà Nội',
  'Đà Nẵng',
  'Hải Phòng',
  'Cần Thơ',
  'Biên Hòa',
  'Huế',
  'Nha Trang',
  'Buôn Ma Thuột',
  'Quy Nhon',
  'Vũng Tàu',
  'Nam Định',
  'Thái Nguyên',
  'Việt Trì',
  'Bắc Giang',
  'Bắc Ninh',
  'Long Xuyên',
  'Rạch Giá',
  'Cà Mau',
  'Khác',
] as const;

// Pagination Constants
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 100,
  ITEMS_PER_PAGE_OPTIONS: [12, 24, 48, 96],
} as const;

// File Upload Constants
export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  MAX_IMAGES: 10,
  MAX_DOCUMENTS: 5,
} as const;

// UI Constants
export const UI = {
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 300,
  TOAST_DURATION: 5000,
  SKELETON_COUNT: 6,
  INFINITE_SCROLL_THRESHOLD: 0.8,
} as const;

// Theme Constants
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

// Breakpoints (matching Tailwind CSS)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

// Social Media Links
export const SOCIAL_LINKS = {
  FACEBOOK: 'https://facebook.com/jobify.vn',
  LINKEDIN: 'https://linkedin.com/company/jobify-vn',
  TWITTER: 'https://twitter.com/jobify_vn',
  INSTAGRAM: 'https://instagram.com/jobify.vn',
} as const;

// Contact Information
export const CONTACT_INFO = {
  EMAIL: 'contact@jobify.vn',
  PHONE: '+84 28 1234 5678',
  ADDRESS: '123 Nguyễn Huệ, Quận 1, TP.HCM',
  SUPPORT_EMAIL: 'support@jobify.vn',
  BUSINESS_EMAIL: 'business@jobify.vn',
} as const;

// Feature Flags
export const FEATURES = {
  DARK_MODE: true,
  SOCIAL_LOGIN: false,
  NOTIFICATIONS: true,
  CHAT: false,
  ANALYTICS: true,
  FILE_UPLOAD: true,
  EMAIL_VERIFICATION: true,
  TWO_FACTOR_AUTH: false,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Lỗi kết nối mạng. Vui lòng thử lại sau.',
  UNAUTHORIZED: 'Bạn không có quyền truy cập.',
  FORBIDDEN: 'Bạn không có quyền thực hiện hành động này.',
  NOT_FOUND: 'Không tìm thấy tài nguyên.',
  SERVER_ERROR: 'Lỗi server. Vui lòng thử lại sau.',
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ.',
  FILE_TOO_LARGE: 'File quá lớn. Vui lòng chọn file nhỏ hơn.',
  INVALID_FILE_TYPE: 'Định dạng file không được hỗ trợ.',
  REQUIRED_FIELD: 'Trường này là bắt buộc.',
  INVALID_EMAIL: 'Email không hợp lệ.',
  INVALID_PHONE: 'Số điện thoại không hợp lệ.',
  PASSWORD_TOO_SHORT: 'Mật khẩu phải có ít nhất 6 ký tự.',
  PASSWORDS_NOT_MATCH: 'Mật khẩu xác nhận không khớp.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Đăng nhập thành công!',
  REGISTER_SUCCESS: 'Đăng ký thành công!',
  LOGOUT_SUCCESS: 'Đăng xuất thành công!',
  PROFILE_UPDATED: 'Cập nhật hồ sơ thành công!',
  JOB_CREATED: 'Tạo công việc thành công!',
  JOB_UPDATED: 'Cập nhật công việc thành công!',
  JOB_DELETED: 'Xóa công việc thành công!',
  APPLICATION_SUBMITTED: 'Nộp đơn ứng tuyển thành công!',
  JOB_SAVED: 'Lưu công việc thành công!',
  JOB_UNSAVED: 'Bỏ lưu công việc thành công!',
  FILE_UPLOADED: 'Tải file lên thành công!',
  EMAIL_SENT: 'Gửi email thành công!',
} as const;

// Date Formats
export const DATE_FORMATS = {
  SHORT_DATE: 'dd/MM/yyyy',
  LONG_DATE: 'dd MMMM yyyy',
  DATE_TIME: 'dd/MM/yyyy HH:mm',
  TIME_ONLY: 'HH:mm',
  MONTH_YEAR: 'MM/yyyy',
  FULL_DATE: 'EEEE, dd MMMM yyyy',
} as const;

// Regular Expressions
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^(\+84|84|0[3|5|7|8|9])+([0-9]{8,9})$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/,
  SLUG: /^[a-z0-9-]+$/,
  VIETNAMESE_PHONE: /^(0|\+84)[3|5|7|8|9][0-9]{8}$/,
} as const;

// Meta Data
export const META = {
  SITE_NAME: 'Jobify',
  SITE_DESCRIPTION: 'Nền tảng tìm việc hàng đầu Việt Nam',
  SITE_URL: 'https://jobify.vn',
  TWITTER_HANDLE: '@jobify_vn',
  FACEBOOK_APP_ID: '123456789',
  DEFAULT_IMAGE: '/images/og-image.jpg',
} as const;

// Chart Colors
export const CHART_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#EC4899', // Pink
  '#6366F1', // Indigo
] as const;

// Animation Variants for Framer Motion
export const ANIMATION_VARIANTS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  },
  stagger: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
} as const;

export default {
  API_ENDPOINTS,
  STORAGE_KEYS,
  JOB_TYPE_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
  APPLICATION_STATUS_OPTIONS,
  ADMIN_ROLE_OPTIONS,
  SALARY_RANGES,
  COMPANY_SIZES,
  INDUSTRIES,
  CITIES,
  PAGINATION,
  FILE_UPLOAD,
  UI,
  THEMES,
  BREAKPOINTS,
  SOCIAL_LINKS,
  CONTACT_INFO,
  FEATURES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  DATE_FORMATS,
  REGEX,
  META,
  CHART_COLORS,
  ANIMATION_VARIANTS,
};
