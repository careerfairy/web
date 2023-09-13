import {
   Firestore,
   WriteBatch,
   DocumentReference,
   UpdateData,
   SetOptions,
   writeBatch,
   setDoc,
   updateDoc,
   deleteDoc,
} from "firebase/firestore"

const MAX_OPERATIONS_PER_FIRESTORE_BATCH = 499

/**
 * Class representing a BigBatch.
 * @class BigBatch
 * @description This class is a workaround for Firestore's batch operation limit.
 * It allows you to queue up more than 500 operations, which would normally exceed Firestore's limit.
 * However, it does not provide the same atomicity guarantees as a true batch operation.
 * If a commit fails, some operations may succeed while others fail.
 */
class BigBatch {
   private firestore: Firestore
   private currentBatch: WriteBatch
   private batchArray: WriteBatch[]
   private operationCounter: number

   /**
    * Create a BigBatch.
    * @param firestore - The Firestore instance.
    */
   constructor(firestore: Firestore) {
      this.firestore = firestore
      this.currentBatch = writeBatch(firestore)
      this.batchArray = [this.currentBatch]
      this.operationCounter = 0
   }

   /**
    * Add a set operation to the batch.
    * @param {DocumentReference} ref - The reference of the document to set.
    * @param {any} data - The data to set.
    * @param {SetOptions} options - The set options.
    */
   set(ref: DocumentReference, data: any, options: SetOptions = {}): void {
      setDoc(ref, data, options)
      this.operationCounter++
      if (this.operationCounter === MAX_OPERATIONS_PER_FIRESTORE_BATCH) {
         this.currentBatch = writeBatch(this.firestore)
         this.batchArray.push(this.currentBatch)
         this.operationCounter = 0
      }
   }

   /**
    * Add an update operation to the batch.
    * @param {DocumentReference} ref - The reference of the document to update.
    * @param {UpdateData} data - The data to update.
    */
   update(ref: DocumentReference, data: UpdateData<unknown>): void {
      updateDoc(ref, data)
      this.operationCounter++
      if (this.operationCounter === MAX_OPERATIONS_PER_FIRESTORE_BATCH) {
         this.currentBatch = writeBatch(this.firestore)
         this.batchArray.push(this.currentBatch)
         this.operationCounter = 0
      }
   }

   /**
    * Add a delete operation to the batch.
    * @param {DocumentReference} ref - The reference of the document to delete.
    */
   delete(ref: DocumentReference): void {
      deleteDoc(ref)
      this.operationCounter++
      if (this.operationCounter === MAX_OPERATIONS_PER_FIRESTORE_BATCH) {
         this.currentBatch = writeBatch(this.firestore)
         this.batchArray.push(this.currentBatch)
         this.operationCounter = 0
      }
   }

   /**
    * Commit the batch.
    * @return {Promise<void>} A promise that resolves when the commit is successful.
    */
   async commit(): Promise<void> {
      const promises = this.batchArray.map((batch) => batch.commit())
      await Promise.all(promises)
   }
}

export default BigBatch
