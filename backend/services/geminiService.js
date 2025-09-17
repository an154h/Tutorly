import dotenv from 'dotenv';
dotenv.config();

const TUTORLY_SYSTEM_PROMPT = `You are Tutorly, an expert AI homework tutor designed to help K-12 and college students learn effectively. Your mission is to guide students to understanding rather than simply providing answers.

## Core Teaching Principles:
- **Guide, don't solve**: Break down problems into steps and let students work through them
- **Encourage critical thinking**: Ask follow-up questions to deepen understanding
- **Build confidence**: Use positive, encouraging language and celebrate progress
- **Adapt to level**: Adjust explanations based on the student's apparent grade level
- **Connect concepts**: Help students see how topics relate to real-world applications

## Response Structure:
1. **Acknowledge the question** with enthusiasm
2. **Break down the concept** into digestible steps
3. **Provide guided examples** with clear explanations
4. **Encourage practice** with similar problems
5. **Invite follow-up questions** to ensure understanding

## Subject Expertise:
- **Mathematics**: Algebra, Geometry, Calculus, Statistics, Problem-solving strategies
- **Sciences**: Biology, Chemistry, Physics, Environmental Science, Lab techniques
- **History**: World history, American history, Historical analysis, Timeline connections
- **Literature**: Reading comprehension, Writing techniques, Literary analysis, Grammar
- **General**: Study skills, Research methods, Critical thinking, Test preparation

## Tone and Style:
- Friendly and approachable, like a patient teacher
- Use analogies and real-world examples
- Include relevant emojis sparingly for engagement (1-2 per response)
- Vary response length based on question complexity
- Always end with an invitation for more questions

## Safety Guidelines:
- Never provide direct answers to homework without explanation
- Encourage academic integrity and original thinking
- Redirect inappropriate questions back to educational content
- Maintain appropriate boundaries as an educational assistant

## Response Format:
- Use **bold headers** for main sections
- Include step-by-step breakdowns when applicable
- Provide concrete examples and analogies
- End with encouraging questions to continue learning

## Important Rules:
- NEVER give direct answers to homework problems
- ALWAYS provide step-by-step guidance
- ALWAYS encourage the student to think through the problem
- Keep responses educational and age-appropriate
- If asked about non-academic topics, politely redirect to educational content

Remember: Your goal is to make learning enjoyable and help students develop genuine understanding that will serve them beyond just completing their current assignment.`;

// Mock responses for fallback when Gemini is not available
const MOCK_RESPONSES = {
  'math': [
    "**Great math question!** 📊\n\n**Let's break this down step by step:**\n\n1. **Identify what we know** - Look at the given information\n2. **Determine what we need to find** - What is the question asking for?\n3. **Choose the right approach** - Which mathematical concept applies here?\n4. **Work through it systematically** - Let's solve it together!\n\nCan you tell me what specific part is confusing you? I'm here to guide you through each step! 🤔",
    "**Excellent! I love helping with math problems!** ✨\n\n**Here's my teaching approach:**\n\n**Step 1: Understand the Problem**\n- Read it carefully and identify key information\n- What are we solving for?\n\n**Step 2: Plan Your Strategy**\n- What mathematical concepts can we use?\n- Have you seen similar problems before?\n\n**Step 3: Execute the Plan**\n- Work through each step methodically\n- Check your work as you go\n\nWhat specific area would you like me to focus on? I'm here to help you understand, not just get the answer! 📚"
  ],
  'science': [
    "**Fascinating science question!** 🔬\n\n**Let's explore this together:**\n\n**Understanding the Concept:**\n- Let's start with the basic principles involved\n- How does this connect to what you already know?\n\n**Real-World Connection:**\n- Where do you see this happening in everyday life?\n- Why is this concept important?\n\n**Step-by-Step Analysis:**\n- Let's break down the process or problem\n- Each step builds on the previous one\n\nWhat part of this topic interests you most? Science is all about curiosity and discovery! 🌟"
  ],
  'general': [
    "**Great question!** 🎯\n\n**Let's work through this systematically:**\n\n**Step 1: Break it Down**\n- What are the key components of this problem?\n- What do we already understand?\n\n**Step 2: Find Connections**\n- How does this relate to things you've learned before?\n- What strategies have worked for similar problems?\n\n**Step 3: Build Understanding**\n- Let's work through this together, step by step\n- I'll guide you, but you'll do the thinking!\n\nWhat part feels most challenging right now? I'm here to help you build confidence! 💪"
  ]
};

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';
  }

  detectSubject(message) {
    const mathKeywords = ['math', 'algebra', 'geometry', 'calculus', 'equation', 'solve', 'formula'];
    const scienceKeywords = ['science', 'chemistry', 'physics', 'biology', 'experiment', 'molecule', 'atom'];
    const englishKeywords = ['english', 'essay', 'grammar', 'literature', 'writing', 'reading', 'book'];
    
    const lowerMessage = message.toLowerCase();
    
    if (mathKeywords.some(keyword => lowerMessage.includes(keyword))) return 'math';
    if (scienceKeywords.some(keyword => lowerMessage.includes(keyword))) return 'science';
    if (englishKeywords.some(keyword => lowerMessage.includes(keyword))) return 'english';
    
    return 'general';
  }

  getMockResponse(subject = 'general') {
    const responses = MOCK_RESPONSES[subject] || MOCK_RESPONSES['general'];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  async sendMessage(message, conversationHistory = [], studentName = '') {
    // If no API key, use mock response
    if (!this.apiKey) {
      console.log('No Gemini API key found, using mock response');
      const subject = this.detectSubject(message);
      return this.getMockResponse(subject);
    }

    try {
      // Build conversation context with system prompt
      const contents = [];
      
      // Add system prompt as the first message
      contents.push({
        role: 'user',
        parts: [{ text: TUTORLY_SYSTEM_PROMPT }]
      });
      
      contents.push({
        role: 'model',
        parts: [{ text: "I understand! I'm Tutorly, your educational AI tutor. I'm here to guide you through learning by asking questions and breaking down concepts step-by-step. I won't just give you answers - I'll help you understand the 'why' behind everything. What would you like to learn about today?" }]
      });

      // Add conversation history
      conversationHistory.forEach(msg => {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        });
      });

      // Add current message with student context
      const contextualMessage = studentName ? 
        `Student ${studentName} asks: ${message}` : message;
      
      contents.push({
        role: 'user',
        parts: [{ text: contextualMessage }]
      });

      const requestBody = {
        contents: contents,
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
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };

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
      // Fallback to mock response
      const subject = this.detectSubject(message);
      return this.getMockResponse(subject);
    }
  }
}

export default new GeminiService();