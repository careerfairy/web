import { z } from "zod"

export const ChapterSchema = z.object({
   title: z.string().describe("The title of the chapter"),
   startSec: z.number().describe("The start time of the chapter in seconds"),
   endSec: z.number().describe("The end time of the chapter in seconds"),
   summary: z.string().describe("A brief summary of the chapter"),
})

export const ChaptersSchema = z
   .array(ChapterSchema)
   .describe("The chapters of a live stream transcription")
