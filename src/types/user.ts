export type UserRole = "user" | "editor" | "admin" | "super_admin";

export interface Profile {
  id: string;
  fullName?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  role: UserRole;
  marketingOptIn: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  achievement: Achievement;
  earnedAt: string;
}
