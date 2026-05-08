import { GoogleGenAI } from "@google/genai";

// Standard way to initialize Gemini as per skill instructions
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function suggestTags(content: string): Promise<string[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Aja como um especialista sênior em Cloud Computing e AWS. 
              Sua tarefa é ler o post de blog abaixo e realizar uma EXTRAÇÃO EXAUSTIVA de tags para um catálogo de cases de sucesso.
              
              Busque o máximo de tags possíveis nas seguintes categorias:
              1. **Tema**: IA, FinOps, Data & Analytics, Modernização, Migração, SaaS, Serverless, Containers, Segurança, Governança, Cloud Native.
              2. **Tipo de Empresa**: Startup, SMB, Enterprise, ISV, Unicórnio.
              3. **Serviços AWS**: Extraia TODOS os nomes de serviços AWS mencionados ou claramente utilizados (ex: Lambda, Bedrock, S3, EC2, SageMaker, Aurora, Glue, QuickSight, Athena, DynamoDB, etc). 
              4. **Setor**: Fintech, Varejo (Retail), Saúde (Healthcare), Educação (EdTech), Indústria (Manufacturing), Governo, Logística, Agronegócio, Entretenimento.
              5. **Tipo de Solução/Resultado**: Otimização de Custos, Alta Disponibilidade, IA Generativa, DevOps, Big Data, Disaster Recovery, Escalabilidade, Performance.
              
              REGRAS CRÍTICAS:
              - Retorne APENAS a lista de tags separadas por vírgula.
              - Seja exaustivo: se o texto menciona ou implica uma tecnologia ou setor, inclua a tag.
              - Não use markdown, não explique nada, não dê títulos.
              
              Conteúdo:
              ${content.substring(0, 15000)}`
            }
          ]
        }
      ],
      config: {
        temperature: 0.2,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 500,
        responseMimeType: "text/plain",
      },
    });

    const text = response.text || "";
    if (!text.trim()) return [];

    return text
      .split(",")
      .map(tag => tag.trim().replace(/[.*+?^${}()|[\]\\]/g, ""))
      .filter(tag => tag.length > 0 && tag.length < 40);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
