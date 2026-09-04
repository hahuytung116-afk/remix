import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini with recommended properties and telemetry headers
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API endpoint to fetch dynamically generated animal lore
app.post("/api/animal-lore", async (req, res) => {
  const { id, name, rarity, role, isExtinct, skillName } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Animal name is required" });
  }

  const prompt = `Generate atmospheric background lore and habitat info for this creature in our game, Primal Defense:
- Name: ${name}
- Rarity: ${rarity}
- Role: ${role || 'defender'}
- Is Extinct: ${isExtinct ? 'Yes' : 'No'}
- Special Ability: ${skillName || 'None'}

Game Context:
"Primal Realm is a universe where a catastrophic Quantum Rift merged prehistoric epochs, mythic realms, and futuristic cybernetic invaders (the Syndicate Corps). The Syndicate seeks to capture the animals (led by the Chill Sovereign Capybara) to harvest their DNA. The animals use ancient primal energy, divine mutations, and space-time powers to defend their territories."

Create a captivating, rich backstory and specify their habitat in this transformed world.`;

  // List of models to try in sequence
  const modelsToTry = ["gemini-3.7-flash", "gemini-3.6-flash", "gemini-3.1-flash-lite"];
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`Attempting lore generation with model: ${modelName}`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction: "You are an expert game writer for 'Primal Defense: Animal Kingdom'. You write dark-fantasy, sci-fi blended, atmospheric, and highly compelling lore text for animals. Backgrounds should be 2-3 concise, high-impact sentences. Habitats should describe their dwelling or sanctuary in this chronologically-fractured Earth.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              background: { 
                type: Type.STRING, 
                description: "A mysterious or legendary origin/backstory fitting their role and rarity. 2-3 evocative sentences." 
              },
              habitat: { 
                type: Type.STRING, 
                description: "Where they dwell or guard in this chronologically-fractured Earth. 1-2 sentences." 
              }
            },
            required: ["background", "habitat"]
          }
        }
      });

      if (response.text) {
        const data = JSON.parse(response.text.trim());
        console.log(`Successfully generated lore using ${modelName}`);
        return res.json({
          success: true,
          lore: data,
          modelUsed: modelName
        });
      }
    } catch (error: any) {
      console.warn(`Model ${modelName} failed:`, error.message || error);
      lastError = error;
    }
  }

  // If both models fail, fall back to a beautifully synthesized offline backup lore
  console.warn("All Gemini models failed. Activating dynamic offline fallback generator.", lastError);
  
  const formattedRarity = rarity ? rarity.toUpperCase() : "MYSTERIOUS";
  const formattedRole = role ? role.toUpperCase() : "GUARDIAN";
  
  const fallbackBackground = `Echoing from the temporal folds of the Quantum Rift, the ${name} is a legendary ${formattedRarity} being. It harnesses ancient primal energy to wage an unrelenting war against the Syndicate Corps' genetic poachers. Imbued with the power of ${skillName || "nature's wrath"}, its very existence stands as a testament to the untamable spirit of the Primal Realm.`;
  
  const fallbackHabitat = isExtinct 
    ? `Dwells within the sacred Chrono-Shattered Sanctuaries, guarding ancient fossil lines from synthetic desecration.`
    : `Roams the sovereign wild frontiers of the new Earth, defending key tactical Nexus lines from cybernetic intrusions.`;

  return res.json({
    success: true,
    lore: {
      background: fallbackBackground,
      habitat: fallbackHabitat
    },
    modelUsed: "offline_fallback"
  });
});

// Setup Vite dev server or static distribution build serving
async function setupApp() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupApp();
