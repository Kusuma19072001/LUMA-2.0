import { GoogleGenerativeAI } from "@google/generative-ai";

const DEFAULT_IMAGE_MODEL = "gemini-2.5-flash";

const IMAGE_SYSTEM_INSTRUCTION = `You render soft, abstract artworks that interpret emotions.
- Favor dreamy gradients, gentle brush strokes, watercolor textures, and organic forms.
- Avoid literal objects, text, faces, or symbols.
- Balance warm and cool palettes based on the mood description.`;

type MoodCanvasResult = {
  dataUrl: string;
  mimeType: string;
};

const getClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing Gemini API key. Set VITE_GEMINI_API_KEY in your environment."
    );
  }
  return new GoogleGenerativeAI(apiKey);
};

export const generateMoodCanvas = async (mood: string): Promise<MoodCanvasResult> => {
  if (!mood.trim()) {
    throw new Error("Tell LUMA how you feel so the canvas knows where to start.");
  }

  const modelName = import.meta.env.VITE_GEMINI_IMAGE_MODEL ?? DEFAULT_IMAGE_MODEL;
  const client = getClient();
  const model = client.getGenerativeModel({
    model: modelName,
    systemInstruction: IMAGE_SYSTEM_INSTRUCTION,
  });

  const prompt = `Mood description: "${mood.trim()}"

Create one soft, abstract digital painting that reflects this emotional tone.
- Use ethereal gradients, layered color washes, and flowing shapes.
- Convey the feeling through palette, rhythm, and light.
- Do not add recognizable objects, words, or symbols.
- Provide the artwork as a single PNG image.`;

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.95,
      topP: 0.9,
      responseMimeType: "image/png",
    },
  });

  const imagePart = result.response?.candidates?.[0]?.content?.parts?.find(
    (part) => part.inlineData
  );

  const inlineData = imagePart?.inlineData;
  if (!inlineData?.data || !inlineData.mimeType) {
    throw new Error("Gemini did not return artwork—please try again.");
  }

  const dataUrl = `data:${inlineData.mimeType};base64,${inlineData.data}`;

  return {
    dataUrl,
    mimeType: inlineData.mimeType,
  };
};


