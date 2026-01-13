// 使用相对路径，通过 Nginx 代理，避免跨域问题
// 如果设置了 VITE_API_URL 环境变量，则使用环境变量，否则使用相对路径
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// 生成或获取设备ID（存储在 localStorage）
function getDeviceId(): string {
  const STORAGE_KEY = 'restart-life-device-id';
  let deviceId = localStorage.getItem(STORAGE_KEY);
  
  if (!deviceId) {
    // 生成新的设备ID（使用时间戳 + 随机字符串）
    deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(STORAGE_KEY, deviceId);
    console.log('✅ 生成新设备ID:', deviceId);
  }
  
  return deviceId;
}

class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const deviceId = getDeviceId();
    
    // 调试日志（生产环境也输出设备ID）
    console.log(`📤 API请求: ${endpoint}`, { deviceId, url });
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-device-id': deviceId, // 发送设备ID到后端
        ...options?.headers,
      },
      // 禁用缓存，确保每次请求都是最新的
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: '请求失败' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // 打卡相关（不再需要 userId 参数，后端自动识别）
  async createCheckIn() {
    return this.request('/checkin', {
      method: 'POST',
    });
  }

  async getCheckInStats() {
    return this.request('/checkin/stats');
  }

  async getLastCheckIn() {
    return this.request('/checkin/last');
  }

  async hasCheckedInToday() {
    return this.request('/checkin/today');
  }

  // 设置相关（不再需要 userId 参数）
  async getSettings() {
    return this.request('/settings');
  }

  async updateSettings(settings: any) {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // 联系人相关（不再需要 userId 参数）
  async getContacts() {
    return this.request('/contacts');
  }

  async createContact(contact: { name: string; phone: string; type: 'mobile' | 'home' }) {
    return this.request('/contacts', {
      method: 'POST',
      body: JSON.stringify(contact),
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
