import { GoogleGenAI } from '@google/genai';

export interface TutorialCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
  articles: {
    title: string;
    summary: string;
    keyPoints: string[];
    safetyWarning?: string;
  }[];
}

export const TUTORIAL_CATEGORIES: TutorialCategory[] = [
  {
    id: 'fuel-basics',
    title: 'Fuel Basics',
    icon: 'Fuel',
    description: 'Understanding Petrol vs Diesel, fuel grades, flashpoints, and quality standards.',
    articles: [
      {
        title: 'Petrol vs Diesel: Core Differences',
        summary: 'Petrol (gasoline) and Diesel serve fundamentally distinct combustion cycles. Petrol engines use spark ignition, while diesel engines utilize high-compression auto-ignition.',
        keyPoints: [
          'Petrol is lighter, more volatile, and formulated for high-revving spark-ignition engines.',
          'Diesel has higher energy density per litre (~15% more energy than petrol) and higher thermal efficiency.',
          'Never put petrol in a diesel engine or diesel in a petrol engine. If misfueled, DO NOT start the ignition.',
          'FuelGo enforces strict 1–5L per order for Petrol and 1–10L for Diesel for regulatory and safety compliance.',
        ],
        safetyWarning: 'Misfueling damages high-pressure fuel pumps and injectors. If misfueled, immediately call roadside assistance without turning the key.',
      },
      {
        title: 'BS-VI Emission Standards in India',
        summary: 'All FuelGo fuel is sourced directly from certified bunks conforming to Government of India BS-VI standards.',
        keyPoints: [
          'Sulfur content in BS-VI fuel is capped at 10 parts per million (ppm), an 80% reduction from BS-IV.',
          'Reduces harmful nitrogen oxides (NOx) and particulate matter (PM2.5) significantly.',
          'FuelGo delivery containers are PESO-certified and anti-static to prevent particulate degradation.',
        ],
      },
    ],
  },
  {
    id: 'vehicle-basics',
    title: 'Vehicle Basics',
    icon: 'Car',
    description: 'Vehicle tank care, fuel indicator warnings, and roadside emergency refueling.',
    articles: [
      {
        title: 'Running on Empty: The Hidden Risks',
        summary: 'Driving when your fuel light illuminates stresses your in-tank electric fuel pump and draws tank sediments.',
        keyPoints: [
          'Electric fuel pumps are submerged in fuel which acts as both coolant and lubricant.',
          'Consistently driving on reserve causes fuel pump overheating and premature failure.',
          'FuelGo allows you to schedule delivery or request an emergency 2–5L top-up before getting stranded.',
        ],
      },
      {
        title: 'Fuel Cap & Vapor Lock Management',
        summary: 'Properly sealing your fuel inlet cap prevents hazardous volatile organic compound (VOC) vapor escape.',
        keyPoints: [
          'Listen for 2–3 audible clicks when tightening the fuel tank filler cap.',
          'A loose cap triggers Check Engine Light (P0440 / P0455 EVAP leak codes).',
          'During FuelGo delivery, our certified rider inspects the filler neck seal before dispensing.',
        ],
      },
    ],
  },
  {
    id: 'safety',
    title: 'Safety & Emergency Guidance',
    icon: 'ShieldAlert',
    description: 'Spill handling, fire prevention, statutory storage regulations, and emergency steps.',
    articles: [
      {
        title: 'Fuel Spill Protocols & Immediate Actions',
        summary: 'Immediate actions if fuel spills on vehicle paint, asphalt, or personal clothing.',
        keyPoints: [
          'Extinguish any open flames, cigarettes, or hot electronics immediately within 15 metres.',
          'Do NOT operate electrical switches or start the vehicle engine.',
          'Absorb surface liquid using sand, clay, or certified absorbent mats. Never rinse into municipal drains.',
          'Wash contaminated skin immediately with copious cold water and mild soap.',
        ],
        safetyWarning: 'For active fires or major spills exceeding 10 litres, evacuate upwind and dial 112 / 101 immediately.',
      },
      {
        title: 'Safe Fuel Handling & Anti-Static Discipline',
        summary: 'Static electricity is an invisible ignition source during liquid hydrocarbon transfer.',
        keyPoints: [
          'Always ground yourself by touching the bare metal vehicle chassis before opening the fuel cap.',
          'Do not re-enter the vehicle cabin while fuel is dispensing.',
          'FuelGo riders use grounded, antistatic brass grounding clamps and PESO-compliant containers.',
        ],
      },
    ],
  },
  {
    id: 'ordering-payments',
    title: 'Ordering, Payments & Delivery',
    icon: 'CreditCard',
    description: 'How FuelGo works, transparent breakdown, INR pricing, and MapTiler GPS tracking.',
    articles: [
      {
        title: 'How FuelGo Quantity Limits Protect You',
        summary: 'Why Petrol is restricted to 1–5L and Diesel to 1–10L per order.',
        keyPoints: [
          'Petroleum Act and PESO regulations specify stringent container carrying limits without mobile bulk dispenser licensing.',
          '5L Petrol and 10L Diesel provide optimal range (60–120 km) to reach the nearest fuel station safely.',
          'Prevents illegal backyard storage or hazardous hoarding.',
        ],
      },
      {
        title: 'Transparent Pricing: Fuel Cost vs Rider Charge',
        summary: 'FuelGo never hides delivery charges inside fuel prices. Every rupee is explicitly itemized in INR (₹).',
        keyPoints: [
          'Fuel Cost = Actual litres × Official government pump price per litre.',
          'Rider Charge = Standard fixed fee for PESO-certified courier dispatch and hazardous handling.',
          'Tax = Applicable 5% GST on the service component with clear tax invoice provided immediately.',
          'Payments supported: UPI, Debit/Credit Card, Net Banking, Digital Wallets, and Cash on Delivery (COD).',
        ],
      },
    ],
  },
];

