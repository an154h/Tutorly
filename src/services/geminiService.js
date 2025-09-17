import { GEMINI_CONFIG } from '../config/api.js';

class GeminiService {
  constructor() {
    this.apiKey = GEMINI_CONFIG.apiKey;
    this.apiUrl = GEMINI_CONFIG.apiUrl;
  }

  async sendMessage(message, context = []) {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Build conversation context
    const conversationHistory = context.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // Add current message
    conversationHistory.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const requestBody = {
      contents: conversationHistory,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    try {
      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  }

  // Enhanced prompts for educational context
  buildEducationalPrompt(message, studentName = '', subject = '') {
    const systemPrompt = `You are Tutorly AI, a friendly and knowledgeable educational assistant. You help students learn by:
    - Explaining concepts clearly and step-by-step
    - Providing examples and analogies
    - Asking follow-up questions to check understanding
    - Encouraging learning and critical thinking
    - Being patient and supportive
    
    ${studentName ? `The student's name is ${studentName}.` : ''}
    ${subject ? `Focus area: ${subject}` : ''}
    
    Student question: ${message}`;
    
    return systemPrompt;
  }
}

export default new GeminiService();