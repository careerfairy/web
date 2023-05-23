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

interface GroupSeed {
   createGroup(overrideFields?: Partial<Group>): Promise<Group>

   addGroupAdmin(
      user: UserData,
      group: Group,
      role?: GROUP_DASHBOARD_ROLE
   ): Promise<void>

   getInviteByEmail(email: string): Promise<GroupDashboardInvite>
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
      const universityName = faker.company.companyName() ?? "My university"

      let data: Group = {
         id,
         groupId: id,
         description: faker.company.bs(),
         logoUrl: faker.image.business(),
         bannerImageUrl: faker.image.business(),
         test: false,
         universityName,
         triGrams: groupTriGrams(universityName),
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
}

type GeneratorFn = () => string

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
