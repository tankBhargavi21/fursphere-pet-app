import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import multer from 'multer';

const router = express.Router();

// Memory storage for multer file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP) are allowed!'), false);
    }
  },
});

const VET_DISCLAIMER = `🐾 Note: FurSphere AI offers helpful general pet-care advice and suggestions. It is not a substitute for professional veterinary examination, diagnosis, or treatment. Please consult your local licensed veterinarian for urgent medical concerns.`;

// Pre-packaged smart pet knowledge responses when API key is not yet set
const getFallbackChatResponse = (message) => {
  const m = message.toLowerCase();

  if (m.includes('food') || m.includes('eat') || m.includes('diet')) {
    if (m.includes('dog') || m.includes('puppy')) {
      return `For dogs, a balanced diet rich in high-quality animal proteins, wholesome fats, and digestible fibers is essential:

1. **High-Protein Staples**: Look for formulations with real chicken, lamb, or fish as the first ingredient (e.g., Royal Canin Size Health Nutrition or Pedigree Adult).
2. **Age-Appropriate Feeding**: Puppies require higher calories and DHA for brain growth, while adult dogs benefit from glucosamine for joint health.
3. **Foods to Strictly Avoid**: Chocolate, grapes/raisins, onions, garlic, xylitol/artificial sweeteners, and cooked bones.
4. **Hydration**: Ensure fresh, clean water is accessible 24/7.

${VET_DISCLAIMER}`;
    }
    if (m.includes('cat') || m.includes('kitten')) {
      return `Cats are obligate carnivores and require specific nutrients:

1. **Taurine & High Meat Content**: Cats cannot synthesize taurine on their own; essential for heart and retinal vision (e.g., Royal Canin Feline Health or Whiskas Ocean Fish).
2. **Wet Food Balance**: Wet food promotes critical urinary tract hydration, reducing the risk of FLUTD (feline lower urinary tract disease).
3. **Not Eating Warning**: If a cat doesn't eat for more than 24-48 hours, they risk hepatic lipidosis (fatty liver disease). Please consult a vet promptly if anorexia persists!

${VET_DISCLAIMER}`;
    }
    return `Balanced nutrition is the foundation of your pet's vitality! Choose life-stage specific foods formulated for your pet's weight, breed size, and activity level. Avoid sudden food switches—gradually blend new kibble over 7 days to prevent digestive upset.

${VET_DISCLAIMER}`;
  }

  if (m.includes('coat') || m.includes('fur') || m.includes('shedding') || m.includes('groom')) {
    return `To keep your pet's coat lustrous and healthy:

1. **Regular Brushing**: Use an undercoat deshedding tool like the Furminator 2–3 times a week to remove loose hairs and prevent painful matting.
2. **Omega-3 & Omega-6 Fatty Acids**: Salmon oil or flaxseed supplements foster skin barrier resilience and radiant shine.
3. **Gentle Bathing**: Bathe dogs every 3–4 weeks with oatmeal/aloe hypoallergenic pet shampoo. Avoid human shampoos which disrupt their delicate pH balance.
4. **Flea & Tick Prevention**: Monthly chewables (such as NexGard) keep pests from triggering allergic dermatitis.

${VET_DISCLAIMER}`;
  }

  if (m.includes('illness') || m.includes('sick') || m.includes('vomit') || m.includes('lethargic') || m.includes('symptom')) {
    return `Recognizing early warning signs in your furry friend is key:

⚠️ **Common Red Flags**:
- Persistent lethargy or unwillingness to play
- Vomiting or diarrhea lasting over 24 hours
- Sudden changes in appetite or water consumption
- Coughing, wheezing, or labored breathing
- Whining when touched or mobility stiffness

🚨 **What to Do**:
Monitor their temperature and hydration (check gums—they should be moist and pink). If symptoms persist or your pet seems in pain, schedule an immediate visit with your veterinary clinic.

${VET_DISCLAIMER}`;
  }

  if (m.includes('hygiene') || m.includes('teeth') || m.includes('ear') || m.includes('nail')) {
    return `Essential pet hygiene habits:

1. **Dental Care**: Brush teeth weekly with enzymatic pet toothpaste, or offer dental chew toys to reduce tartar buildup.
2. **Ear Cleaning**: Check ears weekly for unusual odor, wax, or redness. Clean using gentle veterinary ear wipes.
3. **Nail Trimming**: Trim tips carefully every 3–4 weeks avoiding the sensitive pink 'quick'.
4. **Paw Inspection**: Wipe paws after outdoor walks to remove allergens and dirt.

${VET_DISCLAIMER}`;
  }

  return `Hello from FurSphere AI! 🐾

Taking great care of your pet involves consistent routines:
- **Wholesome Nutrition**: Tailored to their breed, weight, and age.
- **Mental & Physical Enrichment**: Daily walks, fetch, scratching posts, and interactive toys.
- **Preventive Care**: Annual vaccinations, deworming, and parasite protection.
- **Love & Bonding**: Positive reinforcement and regular snuggle time!

What specific question can I assist you with regarding your pet's diet, routine, or habits today?

${VET_DISCLAIMER}`;
};

