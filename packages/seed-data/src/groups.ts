import {
   Group,
   GROUP_DASHBOARD_ROLE,
   type GroupATSAccountDocument,
   type GroupATSIntegrationTokensDocument,
} from "@careerfairy/shared-lib/dist/groups"
import { GroupDashboardInvite } from "@careerfairy/shared-lib/dist/groups/GroupDashboardInvite"
import {
   FirebaseGroupRepository,
   IGroupRepository,
} from "@careerfairy/shared-lib/dist/groups/GroupRepository"
import { LivestreamGroupQuestion } from "@careerfairy/shared-lib/dist/livestreams"
import { AdminGroupsClaim, UserData } from "@careerfairy/shared-lib/dist/users"
import { faker } from "@faker-js/faker"
import { auth, fieldValue, firestore } from "./lib/firebase"
import {
   createGroupDocument,
   getGroup as getGroupFromFirestore,
} from "./utils/groupUtils"
import { generateId } from "./utils/utils"

interface GroupSeed {
   createGroup(overrideFields?: Partial<Group>): Promise<Group>

   addGroupAdmin(
      user: UserData,
      group: Group,
      role?: GROUP_DASHBOARD_ROLE
   ): Promise<void>

   getInviteByEmail(email: string): Promise<GroupDashboardInvite>

   getGroup(groupId: string): Promise<Group>

   /**
    * Generate with all the required fields for a complete company profile
    * */
   generateCompleteCompanyData(): Partial<Group>

   /**
    * Generate the full ATS data for a group
    * */
   setupATSForGroup(group: Group, options?: SetupATSGroupOptions): Promise<void>

   /**
    * Complete the candidate test for a group
    */
   completeCandidateTest(group: Group): Promise<void>
}

class GroupFirebaseSeed implements GroupSeed {
   private groupRepo: IGroupRepository

   constructor() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.groupRepo = new FirebaseGroupRepository(firestore as any, fieldValue)
   }

   async getInviteByEmail(email: string): Promise<GroupDashboardInvite> {
      const snap = await firestore
         .collection("groupDashboardInvites")
         .where("invitedEmail", "==", email)
         .limit(1)
         .get()

      if (snap.empty) {
         return null
      }

      return snap.docs[0].data() as GroupDashboardInvite
   }

   /**
    * Create custom admin claims for a user
    */
   async addGroupAdmin(
      user: UserData,
      group: Group,
      role: GROUP_DASHBOARD_ROLE = GROUP_DASHBOARD_ROLE.MEMBER
   ) {
      const claim: AdminGroupsClaim = {
         [group.groupId]: {
            role,
         },
      }

      await auth.setCustomUserClaims(user.authId, {
         adminGroups: claim,
      })

      await this.groupRepo.setGroupAdminRoleInFirestore(group, user, role)
   }

   async createGroup(overrideFields?: Partial<Group>): Promise<Group> {
      const groupId = firestore.collection("careerCenterData").doc().id
      return createGroupDocument(groupId, overrideFields)
   }

   async getGroup(groupId: string): Promise<Group> {
      return getGroupFromFirestore(groupId)
   }

   generateCompleteCompanyData(): Partial<Group> {
      return {
         publicProfile: true,
         extraInfo: "extra info extra info",
         companyCountry: { name: "portugal", id: "pt" },
         companyIndustries: [{ name: "accounting", id: "accounting" }],
         companySize: "1-20",
         photos: [
            {
               id: faker.company.bs(),
               url: faker.image.imageUrl(),
            },
            {
               id: faker.company.bs(),
               url: faker.image.imageUrl(),
            },
            {
               id: faker.company.bs(),
               url: faker.image.imageUrl(),
            },
         ],
         videos: [
            {
               url: faker.image.imageUrl(),
               title: faker.company.bs(),
               description: faker.company.bs(),
               isEmbedded: true,
               id: faker.company.bs(),
            },
         ],
         testimonials: [
            {
               id: faker.company.bs(),
               name: faker.company.companyName(),
               position: faker.company.bs(),
               testimonial: faker.company.bs(),
               avatar: faker.image.imageUrl(),
               groupId: faker.company.bs(),
            },
         ],
      }
   }

   async setupATSForGroup(
      group: Group,
      options: SetupATSGroupOptions = {
         needsApplicationTest: false,
      }
   ): Promise<void> {
      const groupId = group.id

      const atsMetadata: GroupATSAccountDocument = {
         groupId: groupId,
         merge: {
            end_user_origin_id: integrationId,
            integration_name: "testIntegrationName",
            image: "testImageURL",
            square_image: "testSquareImageURL",
            slug: "testSlug",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            firstSyncCompletedAt: fieldValue.serverTimestamp() as any, // set to now
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            applicationTestCompletedAt: fieldValue.serverTimestamp() as any, // set to now
            extraRequiredData: null,
         },

         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         createdAt: fieldValue.serverTimestamp() as any, // set to now
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         updatedAt: fieldValue.serverTimestamp() as any, // set to now
         id: groupId,
      }

      if (options.needsApplicationTest === true) {
         atsMetadata.merge.applicationTestCompletedAt = null
         atsMetadata.merge.extraRequiredData = null
      }

      const atsTokenData: GroupATSIntegrationTokensDocument = {
         groupId: groupId,
         integrationId: integrationId,
         merge: {
            account_token: "testAccountToken",
         },
         id: "tokens",
      }

      await Promise.all([
         this.groupRepo.createATSIntegration(
            groupId,
            integrationId,
            atsMetadata
         ),
         this.groupRepo.saveATSIntegrationTokens(
            groupId,
            integrationId,
            atsTokenData
         ),
      ])
   }

   async completeCandidateTest(group: Group) {
      const docRef = firestore
         .collection("careerCenterData")
         .doc(group.id)
         .collection("ats")
         .doc(integrationId)

      const toUpdate: Partial<GroupATSAccountDocument> = {}

      // update a nested object property
      toUpdate["merge.applicationTestCompletedAt"] =
         fieldValue.serverTimestamp()
      toUpdate["merge.extraRequiredData"] = null

      await docRef.update(toUpdate)
   }
}

type GeneratorFn = () => string

type SetupATSGroupOptions = {
   /**
    * Wether or not the application test should be completed
    */
   needsApplicationTest: boolean
}

const generateQuestionOption = (generatorFn: GeneratorFn) => ({
   id: generateId(),
   name: generatorFn(),
})

export const generateQuestion = (
   name: string,
   generatorFn: GeneratorFn
): LivestreamGroupQuestion => ({
   id: generateId(),
   questionType: "custom",
   hidden: false,
   name,
   options: Array.from(
      { length: faker.datatype.number({ min: 1, max: 10 }) },
      () => generateQuestionOption(generatorFn)
   ).reduce((acc, curr) => {
      acc[curr.id] = curr
      return acc
   }, {}),
})

export const groupQuestions = [
   generateQuestion("Job Title", faker.name.jobTitle),
   generateQuestion("Job Type", faker.name.jobType),
   generateQuestion("Gender", faker.name.gender),
]

const integrationId = "testIntegrationId"

const instance: GroupSeed = new GroupFirebaseSeed()

export default instance
