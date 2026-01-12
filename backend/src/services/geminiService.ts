import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const getDailyGreeting = async (): Promise<{ greeting: string; subtitle: string }> => {
  if (!genAI) {
    // 如果没有配置API Key，返回默认问候
    return { 
      greeting: "早安，你今天也超赞", 
      subtitle: "万物可爱，人间值得。" 
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `生成一段简短的中文居家问候，包含主标题（如：早安，你今天也超赞）和副标题（如：万物可爱，人间值得）。
请以JSON格式返回，包含greeting和subtitle两个字段。`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // 尝试解析JSON
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          greeting: parsed.greeting || "早安，你今天也超赞",
          subtitle: parsed.subtitle || "万物可爱，人间值得。"
        };
      }
    } catch (e) {
      console.error('Failed to parse JSON from Gemini response:', e);
    }
    
    // 如果解析失败，返回默认值
    return { 
      greeting: "早安，你今天也超赞", 
      subtitle: "万物可爱，人间值得。" 
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    return { 
      greeting: "早安，你今天也超赞", 
      subtitle: "万物可爱，人间值得。" 
    };
  }
};
