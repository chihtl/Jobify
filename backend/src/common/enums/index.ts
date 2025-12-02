export enum JobType {
  FULL_TIME = 'full-time',
  PART_TIME = 'part-time',
  CONTRACT = 'contract',
  FREELANCE = 'freelance',
}

export enum ExperienceLevel {
  ENTRY = 'entry',
  MID = 'mid',
  SENIOR = 'senior',
  LEAD = 'lead',
}

export enum ApplicationStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export enum AdminRole {
  SUPERADMIN = 'superadmin',
  MODERATOR = 'moderator',
}

export enum UserRole {
  USER = 'user',
  COMPANY = 'company',
  ADMIN = 'admin',
}