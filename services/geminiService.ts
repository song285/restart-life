
// 这个服务现在通过后端API调用，保留此文件以保持兼容性
import { api } from './api';

export const getDailyGreeting = async (): Promise<{ greeting: string; subtitle: string }> => {
  try {
    return await api.getDailyGreeting();
  } catch (error) {
    console.error("获取问候失败:", error);
    return { greeting: "早安，你今天也超赞", subtitle: "万物可爱，人间值得。" };
  }
};