const SAFETY_GUARDRAILS = `
CRITICAL SAFETY & COMPLIANCE RULES:
1. You are the AI Fuel Safety Assistant for FuelGo (built by Team EAGLE).
2. Refuse any queries asking for:
   - How to siphon fuel or bypass vehicle anti-siphoning valves
   - How to store large amounts of fuel in unapproved plastic jugs or domestic premises
   - Dangerous DIY fuel additives, modifications, or hazardous experiments
   - How to modify engines to run on illegal substances
3. For vehicle breakdowns, fires, or leaks, advise immediate call to Emergency Services (112 in India, 101 for Fire) and road assistance.
4. Keep answers concise, factual, safety-first, and polite.
5. Remind users that FuelGo limits are: Petrol 1-5 Litres, Diesel 1-10 Litres per order, prices in Indian Rupees (INR ₹).
6. Always include the disclaimer: "AI guidance is for general informational purposes. Follow local laws, manufacturer instructions, and professional safety guidance."
`;

export async function askFuelAssistant(userQuestion: string): Promise<string> {
  // Check for dangerous keywords first (client-side safety wall)
  const lower = userQuestion.toLowerCase();
  if (
    lower.includes('siphon') ||
    lower.includes('bomb') ||
    lower.includes('molotov') ||
    lower.includes('illegal store') ||
    lower.includes('hoard fuel') ||
    lower.includes('bypass valve')
  ) {
    return `⚠️ Safety Refusal: For safety and legal compliance under the Petroleum Act and PESO guidelines, FuelGo cannot provide instructions on siphoning fuel, unauthorized vehicle tampering, or uncertified fuel storage. Please contact an authorized automotive service center or emergency personnel.\n\n*AI guidance is for general informational purposes. Follow local laws, manufacturer instructions, and professional safety guidance.*`;
  }

  const apiKey =
    (import.meta.env.VITE_GEMINI_API_KEY as string) ||
    (typeof process !== 'undefined' && process.env ? process.env.GEMINI_API_KEY : '') ||
    (typeof window !== 'undefined' ? (window as unknown as { GEMINI_API_KEY?: string }).GEMINI_API_KEY : '') ||
    '';

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${SAFETY_GUARDRAILS}\n\nUser Question: ${userQuestion}`,
              },
            ],
          },
        ],
      });
      const text = response.text;
      if (text) {
        return text;
      }
    } catch {
      // Fallback smoothly to knowledge base
    }
  }

  // Pre-computed high quality expert answers for common fuel and safety queries
  if (lower.includes('petrol vs diesel') || lower.includes('difference between petrol and diesel')) {
    return `**Petrol vs. Diesel Overview:**
• **Combustion:** Petrol engines ignite fuel vapor using spark plugs. Diesel engines compress air to extreme temperatures and auto-ignite when fuel is injected.
• **Energy & Efficiency:** Diesel contains ~15% more energy per litre, offering higher torque and fuel efficiency, while Petrol provides quieter, smoother high-RPM acceleration.
• **FuelGo Limits:** You can order between **1 L and 5 L** of Petrol, and between **1 L and 10 L** of Diesel per order.
• **Never Mix:** If you accidentally put petrol into a diesel car or vice-versa, do not turn on the ignition!

*AI guidance is for general informational purposes. Follow local laws, manufacturer instructions, and professional safety guidance.*`;
  }

  if (lower.includes('spill') || lower.includes('leak') || lower.includes('fire')) {
    return `**🚨 Immediate Fuel Spill & Safety Protocol:**
1. **Evacuate Ignition Sources:** Immediately extinguish all smoking materials, do not use mobile phones or operate switches near the spill.
2. **Do Not Start Ignition:** If fuel spilled near your engine or exhaust, leave the ignition turned completely off.
3. **Absorb Liquid:** Use sand, dry earth, or absorbent rags to soak up the spill. Never flush petroleum hydrocarbons into city storm drains.
4. **Ventilate:** If fuel spilled inside a vehicle trunk or cabin, keep all doors wide open in a well-ventilated outdoor area.
5. **Emergency Contacts:** If there is an active flame or leak near heat sources, call **112 (National Emergency)** or **101 (Fire Service)** immediately.

*AI guidance is for general informational purposes. Follow local laws, manufacturer instructions, and professional safety guidance.*`;
  }

  if (lower.includes('how fuelgo works') || lower.includes('order fuel') || lower.includes('delivery')) {
    return `**How FuelGo Delivery Works:**
1. **Choose Fuel & Quantity:** Choose **Petrol (1–5 L)** or **Diesel (1–10 L)** with instant preset buttons.
2. **Location & Schedule:** Choose "Deliver Now" or schedule for later, and pinpoint your vehicle on our MapTiler live map.
3. **Payment:** Pay securely in INR (₹) via UPI, Debit/Credit Card, Net Banking, or COD.
4. **Live GPS Tracking:** Track your PESO-certified rider live with vehicle number and live ETA.
5. **Mandatory Bunk Proof:** The rider purchases certified fuel from a branded petrol bunk (IOCL, HPCL, BPCL, Shell) and uploads the verified receipt photo before the order can be completed.
6. **Instant Invoice:** Download your GST tax invoice with full cost transparency.

*AI guidance is for general informational purposes. Follow local laws, manufacturer instructions, and professional safety guidance.*`;
  }

  if (lower.includes('limit') || lower.includes('why 5l') || lower.includes('why 10l')) {
    return `**FuelGo Statutory Order Limits:**
• **Petrol:** Minimum 1 Litre, Maximum 5 Litres per order.
• **Diesel:** Minimum 1 Litre, Maximum 10 Litres per order.
• **Why these limits exist:** India's Petroleum and Explosives Safety Organisation (PESO) regulations strictly govern road transit of flammable liquids in portable certified containers. 5L of petrol or 10L of diesel provides 60–120 km of emergency driving range to comfortably reach the nearest commercial petrol station while maintaining absolute road and neighborhood safety.

*AI guidance is for general informational purposes. Follow local laws, manufacturer instructions, and professional safety guidance.*`;
  }

  return `Thank you for asking FuelGo's AI Fuel Assistant.

FuelGo operates with strict safety first:
• Petrol is available in quantities from **1 to 5 Litres**.
• Diesel is available in quantities from **1 to 10 Litres**.
• All deliveries are tracked live on MapTiler GPS and require mandatory petrol bunk purchase proof before delivery completion.
• Always keep fuel containers away from open flames, sparks, and electrical sources.

*AI guidance is for general informational purposes. Follow local laws, manufacturer instructions, and professional safety guidance.*`;
}
