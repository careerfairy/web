import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { createOpenAI } from "@ai-sdk/openai"

export const AVERAGE_CHARS_PER_TOKEN = 4 // Approximate average characters per token

export const openai = createOpenAI({
   apiKey: process.env.OPENAI_API_KEY,
})

export const googleAI = createGoogleGenerativeAI({
   apiKey: process.env.GOOGLE_API_KEY,
})
