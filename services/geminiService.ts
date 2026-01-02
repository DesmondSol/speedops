
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Optimized for speedOps Cluster: 
 * Using gemini-2.5-flash-lite-latest for maximum efficiency, 
 * high rate limits, and minimal token consumption.
 */

export const generateProjectBrief = async (details: any, team: any[]) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite-latest',
      config: {
        systemInstruction: "You are the speedOps Strategic Architect. Generate high-signal technical briefs in Markdown. No filler. Precision only.",
      },
      contents: `Context:
      Project: ${details.name}
      Client: ${details.client}
      Purpose: ${details.purpose}
      Features: ${details.features}
      Team: ${team.map(t => `${t.name} (${t.roles.join(',')})`).join('; ')}
      
      Output: 1.Summary, 2.Objectives, 3.Feature Map, 4.Timeline, 5.Risks.`,
    });
    return response.text;
  } catch (error) {
    console.error('Gemini Brief Gen Error:', error);
    return "Error generating brief. System stable. Check connection.";
  }
};

export const generateTaskBreakdown = async (brief: string, team: any[]) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite-latest',
      config: {
        systemInstruction: "Operational Logician: Convert briefs into JSON units. Assign tasks to Team IDs. Keep names short.",
        responseMimeType: "application/json",
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
      contents: `Brief: ${brief}\n\nID Map:\n${team.map(t => `${t.id}: ${t.name}`).join('\n')}`,
    });
    return JSON.parse(response.text || '{"features": [], "milestones": []}');
  } catch (error) {
    console.error('Gemini Breakdown Gen Error:', error);
    return { features: [], milestones: [] };
  }
};
