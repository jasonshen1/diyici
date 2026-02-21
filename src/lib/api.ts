import axios from 'axios';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Kimi API 响应格式
interface KimiResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function callDeepSeekAPI(
  messages: ChatMessage[],
  model: string = 'deepseek-chat',
  temperature: number = 0.7
): Promise<string> {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
  const apiUrl = import.meta.env.VITE_DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';

  if (!apiKey) {
    throw new Error('DeepSeek API Key is not configured. Please set VITE_DEEPSEEK_API_KEY in .env file.');
  }

  try {
    const response = await axios.post<DeepSeekResponse>(apiUrl, {
      model,
      messages,
      temperature,
      max_tokens: 1000,
      top_p: 0.95,
      frequency_penalty: 0,
      presence_penalty: 0
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });

    const completion = response.data.choices[0].message.content;
    return completion;
  } catch (error) {
    console.error('Error calling DeepSeek API:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      throw new Error(`API Error: ${error.response?.data?.error?.message || 'Unknown error'}`);
    }
    throw new Error('Failed to call DeepSeek API');
  }
}

// Kimi API 调用函数
export async function callKimiAPI(
  messages: ChatMessage[],
  model: string = 'moonshot-v1-8k',
  temperature: number = 0.7
): Promise<string> {
  const apiKey = import.meta.env.VITE_KIMI_API_KEY;
  const apiUrl = import.meta.env.VITE_KIMI_API_URL || 'https://api.moonshot.cn/v1/chat/completions';

  if (!apiKey) {
    throw new Error('Kimi API Key is not configured. Please set VITE_KIMI_API_KEY in .env file.');
  }

  try {
    const response = await axios.post<KimiResponse>(apiUrl, {
      model,
      messages,
      temperature,
      max_tokens: 1000,
      top_p: 0.95,
      frequency_penalty: 0,
      presence_penalty: 0
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });

    const completion = response.data.choices[0].message.content;
    return completion;
  } catch (error) {
    console.error('Error calling Kimi API:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      throw new Error(`API Error: ${error.response?.data?.error?.message || 'Unknown error'}`);
    }
    throw new Error('Failed to call Kimi API');
  }
}

// 通用的提示词构建函数
export function buildPrompt(systemPrompt: string, userInput: string): ChatMessage[] {
  return [
    {
      role: 'system',
      content: systemPrompt
    },
    {
      role: 'user',
      content: userInput
    }
  ];
}
