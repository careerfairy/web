import { Response } from "firebase-functions/v1"
import { logger } from "firebase-functions/v2"
import { type Request } from "firebase-functions/v2/https"
import { firestore } from "../api/firestoreAdmin"

const { warn, error } = logger

/**
 * Options for configuring the lock mechanism.
 */
type LockOptions = {
   /** Maximum duration (in milliseconds) for which a lock can be held before it's considered stale */
   maxLockDuration?: number
} & (
   | {
        /** Unique identifier for the lock */
        lockName: string
     }
   | {
        /** Function to generate a lock name based on the request */
        getLockName: (req: Request) => string
     }
)

/**
 * Higher-order function that adds a distributed locking mechanism to an async function.
 * This ensures that only one instance of the function can run at a time.
 *
 * @param options - Configuration options for the lock
 * @returns A function that wraps the original async function with locking logic
 */
export const withLock = (options: LockOptions) => {
   return (fn: () => Promise<void>) => {
      return async (req: Request, res: Response): Promise<void> => {
         const { maxLockDuration = 3600000 } = options // Default to 1 hour max
         const lockName =
            "getLockName" in options
               ? options.getLockName(req)
               : options.lockName
         const lockRef = firestore.collection("locks").doc(lockName)

         let lockResult: { acquired: boolean; runningTime: number } | null =
            null

         try {
            // Try to acquire the lock
            lockResult = await firestore.runTransaction(async (transaction) => {
               const lockDoc = await transaction.get(lockRef)
               const now = Date.now()
               if (lockDoc.exists && lockDoc.data().locked) {
                  const lockAge = now - lockDoc.data().lockedAt
                  if (lockAge < maxLockDuration) {
                     return { acquired: false, runningTime: lockAge }
                  }
                  // Lock has exceeded maxLockDuration, consider it stale
                  warn(
                     `Lock '${lockName}' exceeded maxLockDuration. Overriding.`
                  )
               }
               transaction.set(lockRef, { locked: true, lockedAt: now })
               return { acquired: true, runningTime: 0 }
            })

            if (!lockResult.acquired) {
               const runningTimeMinutes = Math.floor(
                  lockResult.runningTime / 60000
               )
               res.status(409).json({
                  error: `Process '${lockName}' already running for ${runningTimeMinutes} minutes please wait for it to finish`,
               })
               return
            }

            // Call the original function
            await fn()
         } catch (err) {
            error(`Error in withLock for '${lockName}':`, err)
            throw err
         } finally {
            // Release the lock
            if (lockResult?.acquired) {
               await lockRef.set(
                  { locked: false, lockedAt: null },
                  { merge: true }
               )
            }
         }
      }
   }
}
