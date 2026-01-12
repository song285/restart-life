
export interface Contact {
  id: string;
  name: string;
  phone: string;
  type: 'mobile' | 'home';
}

export interface CheckInStatus {
  lastCheckIn: Date | null;
  nextExpected: string;
}

export interface SettingsState {
  emailNotify: boolean;
  smsNotify: boolean;
  autoAlarm: boolean;
}
