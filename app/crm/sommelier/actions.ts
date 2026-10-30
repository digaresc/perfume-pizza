"use server";

// The Scent Sommelier: OpenAI interviews a customer and invents their pizza-perfume.
// Needs OPENAI_API_KEY in the environment (.env.local locally) — never commit it.
import { cookies } from "next/headers";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";

const TEXT_MODEL = "gpt-6.1-terra";
const IMAGE_MODEL = "gpt-image-2";
const QUESTIONS = 4;

export interface SommelierCustomer {
  name: string;
  favoriteScent: string;
  scentKind: "gas" | "pizza";
  scentIntensity: number;
  pizzaOrders: number;
  perfumeOrders: number;
}

export interface Answered {
  question: string;
  answer: string;
}

const Step = z.object({
  done: z.boolean(),
  question: z.string(), // empty when done
  options: z.array(z.string()), // 3–4 short answers; empty when done
  imagePrompt: z.string(), // photo description for this step
  pizza: z
    .object({
      name: z.string(),
      toppings: z.array(z.string()),
      topNote: z.string(),
      heartNote: z.string(),
      baseNote: z.string(),
      price: z.number(),
      tastingNote: z.string(),
    })
    .nullable(),
});
export type SommelierStep = z.infer<typeof Step>;

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

const instructions = `You are the Scent Sommelier of an absurd store that sells pizzas, perfumes, and pizzas that are also perfumes.
Interview the customer to design their perfect pizza-perfume. Ask exactly one playful, vivid question per turn, with 3 or 4 short answer options (max 6 words each).
Each question must build on the previous answers. After ${QUESTIONS} answers, stop asking: set done=true, question="", options=[], and fill "pizza" with an invented creation (toppings, perfume top/heart/base notes, a price in USD between 12 and 250, and a one-sentence tasting note). Otherwise pizza=null.
Always write imagePrompt: a short description for a realistic food photograph that reflects the pizza as it takes shape so far (ingredients, mood, lighting). No text or people in the image.
Keep it fun and family-friendly.`;

async function client(): Promise<OpenAI | string> {
  const user = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!user) return "Please log in again.";
  if (!process.env.OPENAI_API_KEY) return "The sommelier is on a smoke break (OPENAI_API_KEY is not set).";
  return new OpenAI();
}

export async function nextStep(customer: SommelierCustomer, history: Answered[]): Promise<Result<SommelierStep>> {
  const openai = await client();
  if (typeof openai === "string") return { ok: false, error: openai };
  try {
    const response = await openai.responses.parse({
      model: TEXT_MODEL,
      reasoning: { effort: "low" },
      instructions,
      input: JSON.stringify({ customer, answersSoFar: history, mustFinish: history.length >= QUESTIONS }),
      text: { format: zodTextFormat(Step, "sommelier_step") },
    });
    if (!response.output_parsed) return { ok: false, error: "The sommelier lost their train of thought. Try again." };
    return { ok: true, value: response.output_parsed };
  } catch (e) {
    console.error("sommelier nextStep failed", e);
    return { ok: false, error: "The sommelier sneezed. Try again." };
  }
}

// Returns a data: URL so the browser can show it without storing anything.
export async function paint(prompt: string): Promise<Result<string>> {
  const openai = await client();
  if (typeof openai === "string") return { ok: false, error: openai };
  try {
    const result = await openai.images.generate({
      model: IMAGE_MODEL,
      prompt: `Realistic food photograph, close-up. ${prompt}`,
      size: "1024x1024",
      quality: "low",
      output_format: "jpeg",
      output_compression: 50,
    });
    const b64 = result.data?.[0]?.b64_json;
    if (!b64) return { ok: false, error: "No image came back." };
    return { ok: true, value: `data:image/jpeg;base64,${b64}` };
  } catch (e) {
    console.error("sommelier paint failed", e);
    return { ok: false, error: "The painter dropped the brush." };
  }
}
