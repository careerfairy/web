import { convertDocArrayToDict } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { Logger } from "@careerfairy/shared-lib/utils/types"
import { ManualTemplatedEmailBuilder } from "./ManualTemplatedEmailBuilder"
import { IUserFunctionsRepository } from "./UserFunctionsRepository"
import { ISparkFunctionsRepository } from "./sparks/SparkFunctionsRepository"

const FIELD_OF_STUDIES = [
   "business_administration_economics",
   "finance",
   "law",
   "luxury_fashion",
   "marketing",
   "military_sciences",
   "public_administration",
   "transportation",
   "business_engineering",
   "chemical_engineering",
   "civil_engineering",
   "electrical_engineering",
   "materials_science_and_engineering",
   "mechanical_engineering",
   "space_sciences",
   "computer_science",
   "mathematics",
   "astronomy",
   "biology",
   "chemistry",
   "earth_sciences",
   "environmental_studies_and_forestry",
   "geography",
   "life_sciences",
   "medicine",
   "physics",
   "systems_science",
]

/**
 * Gathers all the required data to build the release email
 */
export class ManualTemplatedEmailService {
   /**
    * The users that have subscribed to the release email
    */
   // Leaving this commented as the most common usage will be with the full UserData
   // private subscribedUsers: Record<string, UserData>
   private subscribedUsers: Record<string, { id: string; firstName: string }>

   constructor(
      private readonly userRepo: IUserFunctionsRepository,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      private readonly sparksRepo: ISparkFunctionsRepository,
      private readonly emailBuilder: ManualTemplatedEmailBuilder,
      private readonly logger: Logger
   ) {}

   /**
    * Fetches the required data for generating the email
    */
   async fetchRequiredData(overrideUsers: string[]) {
      const users = await this.userRepo.getSubscribedUsersByCountryCodes(
         ["DE", "CH"],
         overrideUsers
      )

      const filteredUsers = users.filter(
         (user) =>
            user.fieldOfStudy?.id &&
            FIELD_OF_STUDIES.includes(user.fieldOfStudy.id)
      )

      this.subscribedUsers = convertDocArrayToDict(filteredUsers)

      this.logger.info(
         "Total Users for X-mas newsletter - ",
         Object.keys(this.subscribedUsers || {}).length
      )

      return this
   }

   /**
    * Sends the Email to the subscribed users
    *
    * Possibility of overriding the users to send the release email to
    * for testing purposes.
    */
   send() {
      const emails = Object.keys(this.subscribedUsers || {})

      for (const userEmail of emails) {
         this.emailBuilder.addRecipient(
            userEmail,
            this.subscribedUsers[userEmail].firstName
         )
      }

      return this.emailBuilder.send()
   }
}
