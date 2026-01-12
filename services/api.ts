const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: '请求失败' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // 打卡相关
  async createCheckIn(userId?: string) {
    return this.request('/checkin', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async getCheckInStats(userId?: string) {
    const params = userId ? `?userId=${userId}` : '';
    return this.request(`/checkin/stats${params}`);
  }

  async getLastCheckIn(userId?: string) {
    const params = userId ? `?userId=${userId}` : '';
    return this.request(`/checkin/last${params}`);
  }

  async hasCheckedInToday(userId?: string) {
    const params = userId ? `?userId=${userId}` : '';
    return this.request(`/checkin/today${params}`);
  }

  // 设置相关
  async getSettings(userId?: string) {
    const params = userId ? `?userId=${userId}` : '';
    return this.request(`/settings${params}`);
  }

  async updateSettings(settings: any, userId?: string) {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify({ ...settings, userId }),
    });
  }

  // 联系人相关
  async getContacts(userId?: string) {
    const params = userId ? `?userId=${userId}` : '';
    return this.request(`/contacts${params}`);
  }

  async createContact(contact: { name: string; phone: string; type: 'mobile' | 'home' }, userId?: string) {
    return this.request('/contacts', {
      method: 'POST',
      body: JSON.stringify({ ...contact, userId }),
    });
  }

  async updateContact(id: string, contact: Partial<{ name: string; phone: string; type: 'mobile' | 'home' }>) {
    return this.request(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contact),
    });
  }

  async deleteContact(id: string) {
    return this.request(`/contacts/${id}`, {
      method: 'DELETE',
    });
  }

  // 问候相关
  async getDailyGreeting() {
    return this.request('/greeting');
  }
}

export const api = new ApiClient();
