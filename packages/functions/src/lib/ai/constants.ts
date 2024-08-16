import { googleAI, openai } from "../../api/ai"

export const AVERAGE_CHARS_PER_TOKEN = 4 // Approximate average characters per token, proper counting is too computationally expensive

export const EMBEDDING_MODEL = openai.embedding("text-embedding-3-large")

export const CONVERSATION_MODEL = googleAI.languageModel(
   "models/gemini-1.5-pro-latest"
)
