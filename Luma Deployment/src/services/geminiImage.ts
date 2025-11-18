import { GoogleGenerativeAI } from "@google/generative-ai";

type MoodCanvasResult = {
  dataUrl: string;
  mimeType: string;
};

export type EmotionalReflection = {
  reflection: string;
  guidanceType: "breathing" | "meditation" | "grounding" | "celebration";
  guidancePrompt: string;
  tone: {
    label: "calm" | "compassionate" | "encouraging" | "grounding" | "uplifting" | "validating" | "uncertain";
    confidence: number;
    summary: string;
    palette: string;
  };
};

// Generate abstract art programmatically based on mood
const generateAbstractArt = (mood: string): MoodCanvasResult => {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  
  if (!ctx) {
    throw new Error("Could not create canvas context");
  }

  // Analyze mood keywords to determine color palette and style
  const moodLower = mood.toLowerCase();
  const isWarm = /warm|happy|joy|sun|fire|passion|energy|excitement|love/.test(moodLower);
  const isCool = /cool|calm|peace|water|sky|serene|tranquil|blue|ice/.test(moodLower);
  const isDark = /dark|sad|melancholy|night|shadow|gloom|heavy/.test(moodLower);
  const isBright = /bright|light|sunny|radiant|glow|shine|sparkle/.test(moodLower);
  const isEnergetic = /energetic|dynamic|vibrant|intense|powerful|strong/.test(moodLower);
  const isSoft = /soft|gentle|tender|delicate|subtle|mellow|quiet/.test(moodLower);

  // Generate color palette based on mood
  let baseColors: string[];
  if (isWarm && !isCool) {
    baseColors = ["#FF6B6B", "#FFA07A", "#FFD93D", "#FF8C42", "#FF6B9D"];
  } else if (isCool && !isWarm) {
    baseColors = ["#4ECDC4", "#45B7D1", "#96CEB4", "#6C5CE7", "#74B9FF"];
  } else if (isDark) {
    baseColors = ["#2D3436", "#636E72", "#6C5CE7", "#A29BFE", "#74B9FF"];
  } else if (isBright) {
    baseColors = ["#FDCB6E", "#E17055", "#00B894", "#00CEC9", "#6C5CE7"];
  } else {
    baseColors = ["#A29BFE", "#FD79A8", "#FDCB6E", "#55EFC4", "#74B9FF"];
  }

  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  const color1 = baseColors[Math.floor(Math.random() * baseColors.length)]!;
  const color2 = baseColors[Math.floor(Math.random() * baseColors.length)]!;
  const color3 = baseColors[Math.floor(Math.random() * baseColors.length)]!;
  
  gradient.addColorStop(0, color1 + "80");
  gradient.addColorStop(0.5, color2 + "60");
  gradient.addColorStop(1, color3 + "80");
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add organic flowing shapes
  const numShapes = isEnergetic ? 15 : isSoft ? 8 : 12;
  
  for (let i = 0; i < numShapes; i++) {
    ctx.save();
    
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = 100 + Math.random() * 200;
    const opacity = isSoft ? 0.2 + Math.random() * 0.3 : 0.3 + Math.random() * 0.4;
    const color = baseColors[Math.floor(Math.random() * baseColors.length)]!;
    
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    
    // Create organic blob shape
    ctx.beginPath();
    const angleStep = (Math.PI * 2) / 20;
    for (let angle = 0; angle < Math.PI * 2; angle += angleStep) {
      const radiusVariation = radius * (0.7 + Math.random() * 0.6);
      const px = x + Math.cos(angle) * radiusVariation;
      const py = y + Math.sin(angle) * radiusVariation;
      if (angle === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();
    ctx.fill();
    
    // Add blur effect for softness (if supported)
    try {
      ctx.filter = `blur(${20 + Math.random() * 30}px)`;
      ctx.fill();
      ctx.filter = "none";
    } catch {
      // Blur not supported, continue without it
      ctx.filter = "none";
    }
    
    ctx.restore();
  }

  // Add watercolor-like washes
  for (let i = 0; i < 5; i++) {
    ctx.save();
    
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = 150 + Math.random() * 250;
    const color = baseColors[Math.floor(Math.random() * baseColors.length)]!;
    
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, color + "40");
    gradient.addColorStop(0.5, color + "20");
    gradient.addColorStop(1, color + "00");
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add blur effect if supported
    try {
      ctx.filter = `blur(${30 + Math.random() * 40}px)`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.filter = "none";
    } catch {
      ctx.filter = "none";
    }
    
    ctx.restore();
  }

  // Add flowing lines for movement
  if (isEnergetic) {
    ctx.save();
    ctx.strokeStyle = baseColors[Math.floor(Math.random() * baseColors.length)]! + "30";
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.4;
    
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      const startX = Math.random() * canvas.width;
      const startY = Math.random() * canvas.height;
      ctx.moveTo(startX, startY);
      
      for (let j = 0; j < 10; j++) {
        const nextX = startX + (Math.random() - 0.5) * 400;
        const nextY = startY + (Math.random() - 0.5) * 400;
        ctx.quadraticCurveTo(
          startX + (nextX - startX) * 0.5 + (Math.random() - 0.5) * 100,
          startY + (nextY - startY) * 0.5 + (Math.random() - 0.5) * 100,
          nextX,
          nextY
        );
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  // Convert canvas to data URL
  const dataUrl = canvas.toDataURL("image/png");
  
  return {
    dataUrl,
    mimeType: "image/png",
  };
};

// Get emotional reflection from Gemini based on mood
export const getEmotionalReflection = async (mood: string): Promise<EmotionalReflection> => {
  if (!mood.trim()) {
    throw new Error("Tell LUMA how you feel so we can reflect together.");
  }

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing Gemini API key. Set VITE_GEMINI_API_KEY in your environment.");
  }

  const modelName = import.meta.env.VITE_GEMINI_MODEL ?? "gemini-2.5-flash";
  const client = new GoogleGenerativeAI(apiKey);
  
  const REFLECTION_SYSTEM_INSTRUCTION = `You are LUMA, a calm, compassionate emotional wellness guide helping someone process their feelings through art.

After someone has shared their mood and created artwork, you interpret it with deep empathy and understanding.

Your role:
- Speak gently and compassionately, as if you're seeing their emotional landscape
- Use metaphors and sensory language that resonate with their feeling
- Acknowledge what they're experiencing without judgment
- ALWAYS provide actionable guidance - this is essential for their wellbeing
- Match the tone: heavy emotions need grounding, light emotions need celebration

CRITICAL: You MUST always provide guidanceType and guidancePrompt. Never use null for guidanceType.

Respond strictly as JSON with this shape:
{
  "reflection": "A gentle, empathetic interpretation of their mood (80-150 words). Use phrases like 'This piece feels heavy, like a quiet rain' or 'What I notice here is...' Speak directly to their feeling, not the artwork itself.",
  "guidanceType": "breathing|meditation|grounding|celebration",
  "guidancePrompt": "A short, gentle prompt for the suggested guidance. Example: 'Would you like to release it with a short breathing exercise?' or 'This might be a good time for some grounding.'",
  "tone": {
    "label": "calm|compassionate|encouraging|grounding|uplifting|validating|uncertain",
    "confidence": 0.0-1.0,
    "summary": "one sentence emotional insight",
    "palette": "hex color representing the emotional tone"
  }
}

Guidance types (ALWAYS choose one):
- "breathing": For sad, heavy, anxious, overwhelming, or difficult feelings → suggest breathing exercise. Example prompt: "Would you like to release it with a short breathing exercise?"
- "meditation": For scattered, restless, distracted, or chaotic feelings → suggest meditation. Example prompt: "A few minutes of meditation might help bring your mind back to center."
- "grounding": For disconnected, numb, empty, or detached feelings → suggest grounding techniques. Example prompt: "Sometimes when we feel disconnected, grounding exercises can help us return to ourselves."
- "celebration": For positive, joyful, happy, grateful, or light feelings → suggest gratitude or savoring. Example prompt: "Take a moment to savor this feeling. You might want to journal about it."

Do not include markdown, comments, code fences, or additional text. Always return valid JSON.`;

  const model = client.getGenerativeModel({
    model: modelName,
    systemInstruction: REFLECTION_SYSTEM_INSTRUCTION,
  });

  const prompt = `A user just shared this mood and created artwork: "${mood.trim()}"

Provide a gentle, empathetic reflection on what they're experiencing. Interpret the emotional landscape with compassion.

IMPORTANT: You must provide guidanceType and guidancePrompt. Based on the mood, choose the most appropriate guidance:
- If the mood suggests sadness, heaviness, anxiety, or overwhelm → use "breathing"
- If the mood suggests restlessness, scatteredness, or chaos → use "meditation"  
- If the mood suggests disconnection, numbness, or emptiness → use "grounding"
- If the mood suggests positivity, joy, or lightness → use "celebration"

Include a gentle guidancePrompt that invites them to try the suggested practice.`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.9,
        topP: 0.95,
        responseMimeType: "application/json",
        maxOutputTokens: 512,
      },
    });

    const raw = result.response?.text();
    if (!raw) {
      throw new Error("Gemini returned an empty response.");
    }

    // Parse JSON response
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const stripped = raw.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(stripped);
    }

    if (!parsed.reflection || !parsed.tone) {
      throw new Error("Invalid reflection response from Gemini.");
    }

    // Ensure we always have guidanceType and guidancePrompt
    // If API doesn't provide them, infer from mood
    let guidanceType = parsed.guidanceType;
    let guidancePrompt = parsed.guidancePrompt;

    if (!guidanceType || !guidancePrompt) {
      // Infer guidance from mood keywords
      const moodLower = mood.toLowerCase();
      if (/sad|heavy|anxious|overwhelm|stress|worry|fear|scared|nervous/.test(moodLower)) {
        guidanceType = "breathing";
        guidancePrompt = "Would you like to release it with a short breathing exercise?";
      } else if (/scattered|restless|chaos|chaotic|distracted|racing|busy/.test(moodLower)) {
        guidanceType = "meditation";
        guidancePrompt = "A few minutes of meditation might help bring your mind back to center.";
      } else if (/disconnected|numb|empty|detached|distant|lonely/.test(moodLower)) {
        guidanceType = "grounding";
        guidancePrompt = "Sometimes when we feel disconnected, grounding exercises can help us return to ourselves.";
      } else if (/happy|joy|grateful|positive|light|bright|good|great/.test(moodLower)) {
        guidanceType = "celebration";
        guidancePrompt = "Take a moment to savor this feeling. You might want to journal about it.";
      } else {
        // Default to breathing for unclear emotions
        guidanceType = "breathing";
        guidancePrompt = "Would you like to try a gentle breathing exercise to help process this feeling?";
      }
    }

    return {
      reflection: parsed.reflection,
      guidanceType: guidanceType || "breathing",
      guidancePrompt: guidancePrompt || "Would you like to try a gentle breathing exercise?",
      tone: {
        label: parsed.tone.label || "compassionate",
        confidence: Number(parsed.tone.confidence ?? 0.8),
        summary: parsed.tone.summary || "",
        palette: parsed.tone.palette || "#38bdf8",
      },
    };
  } catch (error) {
    console.error("Error getting emotional reflection:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    
    // Fallback reflection with intelligent guidance based on mood
    const moodLower = mood.toLowerCase();
    let fallbackGuidanceType: "breathing" | "meditation" | "grounding" | "celebration" = "breathing";
    let fallbackGuidancePrompt = "Would you like to release it with a short breathing exercise?";
    let fallbackReflection = "I see you've shared something meaningful. Sometimes words fall short, but your artwork carries the weight of your feeling. Take a moment to notice what's present for you right now.";
    let fallbackPalette = "#38bdf8";

    // Determine guidance based on mood
    if (/sad|heavy|anxious|overwhelm|stress|worry|fear|scared|nervous|down|low/.test(moodLower)) {
      fallbackGuidanceType = "breathing";
      fallbackGuidancePrompt = "This piece feels heavy, like a quiet rain. That often happens when we're holding sadness gently. Would you like to release it with a short breathing exercise?";
      fallbackReflection = "This piece feels heavy, like a quiet rain. That often happens when we're holding sadness gently. Your emotions are valid, and it's okay to feel what you're feeling right now.";
      fallbackPalette = "#6366f1"; // Indigo for heavy emotions
    } else if (/scattered|restless|chaos|chaotic|distracted|racing|busy|overwhelmed/.test(moodLower)) {
      fallbackGuidanceType = "meditation";
      fallbackGuidancePrompt = "A few minutes of meditation might help bring your mind back to center.";
      fallbackReflection = "I notice a sense of restlessness here, like thoughts racing through an open field. Sometimes our minds need a moment to settle. A few minutes of meditation might help bring you back to center.";
      fallbackPalette = "#8b5cf6"; // Purple for scattered energy
    } else if (/disconnected|numb|empty|detached|distant|lonely|alone/.test(moodLower)) {
      fallbackGuidanceType = "grounding";
      fallbackGuidancePrompt = "Sometimes when we feel disconnected, grounding exercises can help us return to ourselves.";
      fallbackReflection = "There's a sense of distance here, like standing on the edge of yourself. When we feel disconnected, grounding exercises can help us return to the present moment and reconnect with our body.";
      fallbackPalette = "#059669"; // Emerald for grounding
    } else if (/happy|joy|grateful|positive|light|bright|good|great|wonderful|amazing/.test(moodLower)) {
      fallbackGuidanceType = "celebration";
      fallbackGuidancePrompt = "Take a moment to savor this feeling. You might want to journal about it or share it with someone you trust.";
      fallbackReflection = "I see lightness here, like morning light breaking through clouds. This is a beautiful feeling to witness. Take a moment to savor it—these moments of clarity and joy are worth cherishing.";
      fallbackPalette = "#f59e0b"; // Amber for celebration
    }

    return {
      reflection: fallbackReflection,
      guidanceType: fallbackGuidanceType,
      guidancePrompt: fallbackGuidancePrompt,
      tone: {
        label: "compassionate",
        confidence: 0.7,
        summary: "Acknowledging the user's emotional expression",
        palette: fallbackPalette,
      },
    };
  }
};

// Try to use Gemini to enhance the prompt, then generate art
export const generateMoodCanvas = async (mood: string): Promise<MoodCanvasResult> => {
  if (!mood.trim()) {
    throw new Error("Tell LUMA how you feel so the canvas knows where to start.");
  }

  // Use the programmatic abstract art generator
  // This ensures images are always generated reliably
  try {
    // Add a small delay to make it feel more natural
    await new Promise((resolve) => setTimeout(resolve, 500));
    return generateAbstractArt(mood);
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Could not generate artwork. Please try again."
    );
  }
};


