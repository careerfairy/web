import { Firestore, WriteBatch } from "firebase-admin/firestore"
import Counter from "../lib/Counter" // Adjust path as necessary

const MAX_BATCH_OPERATIONS = 450

/**
 * Manages Firestore batch write operations, handling automatic commits when
 * the maximum number of operations per batch is reached.
 * It also integrates with a Counter instance to track write operations and batches committed,
 * and supports a dry run mode.
 */
export class UltraBatch {
   private currentBatch: WriteBatch
   private batchOperationCount: number
   private firestore: Firestore
   private counter: Counter
   private dryRun: boolean

   /**
    * Creates an instance of UltraBatch.
    * @param firestoreInstance - The Firestore instance to use for batch operations.
    * @param counterInstance - The Counter instance for tracking operations.
    * @param [dryRun=false] - If true, operations will not be committed to Firestore.
    */
   constructor(
      firestoreInstance: Firestore,
      counterInstance: Counter,
      dryRun = false
   ) {
      this.firestore = firestoreInstance
      this.counter = counterInstance
      this.dryRun = dryRun
      this.currentBatch = this.firestore.batch()
      this.batchOperationCount = 0
   }

   /**
    * Adds an operation to the current batch. If the batch is full, it commits the current batch
    * and starts a new one before adding the operation.
    * In dry run mode, the operation is not added, but the method call is a no-op.
    * @param {(batch: WriteBatch) => void} operation - A function that takes the current WriteBatch
    * and performs an operation (e.g., batch.set(), batch.update(), batch.delete()).
    * @returns {Promise<void>}
    */
   async add(operation: (batch: WriteBatch) => void): Promise<void> {
      if (this.dryRun) {
         // In dry run, we might still want to simulate the operation for counting purposes
         // For now, we just return, but this could be expanded if needed.
         return
      }

      if (this.batchOperationCount >= MAX_BATCH_OPERATIONS) {
         await this.commit()
      }

      operation(this.currentBatch)
      this.batchOperationCount++
   }

   /**
    * Commits the current batch of operations to Firestore if not in dry run mode
    * and if there are operations in the batch.
    * Updates the counter with the number of writes and committed batches.
    * Resets the batch after committing.
    * @returns {Promise<void>}
    */
   async commit(): Promise<void> {
      if (this.dryRun || this.batchOperationCount === 0) {
         return
      }

      await this.currentBatch.commit()
      this.counter.addToWriteCount(this.batchOperationCount)
      this.counter.addToCustomCount("batchesCommitted", 1)
      this.counter.setCustomCount(
         "lastBatchOperationCount",
         this.batchOperationCount
      ) // Optional: log last batch size

      // Reset batch
      this.currentBatch = this.firestore.batch()
      this.batchOperationCount = 0
   }

   /**
    * Gets the current number of operations in the uncommitted batch.
    * @returns {number} The current number of operations in the batch.
    */
   getCurrentOperationCount(): number {
      return this.batchOperationCount
   }
}
