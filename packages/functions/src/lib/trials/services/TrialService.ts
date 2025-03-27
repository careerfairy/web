import { Group, GroupAdmin } from "@careerfairy/shared-lib/groups"
import { IEmailNotificationRepository } from "@careerfairy/shared-lib/notifications/IEmailNotificationRepository"
import { EmailNotificationDetails } from "@careerfairy/shared-lib/notifications/notifications"
import { addUtmTagsToLink } from "@careerfairy/shared-lib/utils"
import { Logger } from "@careerfairy/shared-lib/utils/types"
import { IGroupFunctionsRepository } from "../../../lib/GroupFunctionsRepository"
import { getWebBaseUrl } from "../../../util"
import {
   SparkTrialEndEmailBuilder,
   SparksEndOfTrialData,
} from "../sparks/SparksTrialEndEmailBuilder"

const SPARKS_TRIAL_EXPIRE_NOTIFICATION_DAYS = 7

export class TrialService {
   private groups: Group[] = []
   private notificationDetails: EmailNotificationDetails[] = []

   constructor(
      private readonly groupRepo: IGroupFunctionsRepository,
      private readonly notificationsRepo: IEmailNotificationRepository,
      private readonly trialsEmailBuilder: SparkTrialEndEmailBuilder,
      private readonly logger: Logger
   ) {
      this.logger.info("TrialService constructor")
   }

   /**
    * Fetches the necessary data, consisting first of retrieving all notifications for type 'endOfSparksTrial', which will be the base
    * for filtering out already sent notifications to companies. In this table all notified users for this type will have a groupId on the
    * path /emailNotifications/1Lk1M3_exampleDocumentID/details/groupId. Any group ID found in this collection, will be ignored for email
    * consideration.
    * With the ignore list defined, the groups which have an expiring plan (according to defined variable of days of buffer) are retrieved taking into
    * consideration the same ignore list. This additional filtering also takes into account the query limit for firestore (30).
    */
   async fetchData(): Promise<void> {
      this.logger.info(" - Retrieving base data")

      this.groups = await this.groupRepo.getAllGroupsWithAPlanExpiring(
         SPARKS_TRIAL_EXPIRE_NOTIFICATION_DAYS,
         this.logger
      )
   }

   /**
    * Builds the notifications data, mainly the EmailNotifications to be stored and the template data for Postmark sending.
    * An additional check is made on the admin groups, raising an error if any administrator is found to be of a group not
    * included in the @field this.group
    */
   async buildNotifications(): Promise<void> {
      this.logger.info(" - Building notifications")

      const groupAdminsPromises = this.groups.map((group) =>
         this.groupRepo.getGroupAdmins(group.groupId)
      )

      const groupAdminsCollections = await Promise.all(groupAdminsPromises)

      const allGroupAdmins = groupAdminsCollections
         .flat()
         .filter((groupAdmin) => Boolean(groupAdmin?.groupId))

      const uniqueAdminGroups = [
         ...new Set(allGroupAdmins.map((admin) => admin.groupId)),
      ]
      const unmatchedGroups = uniqueAdminGroups.filter(
         (adminGroupId) =>
            !this.groups.find((group) => group.groupId == adminGroupId)
      )

      if (unmatchedGroups.length) {
         this.logger.error(
            " - Fetched group admins have admins from groups not included in the fetched groups with plan expiring: ",
            unmatchedGroups
         )
         throw new Error(
            " - Fetched group admins have admins from groups not included in the fetched groups with plan expiring: " +
               JSON.stringify(unmatchedGroups)
         )
      }

      const emailsData = allGroupAdmins.map((admin) =>
         this.adminToSparksTrialData(admin)
      )

      this.logger.info(" - emailsData:", emailsData)

      this.notificationDetails = emailsData.map((data) =>
         this.sparksTrialToNotificationDetails(data)
      )

      this.trialsEmailBuilder.addRecipients(emailsData)

      this.logger.info(
         " - built notifications length: ",
         this.notificationDetails.length
      )
      this.logger.info(
         " - built emails recipients length: ",
         this.trialsEmailBuilder.getRecipients().length
      )
   }

   /**
    * Creates all the notifications to be sent in the /emailNotifications collection.
    */
   async createNotifications(): Promise<void> {
      this.logger.info(" - Storing notifications on database")
      const createdNotifications =
         await this.notificationsRepo.createNotificationDocuments(
            this.notificationDetails
         )

      this.logger.info(
         ` - Created ${createdNotifications.length} notifications from ${this.notificationDetails.length} user emails`
      )
   }

   private sparksTrialToNotificationDetails(
      data: SparksEndOfTrialData
   ): EmailNotificationDetails {
      return {
         type: "endOfSparksTrial",
         sentBy: "careerfairy.io",
         receiverEmail: data.userEmail,
         groupId: data.groupId,
      }
   }

   private adminToSparksTrialData(admin: GroupAdmin): SparksEndOfTrialData {
      const link = `${getWebBaseUrl()}/group/${admin.groupId}/admin/sparks`
      const group = this.groups.find((g) => g.id === admin.groupId)

      return {
         user_name: admin.firstName,
         groupId: admin.groupId,
         company_sparks_link: addUtmTagsToLink({
            link,
            campaign: "sparks",
            content: "end-of-trial",
         }),
         userEmail: admin.email,
         planType: group?.plan?.type,
         groupName: group?.universityName,
      }
   }
}
