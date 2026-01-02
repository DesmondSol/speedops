
import { GoogleGenAI, Type } from "@google/genai";

/**
 * speedOps Operational Intelligence
 * Model: gemini-2.5-flash-lite-latest
 * Optimized for low latency and high free-tier availability.
 */

export const generateProjectBrief = async (details: any, team: any[]) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite-latest',
      config: {
        systemInstruction: "You are the speedOps Strategic Architect. Generate high-signal Markdown technical briefs. No filler. Precision only. Use standard operational headers.",
        thinkingConfig: { thinkingBudget: 0 }
      },
      contents: `CONTEXT:
      Project: ${details.name}
      Client: ${details.client}
      Purpose: ${details.purpose}
      Personnel: ${team.map(t => `${t.name}(${t.roles.join(',')})`).join('|')}
      
      TASK: Generate (1) Summary (2) Objectives (3) Feature Map (4) Timeline (5) Risk Vectors.`,
    });
    return response.text;
  } catch (error) {
    console.error('Gemini Brief Gen Error:', error);
    return "Operational Error: Brief generation failed. Check neural link.";
  }
};

export const generateTaskBreakdown = async (brief: string, team: any[]) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite-latest',
      config: {
        systemInstruction: "Operational Logician: Convert briefs into JSON work units. Map tasks to the provided Team IDs. Output strictly valid JSON.",
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            features: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  featureName: { type: Type.STRING },
                  tasks: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        assigneeId: { type: Type.STRING },
                        acceptanceCriteria: { type: Type.ARRAY, items: { type: Type.STRING } },
                        startDay: { type: Type.INTEGER },
                        endDay: { type: Type.INTEGER }
                      },
                      required: ['name', 'description', 'assigneeId', 'acceptanceCriteria', 'startDay', 'endDay']
                    }
                  }
                },
                required: ['featureName', 'tasks']
              }
            },
            milestones: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  dayOffset: { type: Type.INTEGER },
                  urgency: { type: Type.STRING }
                },
                required: ['title', 'description', 'dayOffset', 'urgency']
              }
            }
          },
          required: ['features', 'milestones']
        }
      },
      contents: `BRIEF: ${brief}\n\nIDS: ${team.map(t => `${t.id}:${t.name}`).join(',')}`,
    });
    return JSON.parse(response.text || '{"features": [], "milestones": []}');
  } catch (error) {
    console.error('Gemini Breakdown Gen Error:', error);
    return { features: [], milestones: [] };
  }
};
