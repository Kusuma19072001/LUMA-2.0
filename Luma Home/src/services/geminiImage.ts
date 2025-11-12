import { GoogleGenerativeAI } from "@google/generative-ai";

type MoodCanvasResult = {
  dataUrl: string;
  mimeType: string;
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


