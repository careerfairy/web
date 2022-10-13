import {
   FirebaseGroupRepository,
   IGroupRepository,
} from "@careerfairy/shared-lib/dist/groups/GroupRepository"
import {
   Group,
   GROUP_DASHBOARD_ROLE,
   GroupAdmin,
   GroupQuestion,
} from "@careerfairy/shared-lib/dist/groups"
import { GroupDashboardInvite } from "@careerfairy/shared-lib/dist/groups/GroupDashboardInvite"
import { UserData } from "@careerfairy/shared-lib/dist/users"
import firebase from "firebase/compat"
import admin = require("firebase-admin")
import { mapFirestoreDocuments } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"
import { GroupATSAccount } from "@careerfairy/shared-lib/dist/groups/GroupATSAccount"

export interface IGroupFunctionsRepository extends IGroupRepository {
   /**
    * Confirm if user is admin of the group
    *
    * Returns true if user is admin of the group and the group itself to save a
    * network request in case you need to fetch the full group afterwards
    * @param groupId
    * @param userEmail
    */
   checkIfUserIsGroupAdmin(
      groupId: string,
      userEmail: string
   ): Promise<{ isAdmin: boolean; group: Group; role: GROUP_DASHBOARD_ROLE }>

   /**
    * Grants or removes a user admin access to a group and a role
    *
    * What it does if a role is provided:
    * 1. Assigns a role to the group in the user's auth custom claims
    * 2. Adds the user's role to the group's admins sub-collection list for querying of group admins in group/[groupId]/admin/roles
    * 3. Adds a userGroupAdmin document to the user's userAdminGroups sub-collection with the group's details
    *
    * What it does if no role is provided:
    * 1. Removes the user's role from the group's admins sub-collection list for querying of group admins in group/[groupId]/admin/roles
    * 2. Removes the user's role from the user's auth custom claims
    * 3. Removes the user's userGroupAdmin document from the user's userAdminGroups sub-collection
    * @param email
    * @param group
    * @param role
    */
   setAdminRole(
      email: string,
      group: Group,
      role: GROUP_DASHBOARD_ROLE | null
   ): Promise<void>

   createGroupDashboardInvite(
      groupId: string,
      userEmail: string,
      role: GROUP_DASHBOARD_ROLE
   ): Promise<GroupDashboardInvite>

   deleteGroupDashboardInviteById(id: string): Promise<void>

   checkIfGroupDashboardInviteIsValid(
      groupDashboardInvite: GroupDashboardInvite,
      currentUserEmail: string
   ): boolean

   createGroup(
      group: Partial<Group>,
      userEmail: string,
      groupQuestions?: GroupQuestion[]
   ): Promise<Group>

   /*
    * This method will return the invitation document if it exists for the given email
    * */
   getDashboardInvite(emailToCheck: string): Promise<GroupDashboardInvite>

   getATSIntegration(
      groupId: string,
      integrationId: string
   ): Promise<GroupATSAccount>
}

