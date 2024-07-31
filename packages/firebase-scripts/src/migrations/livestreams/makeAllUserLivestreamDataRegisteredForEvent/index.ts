import { UserLivestreamData } from "@careerfairy/shared-lib/dist/livestreams"
import { BigBatch } from "@qualdesk/firestore-big-batch"
import Counter from "../../../lib/Counter"
import { firestore } from "../../../lib/firebase"
import { livestreamRepo } from "../../../repositories"

const targetLivestreamId = "4Y7N5oAPpooemptigtE9"

export async function run() {
   const counter = new Counter()
   try {
      const batch = new BigBatch({
         firestore,
      })

      // Get all the userLivestreamData for that event
      const users = await livestreamRepo.getAllLivestreamUsers(
         targetLivestreamId
      )
      // Get the livestream
      const livestream = await livestreamRepo.getById(targetLivestreamId)

      counter.addToReadCount(users.length + 1)

      // Get the livestream start or creation date, we will use this for the registration time for the users
      const livestreamCreateDate = livestream?.start.toDate()

      // Get all userLivestreamData that have not registered
      const missingRegDataUsers = users?.filter((user) => !user.registered)

      for (const data of missingRegDataUsers) {
         // Add the registered field
         const userLivestreamData: Pick<UserLivestreamData, "registered"> = {
            registered: {
               // @ts-ignore
               date: livestreamCreateDate,
               referral: {
                  inviteLivestream: null,
                  referralCode: null,
               },
               referrer: null,
               utm: null,
            },
         }
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         batch.update(data._ref as any, userLivestreamData)
         counter.writeIncrement()
      }

      const registeredIds = missingRegDataUsers?.map((user) => user.id)
      counter.addToCustomCount("Num Missing Reg Data", registeredIds.length)

      // Commit all changes at once
      await batch.commit()

      Counter.log("Finished committing! ")
   } catch (error) {
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}

const throwMigrationError = (message: string) => {
   throw new Error(`Migration canceled, Error Message: ${message}`)
}
