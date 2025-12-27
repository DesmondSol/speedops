
import { GoogleGenAI, Type } from "@google/genai";

export const generateProjectBrief = async (details: any, team: any[]) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Generate a high-fidelity, developer-readable Project Brief based on these operational inputs:
      
      PROJECT DATA:
      Name: ${details.name}
      Client: ${details.client}
      Purpose: ${details.purpose}
      Objectives: ${details.objectives}
      Scope: ${details.scope}
      Features: ${details.features}
      Timeline Goal: ${details.timeline}
      Resources: ${details.resources}
      
      TEAM ASSIGNED:
      ${team.map(t => `- ${t.name} (Roles: ${t.roles.join(', ')})`).join('\n')}
      
      STRUCTURE:
      1. EXECUTIVE SUMMARY
      2. OPERATIONAL OBJECTIVES
      3. ARCHITECTURE & TECHNICAL ASSUMPTIONS
      4. CORE FEATURE MAP
      5. CRITICAL DELIVERY TIMELINE (Detailed schedule with phases)
      6. TEMPORAL MARKERS (Key milestones and their target days)
      7. RISK MITIGATION & CONSTRAINTS
      
      Use sharp, professional language. Focus on temporal precision and technical clarity. Output as Markdown.`,
    });
    return response.text;
  } catch (error) {
    console.error('Gemini Brief Gen Error:', error);
    return "Error generating brief. Please try again.";
  }
};

export const generateTaskBreakdown = async (brief: string, team: any[]) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analyze the following project brief and generate a detailed work breakdown structure (WBS) and a list of temporal markers (milestones).
      
      PROJECT BRIEF:
      ${brief}
      
      AVAILABLE TEAM MEMBERS & ROLES:
      ${team.map(t => `- ${t.name} (ID: ${t.id}, Roles: ${t.roles.join(', ')})`).join('\n')}
      
      INSTRUCTIONS:
      1. Features & Tasks: Group technical tasks into Features. Assign each task to the most appropriate team member ID.
      2. Milestones: Define 3-5 critical milestones with specific day offsets from project start (Day 0).
      
      OUTPUT FORMAT: JSON`,
      config: {
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
                        acceptanceCriteria: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING }
                        },
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
                  urgency: { type: Type.STRING, description: "Low, Medium, or High" }
                },
                required: ['title', 'description', 'dayOffset', 'urgency']
              }
            }
          },
          required: ['features', 'milestones']
        }
      }
    });
    const parsed = JSON.parse(response.text || '{"features": [], "milestones": []}');
    return parsed;
  } catch (error) {
    console.error('Gemini Breakdown Gen Error:', error);
    return { features: [], milestones: [] };
  }
};
