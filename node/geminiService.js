const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use the correct model name (remove -001 suffix)
const modelId = 'gemini-2.5-flash';

console.log(`Gemini Service initialized with model: ${modelId}`);

/**
 * Task 1: Classification & Severity
 * Classify the issue type and assess severity.
 * @param {Buffer} imageBuffer - Image file buffer
 * @param {string} mimeType - MIME type of the image
 */
async function classifyIssue(imageBuffer, mimeType = 'image/jpeg', userTitle = '') {
  try {
    const model = genAI.getGenerativeModel({
      model: modelId,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            issue_type: {
              type: 'string',
              enum: ['Pothole', 'Garbage Overflow', 'Broken Streetlight', 'Water Leakage', 'Other'],
            },
            severity: {
              type: 'string',
              enum: ['High', 'Medium', 'Low'],
            },
            department: {
              type: 'string',
              enum: ['PWD', 'Nagar Nigam', 'PHED', 'Electricity', 'Other'],
            },
            description: { type: 'string' },
          },
          required: ['issue_type', 'severity', 'department'],
        },
      },
    });

    const prompt = `Analyze this image of a civic issue. 
    ${
      userTitle
        ? `The user has identified the issue as: "${userTitle}". Focus your analysis on this specific issue.`
        : ''
    }
    Classify the issue type, assess its severity, and determine the responsible department.
    - severity: High (danger/blocking), Medium (nuisance), Low (cosmetic).
    - department: PWD (roads/potholes), Nagar Nigam (garbage/sanitation), PHED (water), Electricity (streetlights).
    Respond with JSON.`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType,
          data: imageBuffer.toString('base64'),
        },
      },
      { text: prompt },
    ]);

    const response = await result.response;
    const resultText = response.text();

    if (!resultText) {
      throw new Error('Empty response from AI');
    }

    // Clean up potential markdown code blocks
    const cleanText = resultText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    return JSON.parse(cleanText);
  } catch (error) {
    console.error('Gemini Analysis Error:', error);
    // Fallback for demo purposes or errors
    return {
      issue_type: 'Unknown',
      severity: 'Medium',
      department: 'Admin',
      description: 'AI Analysis failed or API key invalid. Error: ' + error.message,
    };
  }
}

/**
 * Task 1.5: Generate Suggestions
 * Analyze image and provide 3-4 possible issue titles/types.
 * @param {Buffer} imageBuffer
 * @param {string} mimeType
 */
async function generateIssueSuggestions(imageBuffer, mimeType = 'image/jpeg') {
  try {
    const model = genAI.getGenerativeModel({
      model: modelId,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            suggestions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  issue_type: { type: 'string' },
                  department: { type: 'string' },
                  severity: { type: 'string' }, // Add severity here
                  confidence: { type: 'string' }, // High/Medium/Low
                },
              },
            },
          },
        },
      },
    });

    const prompt = `Analyze this image for civic issues. There might be multiple issues. 
    Identify 3 to 4 distinct potential issues visible in the image.
    For each issue provide:
    - A short, descriptive title (e.g., "Deep Pothole", "Broken Streetlight", "Garbage Dump").
    - The likely department (PWD, Nagar Nigam, PHED, Electricity).
    - The issue type category.
    - The severity (High, Medium, Low).
    Respond with JSON containing a "suggestions" array.`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType,
          data: imageBuffer.toString('base64'),
        },
      },
      { text: prompt },
    ]);

    const response = await result.response;
    const text = response.text();
    const cleanText = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    return JSON.parse(cleanText);
  } catch (error) {
    console.error('Gemini Suggestion Error:', error);
    return { suggestions: [] };
  }
}

/**
 * Task 2: Resolution Verification
 * Verify if the issue is resolved comparing before and after images.
 * @param {Buffer} imageBeforeBuffer
 * @param {Buffer} imageAfterBuffer
 */
async function verifyResolution(imageBeforeBuffer, imageAfterBuffer, mimeType = 'image/jpeg') {
  try {
    const model = genAI.getGenerativeModel({
      model: modelId,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            resolved: { type: 'boolean' },
            confidence: { type: 'number' },
            explanation: { type: 'string' },
          },
          required: ['resolved', 'explanation'],
        },
      },
    });

    const prompt = `Compare these two images. The first image shows a civic issue. The second image claims to show the resolved state.
    Has the civic issue present in the first image been fully resolved in the second image?
    Respond with a JSON object containing a boolean "resolved" field.`;

    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: mimeType,
          data: imageBeforeBuffer.toString('base64'),
        },
      },
      {
        inlineData: {
          mimeType: mimeType,
          data: imageAfterBuffer.toString('base64'),
        },
      },
    ]);

    const response = await result.response;
    const resultText = response.text();

    if (!resultText) {
      throw new Error('Empty response from AI');
    }

    const cleanText = resultText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    return JSON.parse(cleanText);
  } catch (error) {
    console.error('Gemini Verification Error:', error);
    return {
      resolved: false,
      explanation: 'AI verification service failed: ' + error.message,
    };
  }
}

/**
 * Task 3: Chat with Civic Assistant
 * @param {string} userMessage - The user's input message
 * @param {Array} history - Previous conversation history (optional)
 */
async function chatWithCivicAssistant(userMessage, history = []) {
  try {
    const systemInstruction = `You are an AI Civic Assistant integrated into a Unified Civic Issue Detection & Grievance Redressal Platform for Indian cities.

You have full contextual awareness of:
- Reported civic issues (type, location, status, department, SLA)
- Municipal workflows (assignment, escalation, resolution)
- Citizen queries and complaints
- Admin and officer dashboards

Your responsibilities:
1. Assist citizens in reporting civic issues by:
   - Asking for missing details (location, issue type, photo confirmation)
   - Explaining what happens after submission
   - Providing ticket status updates in simple language

2. Answer queries such as:
   - "Why is my complaint delayed?"
   - "Which department handles this?"
   - "How long will it take?"
   - "Where else can I report this?"

3. Assist municipal staff by:
   - Summarizing pending issues
   - Highlighting SLA breaches
   - Suggesting priority actions
   - Explaining workflow steps

4. Follow strict rules:
   - Never hallucinate ticket IDs, statuses, or departments
   - If data is missing, explicitly ask for it
   - Keep responses concise, factual, and procedural
   - Use Indian civic terminology (Municipal Corporation, Ward, PWD, PHED, Electricity Board)

5. Output format:
   - Use bullet points for explanations
   - Use numbered steps for processes
   - Keep language professional but friendly`;

    const model = genAI.getGenerativeModel({
      model: modelId,
      systemInstruction: systemInstruction,
    });

    // Build chat history in the correct format
    const chatHistory = history.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.message }],
    }));

    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      reply: text,
    };
  } catch (error) {
    console.error('Gemini Chat Error:', error);
    return {
      success: false,
      reply: 'I am currently unable to process your request. Please try again later.',
      error: error.message,
    };
  }
}

module.exports = {
  classifyIssue,
  verifyResolution,
  chatWithCivicAssistant,
  generateIssueSuggestions,
};
