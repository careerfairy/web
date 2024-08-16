import {
   LivestreamTranscript,
   LivestreamTranscriptEmbedding,
} from "@careerfairy/shared-lib/livestreams/ai"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams/livestreams"
import { logger } from "firebase-functions/v2"
import { firestore, Timestamp } from "../../../api/firestoreAdmin"
import { AVERAGE_CHARS_PER_TOKEN } from "../constants"
import { generateEmbeddings } from "../util"

const { info } = logger

/**
 * Service for generating and managing transcript embeddings for live streams.
 * This class handles the creation, storage, and deletion of embeddings,
 * which are crucial for efficient semantic search and analysis of live stream content.
 */
export class TranscriptEmbeddingService {
   private readonly MAX_TOKENS = 8000 // Maximum tokens per section to ensure optimal embedding quality
   private readonly OVERLAP_PERCENTAGE = 0.25 // Overlap between sections for context continuity
   private readonly COLLECTION_NAME = "livestreamTranscriptEmbeddings"

   /**
    * Generates and stores embeddings for a live stream transcript.
    * This method first deletes existing embeddings, then creates new ones from the transcript segments.
    * @param livestream The live stream event
    * @param fullTranscript The transcript segments of the live stream
    */
   async generateAndStoreTranscriptEmbeddings(
      livestream: LivestreamEvent,
      fullTranscript: LivestreamTranscript // maybe use segments sub-collection instead to to include timestamps, speaker, etc. But for now this is fine
   ): Promise<void> {
      const deletedEmbeddings = await this.deleteExistingEmbeddings(
         livestream.id
      )
      info(
         `Deleted ${deletedEmbeddings} existing embeddings for live stream ${livestream.id}`
      )

      const sections = this.createOverlappingSections(fullTranscript.transcript)

      info("Generating embeddings", {
         sections: sections.length,
      })
      const { embeddings, usage } = await generateEmbeddings(sections)

      info("Generated embeddings", {
         usage,
         embeddings: embeddings.length,
      })

      await this.storeEmbeddings(livestream, sections, embeddings)
      info(
         `Stored ${embeddings.length} embeddings for live stream ${livestream.id}`
      )
   }

   /**
    * Deletes existing embeddings for a given live stream.
    * This ensures that outdated embeddings are removed before new ones are generated.
    * @param livestreamId The ID of the live stream
    */
   async deleteExistingEmbeddings(livestreamId: string): Promise<number> {
      const batch = firestore.batch()
      const embeddingsRef = firestore.collection(this.COLLECTION_NAME)
      const snapshot = await embeddingsRef
         .where("livestreamId", "==", livestreamId)
         .get()

      snapshot.docs.forEach((doc) => {
         batch.delete(doc.ref)
      })

      await batch.commit()

      return snapshot.size
   }

   /**
    * Creates overlapping sections from the full transcript text.
    * This method ensures that each section is within the token limit and maintains context through overlap.
    * @param text The full transcript text
    * @returns An array of overlapping text sections
    */
   private createOverlappingSections(text: string): string[] {
      const words = text.split(/\s+/)
      const sections: string[] = []
      let currentSectionWords: string[] = []
      let currentTokenCount = 0

      for (let i = 0; i < words.length; i++) {
         const word = words[i]
         const wordTokenCount = Math.ceil(word.length / AVERAGE_CHARS_PER_TOKEN)

         if (currentTokenCount + wordTokenCount > this.MAX_TOKENS) {
            sections.push(currentSectionWords.join(" "))

            // Calculate overlap
            const overlapWordCount = Math.floor(
               currentSectionWords.length * this.OVERLAP_PERCENTAGE
            )
            currentSectionWords = currentSectionWords.slice(-overlapWordCount)
            currentTokenCount = Math.ceil(
               currentSectionWords.join(" ").length / AVERAGE_CHARS_PER_TOKEN
            )
         }

         currentSectionWords.push(word)
         currentTokenCount += wordTokenCount
      }

      if (currentSectionWords.length > 0) {
         sections.push(currentSectionWords.join(" "))
      }

      return sections
   }

   /**
    * Stores the generated embeddings in Firestore.
    * Each embedding is stored as a separate document for efficient retrieval and querying.
    * @param livestream The live stream event
    * @param sections The text sections corresponding to the embeddings
    * @param embeddings The generated embedding vectors
    */
   private async storeEmbeddings(
      livestream: LivestreamEvent,
      sections: string[],
      embeddings: number[][]
   ): Promise<void> {
      const batch = firestore.batch()

      sections.forEach((sectionText, index) => {
         const ref = firestore.collection(this.COLLECTION_NAME).doc()

         const transcriptEmbedding: LivestreamTranscriptEmbedding = {
            id: ref.id,
            livestream,
            sectionIndex: index,
            sectionText: sectionText,
            embedding: embeddings[index],
            embeddingCreatedAt: Timestamp.now(),
            type: "livestreamTranscript",
         }

         batch.set(ref, transcriptEmbedding)
      })

      await batch.commit()
   }
}

export const transcriptEmbeddingService = new TranscriptEmbeddingService()
