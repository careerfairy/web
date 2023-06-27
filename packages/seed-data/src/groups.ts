import {
   Group,
   GROUP_DASHBOARD_ROLE,
} from "@careerfairy/shared-lib/dist/groups"
import { faker } from "@faker-js/faker"
import { auth, fieldValue, firestore } from "./lib/firebase"
import { LivestreamGroupQuestion } from "@careerfairy/shared-lib/dist/livestreams"
import { generateId } from "./utils/utils"
import { groupTriGrams } from "@careerfairy/shared-lib/dist/utils/search"
import { AdminGroupsClaim, UserData } from "@careerfairy/shared-lib/dist/users"
import {
   FirebaseGroupRepository,
   IGroupRepository,
} from "@careerfairy/shared-lib/dist/groups/GroupRepository"
import { GroupDashboardInvite } from "@careerfairy/shared-lib/dist/groups/GroupDashboardInvite"
import {
   type GroupATSAccountDocument,
   type GroupATSIntegrationTokensDocument,
} from "@careerfairy/shared-lib/dist/groups"

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
}

class GroupFirebaseSeed implements GroupSeed {
   private groupRepo: IGroupRepository

   constructor() {
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
      const batch = firestore.batch()
      const id = generateId()
      const universityName =
         faker.company.companyName().replace(/[^a-zA-Z\d ]/g, "") ??
         "My university"

      let data: Group = {
         id,
         groupId: id,
         description: faker.company.bs(),
         logoUrl: faker.image.business(),
         bannerImageUrl: faker.image.business(),
         test: false,
         universityName,
         triGrams: groupTriGrams(universityName),
         atsAdminPageFlag: true,
      }

      data = Object.assign(data, overrideFields)

      groupQuestions.forEach((questionData) => {
         const questionRef = firestore
            .collection("careerCenterData")
            .doc(id)
            .collection("groupQuestions")
            .doc(questionData.id)
         batch.set(questionRef, questionData)
      })

      const groupRef = firestore.collection("careerCenterData").doc(id)
      batch.set(groupRef, data)
      await batch.commit()
      return data
   }

   async getGroup(groupId: string): Promise<Group> {
      const groupDoc = await firestore
         .collection("careerCenterData")
         .doc(groupId)
         .get()

      return groupDoc.exists ? (groupDoc.data() as Group) : null
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
      const integrationId = "testIntegrationId" // replace with actual id

      const atsMetadata: Partial<GroupATSAccountDocument> = {
         groupId: groupId,
         merge: {
            end_user_origin_id: integrationId,
            integration_name: "testIntegrationName",
            image: "testImageURL",
            square_image: "testSquareImageURL",
            slug: "testSlug",
            firstSyncCompletedAt: fieldValue.serverTimestamp() as any, // set to now
            applicationTestCompletedAt: fieldValue.serverTimestamp() as any, // set to now
            extraRequiredData: null,
         },
      }

      if (options.needsApplicationTest) {
         atsMetadata.merge.applicationTestCompletedAt = null
         atsMetadata.merge.extraRequiredData = null
      }

      const atsTokenData: Partial<GroupATSIntegrationTokensDocument> = {
         groupId: groupId,
         integrationId: integrationId,
         merge: {
            account_token: "testAccountToken",
         },
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

const instance: GroupSeed = new GroupFirebaseSeed()

export default instance
