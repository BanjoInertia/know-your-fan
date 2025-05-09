import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import config from '../config/index.js';

const genAI = new GoogleGenerativeAI(config.geminiApiKey);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

const geminiGenerationConfig = {
    temperature: 0.2,
    topK: 32,
    topP: 1,
    maxOutputTokens: 4096,
};

const geminiSafetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

function bufferToGenerativePart(buffer, mimeType) {
    return {
        inlineData: {
            data: buffer.toString("base64"),
            mimeType
        },
    };
}

async function analyzeDocument(fileBuffer, mimeType) {
    console.log("GEMINI_SERVICE: analyzeDocument iniciado.");
    try {
        const imagePart = bufferToGenerativePart(fileBuffer, mimeType);

        const prompt = `
          **Instrução:** Analise a imagem deste documento de identidade brasileiro.
          1.  **Tipo de Documento:** Identifique (Ex: RG, CNH).
          2.  **Extração de Texto:** Extraia todo o texto visível.
          3.  **Nome Completo:** Encontre o nome completo.
          4.  **Data de Nascimento:** Encontre a data de nascimento no formato DD/MM/AAAA ou DD/MON/YYYY.
          5.  **CPF (11 dígitos):** Encontre o número do CPF. Procure por um número de 11 dígitos associado à sigla CPF. **Se o texto extraído mostrar 9 dígitos seguidos por /00 (ex: 123456789/00), você DEVE usar '00' como os dois últimos dígitos no formato final.** O formato final DEVE ser XXX.XXX.XXX-XX. Ignore quaisquer outros caracteres após os 11 dígitos ou o padrão /00. Se não encontrar 11 dígitos ou o padrão /00, retorne "Não encontrado".
          6.  **Considerações:** Avalie clareza e possíveis adulterações.

            **Exemplo de como tratar o CPF com /00:**
            Texto Extraído contém: CPF 987654321/00
            CPF Encontrado: 987.654.321-00

          **Formato da Resposta Esperada (Use EXATAMENTE este formato):**
          Tipo: [Tipo Identificado ou Não Identificado]
          Texto Extraído: [Lista do texto encontrado]
          Nome Encontrado: [Nome Completo ou "Não encontrado"]
          Data de Nascimento Encontrada: [Data DD/MM/AAAA ou DD/MON/YYYY ou "Não encontrada"]
          CPF Encontrado: [CPF XXX.XXX.XXX-XX (11 dígitos) ou "Não encontrado"]
          Observações Visuais: [Comentários]
        `;

        console.log("GEMINI_SERVICE: Enviando request para Gemini API...");
        const result = await geminiModel.generateContent({
            contents: [{ role: "user", parts: [imagePart, { text: prompt }] }],
            generationConfig: geminiGenerationConfig,
            safetySettings: geminiSafetySettings,
        });
        console.log("GEMINI_SERVICE: Resposta da Gemini API recebida.");

        const responseText = result?.response?.text?.();
        if (!responseText) {
            console.error("Invalid or empty response structure from Gemini API:", result?.response);
            throw new Error('Received an unexpected or empty response from the validation service.');
        }
        console.log("Gemini Response received.");
        return responseText;

    } catch (error) {
        console.error("GEMINI_SERVICE: Erro durante chamada à Gemini API:", error);
        let errorMessage = 'Failed to analyze document via Gemini.';
        let statusCode = 500;

        if (error.message?.includes('quota')) {
            errorMessage = 'Validation service quota exceeded.';
            statusCode = 429;
        } else if (error.message?.includes('SAFETY')) {
            errorMessage = 'Content blocked by Gemini due to safety settings.';
            statusCode = 400;
        } else if (error.message?.includes('unexpected response')) {
            errorMessage = 'Received an unexpected response from the validation service.';
            statusCode = 502;
        }
        const serviceError = new Error(errorMessage);
        serviceError.statusCode = statusCode;
        throw serviceError;
    }
}

export { analyzeDocument };