export class GroupFunctionsRepository
   extends FirebaseGroupRepository
   implements IGroupFunctionsRepository
{
   constructor(
      protected readonly firestore: firebase.firestore.Firestore,
      protected readonly fieldValue: typeof firebase.firestore.FieldValue,
      protected readonly auth: admin.auth.Auth
   ) {
      super(firestore, fieldValue)
   }

   async checkIfUserIsGroupAdmin(
      groupId: string,
      userEmail: string
   ): Promise<{ isAdmin: boolean; group: Group; role: GROUP_DASHBOARD_ROLE }> {
      const groupDoc = await this.firestore
         .collection("careerCenterData")
         .doc(groupId)
         .get()

      if (!groupDoc.exists) {
         return { isAdmin: false, group: null, role: null }
      }

      const group = this.addIdToDoc<Group>(groupDoc)
      const user = await this.auth.getUserByEmail(userEmail)

      const userRole = user.customClaims?.adminGroups?.[group.id]?.role

      return {
         isAdmin: Object.values(GROUP_DASHBOARD_ROLE).includes(userRole),
         group,
         role: userRole,
      }
   }

   async setAdminRole(
      targetEmail: string,
      group: Group,
      newRole: GROUP_DASHBOARD_ROLE | null
   ) {
      // Get the auth user
      const userSnap = await this.firestore
         .collection("userData")
         .doc(targetEmail)
         .get()

      const userData = this.addIdToDoc<UserData>(userSnap)

      const user = await this.auth.getUserByEmail(targetEmail)

      // MAKE SURE THERE IS ALWAYS AT LEAST ONE OWNER FOR EVERY GROUP AT THE END OF THIS OPERATION
      const thereWillBeAtLeastOneOwner =
         await this.checkIfThereWillBeAtLeastOneOwner(
            group.id,
            newRole,
            targetEmail
         )

      if (!thereWillBeAtLeastOneOwner) {
         throw new Error(
            "Cannot remove the last owner of the group. There must be at least one owner."
         )
      }

      await this.setGroupAdminRoleInClaims(user, newRole, group)

      return this.setGroupAdminRoleInFirestore(group, userData, newRole).catch(
         (error) => {
            // if there was an error, revert the custom claims
            this.auth.setCustomUserClaims(user.uid, user.customClaims)
            throw error
         }
      )
   }

   /*
    * Stores the group admin role in the user's custom claims
    * */
   protected async setGroupAdminRoleInClaims(
      authUser: admin.auth.UserRecord,
      newRole: GROUP_DASHBOARD_ROLE | null,
      group: Group
   ) {
      const oldClaims = { ...authUser.customClaims }
      let newClaims = JSON.parse(JSON.stringify(oldClaims)) // deep copy the old claims

      if (newRole) {
         newClaims = {
            ...oldClaims,
            adminGroups: {
               ...oldClaims.adminGroups,
               [group.id]: {
                  role: newRole,
               },
            },
         }
      } else {
         // remove the role from the user's custom claims
         if (newClaims.adminGroups?.[group.id]) {
            delete newClaims.adminGroups[group.id]
         }
      }

      return this.auth.setCustomUserClaims(authUser.uid, newClaims)
   }

   async getGroupAdmins(groupId: string): Promise<GroupAdmin[]> {
      const adminsSnap = await this.firestore
         .collection("careerCenterData")
         .doc(groupId)
         .collection("groupAdmins")
         .get()

      return mapFirestoreDocuments(adminsSnap)
   }

   async createGroupDashboardInvite(
      groupId: string,
      userEmail: string,
      role: GROUP_DASHBOARD_ROLE
   ): Promise<GroupDashboardInvite> {
      const id = this.firestore.collection("invites").doc().id
      const invite: GroupDashboardInvite = {
         id,
         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
         // @ts-ignore
         createdAt: this.fieldValue.serverTimestamp(),
         invitedEmail: userEmail,
         groupId,
         role: role || GROUP_DASHBOARD_ROLE.MEMBER,
      }
      await this.firestore
         .collection("groupDashboardInvites")
         .doc(id)
         .set(invite)
      return invite
   }

   deleteGroupDashboardInviteById(inviteId: string): Promise<void> {
      return this.firestore
         .collection("groupDashboardInvites")
         .doc(inviteId)
         .delete()
   }

   checkIfGroupDashboardInviteIsValid(
      groupDashboardInvite: GroupDashboardInvite,
      currentUserEmail: string
   ): boolean {
      return Boolean(
         groupDashboardInvite.invitedEmail &&
            groupDashboardInvite.groupId &&
            groupDashboardInvite.role &&
            currentUserEmail
      )
   }

   async createGroup(
      group: Partial<Group>,
      userEmail: string,
      groupQuestions?: GroupQuestion[]
   ): Promise<Group> {
      const batch = this.firestore.batch()

      // Create group ref
      const groupRef = this.firestore.collection("careerCenterData").doc()
      // Create user's reference in th group admins sub-collection

      // add the group questions to the the the groupQuestions sub-collection
      const questionsWithoutTempIds = removeTempGroupQuestionIds(groupQuestions)
      const questionRefs = []

      questionsWithoutTempIds.forEach((groupQuestion) => {
         const groupQuestionRef = this.firestore
            .collection("careerCenterData")
            .doc(groupRef.id)
            .collection("groupQuestions")
            .doc()
         questionRefs.push(groupQuestionRef)
         batch.set(groupQuestionRef, groupQuestion)
      })

      const newGroupData: Group = {
         id: groupRef.id,
         groupId: groupRef.id,
         description: group.description || "",
         logoUrl: group.logoUrl || "",
         universityName: group.universityName || "",
         universityCode: group.universityCode || "",
      }

      await groupRef.set(newGroupData)

      batch.set(groupRef, newGroupData)

      await batch.commit().then(() =>
         this.setAdminRole(
            userEmail,
            newGroupData,
            GROUP_DASHBOARD_ROLE.OWNER
         ).catch((error) => {
            // if there was an error, delete the group and its questions
            const batch = this.firestore.batch()
            batch.delete(groupRef)
            questionRefs.forEach((questionRef) => {
               batch.delete(questionRef)
            })
            batch.commit()
            throw error
         })
      )
      return newGroupData
   }

   async getDashboardInvite(
      emailToCheck: string
   ): Promise<GroupDashboardInvite> {
      const docs = await this.firestore
         .collection("groupDashboardInvites")
         .where("invitedEmail", "==", emailToCheck)
         .limit(1)
         .get()

      if (docs.size !== 1) return null

      return this.addIdToDoc<GroupDashboardInvite>(docs.docs[0])
   }

   async getATSIntegration(
      groupId: string,
      integrationId: string
   ): Promise<GroupATSAccount> {
      const doc = await this.firestore
         .collection("careerCenterData")
         .doc(groupId)
         .collection("ats")
         .doc(integrationId)
         .get()

      if (!doc.exists) return null

      return GroupATSAccount.createFromDocument(doc.data() as any)
   }
}

const removeTempGroupQuestionIds = (groupQuestions?: GroupQuestion[]) => {
   return (
      groupQuestions?.map((groupQuestion) => {
         delete groupQuestion.id
         return groupQuestion
      }) || []
   )
}
