export const VALIDATION_API_URL = 'https://know-your-fan-backend.onrender.com/api/validate-document';

const monthMap = {
    'jan': '01', 'fev': '02', 'mar': '03', 'abr': '04',
    'mai': '05', 'jun': '06', 'jul': '07', 'ago': '08',
    'set': '09', 'out': '10', 'nov': '11', 'dez': '12'
};

import { formatCpf } from './validation';

export const parseAnalysis = (analysisText) => {
    const result = {
        extractedName: null,
        extractedBirthDate: null,
        extractedCpf: null,
        rawText: null
    };
    console.log("--- PARSE ANALYSIS START (Corrected) ---");
    if (!analysisText) {
        console.log("Analysis text is null or empty, returning empty result.");
        return result;
    }

    console.log("Raw analysisText received:\n", analysisText);
    console.log("------------------------------");

    const lines = analysisText.split('\n');
    const notFoundKeywords = ["não encontrado", "nao encontrado"];
    let currentBlock = null;
    let tempTextBlock = "";

    lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        const cleanLine = trimmedLine.replace(/^[*\-\s]*/, '').replace(/\*\*/g, '');
        const lowerCleanLine = cleanLine.toLowerCase();

        console.log(`[Line ${index}] Processing Clean: "${cleanLine}" (Lower: "${lowerCleanLine}")`);

        if (lowerCleanLine.startsWith('texto extraído:')) {
            currentBlock = 'text';
            console.log(`Detected Block Start: ${currentBlock}`);
            const valueOnLine = cleanLine.substring('Texto Extraído:'.length).trim();
            if (valueOnLine) tempTextBlock += valueOnLine + "\n";
            return;
        }
        if (lowerCleanLine.startsWith('nome encontrado:')) {
            currentBlock = 'name';
            console.log(`Detected Block Start: ${currentBlock}`);
            const value = cleanLine.substring('Nome Encontrado:'.length).trim();
            if (value && !notFoundKeywords.some(keyword => value.toLowerCase().includes(keyword))) {
                result.extractedName = value;
                console.log(`>>> SUCCESS: Set extractedName = ${result.extractedName}`);
            } else {
                console.log(`--- Name value is empty or 'Não encontrado'.`);
            }
            return;
        }
        if (lowerCleanLine.startsWith('data de nascimento encontrada:')) {
            currentBlock = 'date';
            console.log(`Detected Block Start: ${currentBlock}`);
            const value = cleanLine.substring('Data de Nascimento Encontrada:'.length).trim();
            if (value && !notFoundKeywords.some(keyword => value.toLowerCase().includes(keyword))) {
                const dateParts = value.match(/(\d{1,2})\/?(\w{3})\/?(\d{4})/i);
                if (dateParts && dateParts.length === 4) {
                    const day = dateParts[1].padStart(2, '0');
                    const monthAbbr = dateParts[2].toLowerCase();
                    const year = dateParts[3];
                    const monthNum = monthMap[monthAbbr];
                    if (monthNum) {
                        result.extractedBirthDate = `${day}/${monthNum}/${year}`;
                        console.log(`>>> SUCCESS: Set extractedBirthDate = ${result.extractedBirthDate}`);
                    } else { console.warn("--- Could not map month:", monthAbbr); }
                } else {
                    const simpleDateMatch = value.match(/(\d{2})\/(\d{2})\/(\d{4})/);
                    if (simpleDateMatch) {
                        result.extractedBirthDate = value;
                        console.log(`>>> SUCCESS: Set extractedBirthDate (already DD/MM/YYYY) = ${result.extractedBirthDate}`);
                    } else { console.warn("   --- Unrecognized date format:", value); }
                }
            } else { console.log(`--- Birth Date value is empty or 'Não encontrado'.`); }
            return;
        }
        if (lowerCleanLine.startsWith('cpf encontrado:')) {
            currentBlock = 'cpf_label';
            console.log(`Detected Block Start: ${currentBlock}`);
            const value = cleanLine.substring('CPF Encontrado:'.length).trim();
            console.log(`Extracted CPF Value (Label): "${value}"`);
            if (value && !notFoundKeywords.some(keyword => value.toLowerCase().includes(keyword))) {
                const cpfMatch = value.match(/\d{3}\.?\d{3}\.?\d{3}-?\d{2}/);
                if (cpfMatch) {
                    result.extractedCpf = formatCpf(cpfMatch[0]);
                    console.log(`>>> SUCCESS: Set extractedCpf (from label) = ${result.extractedCpf}`);
                } else { console.warn("   --- CPF found with label, but format unrecognized:", value); }
            } else { console.log(`--- CPF (Label) value is empty or 'Não encontrado'.`); }
            return;
        }
        if (lowerCleanLine.startsWith('observações visuais:')) {
            currentBlock = 'observations';
            console.log(`Detected Block Start: ${currentBlock}`);
            return;
        }

        if (currentBlock === 'text' && cleanLine) {
            console.log(`Appending to text block: "${cleanLine}"`);
            tempTextBlock += cleanLine + "\n";
        }
    });

    if (!result.extractedCpf && tempTextBlock) {
        console.log("--- Fallback: Attempting CPF extraction from captured text block ---");
        result.rawText = tempTextBlock.trim();

        const cpfRegex = /CPF[:\s]*?([\d.\-/]+?)(\/(\d{2}))?\b/i;

        const match = result.rawText.match(cpfRegex);

        if (match && match[1] && match[2]) {
            const baseNumberPart = match[1];
            const checkDigitsPart = match[2];

            console.log(`Fallback Regex Match: Base="${baseNumberPart}", CheckDigits="${checkDigitsPart}"`);

            const baseDigitsOnly = baseNumberPart.replace(/\D/g, '');

            const combinedDigits = baseDigitsOnly + checkDigitsPart;

            if (combinedDigits.length === 11) {
                result.extractedCpf = formatCpf(combinedDigits);
                console.log(`   >>> SUCCESS: Set extractedCpf (11 digits combined & formatted) = ${result.extractedCpf}`);
            } else {
                result.extractedCpf = combinedDigits;
                console.warn(`   --- Combined CPF has ${combinedDigits.length} digits (expected 11). Storing raw combined digits: ${result.extractedCpf}`);
            }

        } else {
            console.log("   --- Fallback CPF Regex found no match in text block.");
        }
    } else if (!result.extractedCpf) {
        console.log("--- Fallback: No CPF found via label and no text block captured or searched.")
    }

    console.log("--- PARSE ANALYSIS END --- Final Result:", result);
    return result;
};