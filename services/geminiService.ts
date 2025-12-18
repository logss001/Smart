import { GoogleGenAI, Type } from "@google/genai";
import { Device, Room } from "../types";

export const parseNaturalLanguageCommand = async (
  prompt: string, 
  devices: Device[], 
  rooms: Room[]
) => {
  if (!process.env.API_KEY) {
    console.warn("No API Key provided for Gemini.");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Construct context string
  const deviceState = devices.map(d => 
    `ID: ${d.id}, Name: ${d.name}, Room: ${rooms.find(r => r.id === d.roomId)?.name}, Type: ${d.type}, State: ${d.isOn ? 'ON' : 'OFF'}`
  ).join('\n');

  const systemInstruction = `
    You are a smart home assistant. You control devices based on user commands.
    
    Current Device State:
    ${deviceState}

    Analyze the user's request and return a JSON object with a list of actions to perform.
    Each action should identify the device by ID and specify the new state (isOn) and optionally value (brightness/speed).
    
    If the user asks to turn off/on everything in a room, find all matching devices.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            actions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  deviceId: { type: Type.STRING },
                  isOn: { type: Type.BOOLEAN },
                  value: { type: Type.NUMBER, description: "Optional brightness (0-100) or speed (1-5)" }
                },
                required: ["deviceId", "isOn"]
              }
            },
            replyMessage: {
              type: Type.STRING,
              description: "A short, friendly confirmation message."
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
  return null;
};