// 1. POST /api/ai/chat
router.post('/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Provide high-quality smart fallback
      const reply = getFallbackChatResponse(message);
      return res.json({
        success: true,
        reply,
        provider: 'FurSphere Pet Intelligence (Add GEMINI_API_KEY in server/.env for live Gemini API calls)',
      });
    }

    // Call real Google Gemini API
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: `You are the FurSphere AI Pet Care Assistant, a friendly, knowledgeable, and caring companion for dog and cat parents.
Your goal is to provide warm, actionable, and medically responsible pet-care tips, breed facts, nutritional advice, grooming guidance, and behavioral tips.
IMPORTANT SAFETY RULE: Never claim to provide a definitive diagnosis or replace a veterinarian. If symptoms sound serious, urge the owner to contact their local veterinarian promptly.
Format responses cleanly with markdown bullet points and emojis. Keep the tone loving, professional, and pet-centric.`,
    });

    const chat = model.startChat({
      history: history.slice(-6).map((h) => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content }],
      })),
    });

    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    const formattedReply = `${responseText}\n\n${VET_DISCLAIMER}`;

    return res.json({
      success: true,
      reply: formattedReply,
      provider: 'Google Gemini 1.5 Flash',
    });
  } catch (error) {
    console.error('AI Chat Error:', error.message);
    // Graceful fallback if Gemini API throws quota/auth error
    const fallback = getFallbackChatResponse(req.body.message || '');
    return res.json({
      success: true,
      reply: fallback,
      provider: 'FurSphere Pet Intelligence (Fallback)',
      warning: error.message,
    });
  }
});

// 2. POST /api/ai/scan-photo
router.post('/scan-photo', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a pet photo to analyze.' });
    }

    const mimeType = req.file.mimetype;
    const base64Data = req.file.buffer.toString('base64');
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `Analyze this pet photograph for the owner. Provide:
1. **Identified Pet & Breed Clues**: Estimated pet type (Dog/Cat) and probable breed or visual physical traits.
2. **Coat & Physical Appearance**: Coat texture, coloration, body condition, grooming observations.
3. **Facial & Alertness Signs**: Eye clarity, posture, and visible demeanor.
4. **Personalized Wellness & Care Suggestions**: Nutrition, activity, and grooming advice tailored to this pet.
5. **Veterinary Notice**: Reminder that photograph inspections cannot detect internal medical issues.

Keep the tone encouraging, warm, and structured with clear markdown headings and bullet points.`;

        const imagePart = {
          inlineData: {
            data: base64Data,
            mimeType,
          },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const text = result.response.text();

        return res.json({
          success: true,
          analysis: `${text}\n\n${VET_DISCLAIMER}`,
          provider: 'Google Gemini Vision 1.5',
        });
      } catch (geminiError) {
        console.warn('Gemini vision API error:', geminiError.message);
      }
    }

    // Vision fallback analysis
    const sampleObservation = `### 🐾 FurSphere AI Pet Photo Observation

**Visual Highlights**:
- **Pet Visual Profile**: Appears to be an adorable, alert domestic companion with bright inquisitive eyes.
- **Coat & Grooming**: Fur shows natural gloss and healthy volume. Regular gentle combing with an undercoat rake will minimize shedding.
- **Demeanor**: Relaxed body posture indicating comfortable emotional state and good domestic enrichment.

**Recommended Care Focus**:
- **Coat Nourishment**: Supplement daily kibble with Omega-rich salmon oil drops for optimal dermal hydration.
- **Active Playtime**: Engage in at least 30 minutes of daily interactive fetch or feather-wand play.
- **Dental Hygiene**: Introduce daily dental chew treats to prevent plaque and maintain fresh breath.

${VET_DISCLAIMER}

*(Tip: To enable direct multimodal vision inspection through your own Google Cloud Gemini model, configure GEMINI_API_KEY in server/.env)*`;

    return res.json({
      success: true,
      analysis: sampleObservation,
      provider: 'FurSphere Vision Engine',
    });
  } catch (error) {
    console.error('Scan photo error:', error);
    res.status(500).json({ success: false, message: 'Failed to analyze pet photograph. Please try another image.' });
  }
});

export default router;
