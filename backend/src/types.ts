export interface User {
  id: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface CheckIn {
  id: string;
  user_id: string;
  checkin_time: string;
  created_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  email_notify: boolean;
  sms_notify: boolean;
  auto_alarm: boolean;
  alarm_threshold_hours: number;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface EmergencyContact {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  type: 'mobile' | 'home';
  created_at: string;
  updated_at: string;
}

export interface CheckInStats {
  weeklyTotal: number;
  weeklyData: Array<{ name: string; count: number }>;
  consecutiveDays: number;
  lastCheckIn: string | null;
  nextExpected: string;
}
