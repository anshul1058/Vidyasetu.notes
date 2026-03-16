// ai-service.js — calls Gemini API directly from the browser

const GEMINI_API_KEY = "AIzaSyCslBloXXXoC43FHrOEMvkBLP6Akq8maOw";
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

async function callGemini(prompt) {
  const res = await fetch(`${GEMINI_URL}?key=${encodeURIComponent(GEMINI_API_KEY)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.error("Gemini API error:", res.status, errBody);
    if (res.status === 401 || res.status === 403) {
      throw new Error("Gemini API key is invalid or expired.");
    } else if (res.status === 429) {
      throw new Error("Gemini API rate limit exceeded. Please try again in a moment.");
    } else if (res.status === 400) {
      throw new Error("Invalid request to Gemini API. The text might be too short or invalid.");
    } else {
      throw new Error(`Gemini API request failed with status ${res.status}.`);
    }
  }

  const data = await res.json();
  const text =
    data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim() ?? "";
  return text;
}

/**
 * Extract text from PDF using pdf.js (client-side only)
 */
export const extractTextFromPDF = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    if (typeof pdfjsLib === "undefined") {
      throw new Error("PDF.js library is not loaded.");
    }
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs";
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    const maxPages = Math.min(pdf.numPages, 5);
    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      fullText += textContent.items.map((item) => item.str).join(" ") + "\n";
    }
    return fullText;
  } catch (error) {
    console.error("Error extracting PDF text:", error);
    throw new Error("Could not read PDF file.");
  }
};

export const generateSummary = async (text) => {
  console.log("generateSummary called, text length:", text?.length || 0);
  const truncated = (text || "").substring(0, 30000);
  const prompt = `You are an expert tutor. Summarize the following study material text. Make it clear, concise, and easy for a student to understand. Keep it under 150 words. Format your response in simple markdown (use **bold** for emphasis).\n\nTEXT:\n${truncated}`;
  return await callGemini(prompt);
};

export const generateNotes = async (text) => {
  console.log("generateNotes called, text length:", text?.length || 0);
  const truncated = (text || "").substring(0, 30000);
  const prompt = `You are an expert tutor. Extract the 4-6 most important key concepts or facts from the following text. Provide them as a bulleted list of short notes. Format your response in clean markdown.\n\nTEXT:\n${truncated}`;
  return await callGemini(prompt);
};

export const generateQuiz = async (text) => {
  console.log("generateQuiz called, text length:", text?.length || 0);
  const truncated = (text || "").substring(0, 30000);
  const prompt = `Create 3–5 multiple-choice or short-answer questions based on the key concepts in the following text. Include the correct answer directly below each question in *italics*. Format everything in markdown.\n\nTEXT:\n${truncated}`;
  return await callGemini(prompt);
};

export const generateMindMapData = async (text) => {
  console.log("generateMindMapData called, text length:", text?.length || 0);
  const truncated = (text || "").substring(0, 30000);
  const prompt = `Analyze the following study material text and extract exactly 6 key distinct concepts to form a mind map. You must output ONLY raw, valid JSON. Do NOT include markdown backticks or any other text.

The JSON structure MUST exactly match this format:
{"title": "Main Topic","left":[{"title": "Concept 1", "desc": "10-15 word description."},{"title": "Concept 2", "desc": "10-15 word description."},{"title": "Concept 3", "desc": "10-15 word description."}],"right":[{"title": "Concept 4", "desc": "10-15 word description."},{"title": "Concept 5", "desc": "10-15 word description."},{"title": "Concept 6", "desc": "10-15 word description."}]}

Keep "title" short (1-3 words). Keep "desc" concise (1-2 short sentences).

TEXT:\n${truncated}`;

  let raw = await callGemini(prompt);
  if (raw.startsWith("```json")) raw = raw.slice(7);
  if (raw.startsWith("```")) raw = raw.slice(3);
  if (raw.endsWith("```")) raw = raw.slice(0, -3);
  raw = raw.trim();
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse mind map JSON:", raw);
    throw new Error("AI returned invalid mind map format.");
  }
};

export const askFollowUpQuestion = async (text, question) => {
  console.log("askFollowUpQuestion called, text length:", text?.length || 0, "question:", question);
  const truncated = (text || "").substring(0, 30000);
  const prompt = `You are an AI study assistant helping a student with a PDF they uploaded. Use ONLY the following text content as your source of truth, and then answer the follow-up question. If the answer is unclear from the text, say so honestly.\n\nPDF TEXT:\n${truncated}\n\nSTUDENT QUESTION:\n${question}`;
  return await callGemini(prompt);
};
