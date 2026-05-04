import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const suggestTags = async (content: string): Promise<string[]> => {
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is missing");
    return [];
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        Analise o conteúdo de um post de blog de tecnologia e sugira tags relevantes para um catálogo de cases de sucesso.
        Retorne apenas uma lista de tags separadas por vírgula, sem explicações.
        
        Categorias desejadas:
        - Tema (IA, FinOps, Data, Modernização, SaaS, etc.)
        - Tipo de empresa (Startup, SMB, Enterprise, ISV)
        - Serviços AWS (EC2, S3, Lambda, Bedrock, SageMaker, etc.)
        - Setor (Fintech, Varejo, Saúde, Indústria, etc.)
        - Tipo de solução (Otimização de custos, Arquitetura, IA generativa, etc.)

        Conteúdo:
        ${content}
      `,
    });

    const text = response.text || "";
    return text.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0);
  } catch (error) {
    console.error("Error generating tags:", error);
    return [];
  }
};
