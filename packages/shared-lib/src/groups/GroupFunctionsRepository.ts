import { FirebaseGroupRepository, IGroupRepository } from "./GroupRepository"
import {
   Group,
   GroupAdmin,
   GROUP_DASHBOARD_ROLE,
   GroupQuestion,
} from "./groups"
import admin = require("firebase-admin")
import { mapFirestoreDocuments } from "../BaseFirebaseRepository"
import { GroupDashboardInvite } from "./GroupDashboardInvite"
import { UserAdminGroup, UserData } from "../users"
import firebase from "firebase/compat"

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

   /*
    * Gets the admins of a group document
    * */
   getGroupAdmins(groupId: string): Promise<GroupAdmin[]>

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
    * This method will check if the provided email is actually part of a dashboard invite
    * */
   checkIfEmailHasAValidDashboardInvite(emailToCheck: string): Promise<boolean>
}

export class GroupFunctionsRepository
   extends FirebaseGroupRepository
   implements IGroupFunctionsRepository
{
   constructor(
      readonly firestore: firebase.firestore.Firestore,
      readonly fieldValue: typeof firebase.firestore.FieldValue,
      private readonly auth: admin.auth.Auth
   ) {
      super(firestore, fieldValue)
   }
   private async setGroupAdminRoleInFirestore(
      group: Group,
      userData: UserData,
      role?: GROUP_DASHBOARD_ROLE
   ): Promise<void> {
      const batch = this.firestore.batch()
      const groupAdminsRef = this.firestore
         .collection("careerCenterData")
         .doc(group.id)
         .collection("groupAdmins")
         .doc(userData.id)

      const userAdminGroupsRef = this.firestore
         .collection("userData")
         .doc(userData.id)
         .collection("userAdminGroups")
         .doc(group.id)

      if (role) {
         // if a role is provided, then we are adding the user as an admin
         const groupAdminDataToSave: GroupAdmin = {
            role,
            email: userData.id,
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            displayName: [userData.firstName, userData.lastName]
               .filter((name) => name)
               .join(" "),
            id: userData.id,
            groupId: group.id,
         }

         // save the group admin data to the group's admins sub-collection
         batch.set(groupAdminsRef, groupAdminDataToSave, { merge: true })

         const userAdminGroupsDataToSave: UserAdminGroup = {
            id: group.id,
            userId: userData.id,
            universityName: group.universityName,
            description: group.description || "",
            logoUrl: group.logoUrl || "",
            extraInfo: group.extraInfo || "",
            universityCode: group.universityCode || "",
         }

         // Store the group data in the user's admin groups sub-collection for easy querying
         batch.set(userAdminGroupsRef, userAdminGroupsDataToSave, {
            merge: true,
         })
      } else {
         // If no role is provided, then we are removing the user as an admin
         batch.delete(groupAdminsRef)
         batch.delete(userAdminGroupsRef)
      }

      return batch.commit()
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
      const user = await this.auth.getUserByEmail(userEmail) //

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

      const currentAdmins = (await this.getGroupAdmins(group.id)) || []

      // MAKE SURE THERE IS ALWAYS AT LEAST ONE OWNER FOR EVERY GROUP AT THE END OF THIS OPERATION
      const thereWillBeAtLeastOneOwner =
         await this.checkIfThereWillBeAtLeastOneOwner(
            group.id,
            newRole,
            targetEmail,
            currentAdmins
         )

      if (!thereWillBeAtLeastOneOwner) {
         throw new Error(
            "Cannot remove the last owner of the group. There must be at least one owner."
         )
      }

      const oldClaims = { ...user.customClaims } // copy the old claims

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
         delete newClaims.adminGroups[group.id]
      }

      await this.auth.setCustomUserClaims(user.uid, newClaims)

      await this.setGroupAdminRoleInFirestore(group, userData, newRole).catch(
         (error) => {
            // if there was an error, revert the custom claims
            this.auth.setCustomUserClaims(user.uid, oldClaims)
            throw error
         }
      )

      return this.firestore.collection("userData").doc(targetEmail).update({
         refreshTokenTime: this.fieldValue.serverTimestamp(), // update the user's refresh token time to force a refresh of the user's custom claims in the auth provider
      })
   }

   async getGroupAdmins(groupId: string): Promise<GroupAdmin[]> {
      const adminsSnap = await this.firestore
         .collection("careerCenterData")
         .doc(groupId)
         .collection("groupAdmins")
         .get()

      return mapFirestoreDocuments(adminsSnap)
   }

   async checkIfThereWillBeAtLeastOneOwner(
      groupId: string,
      newRole: GROUP_DASHBOARD_ROLE,
      userEmail: string,
      currentAdmins: GroupAdmin[]
   ) {
      const potentialNewAdmins: Partial<GroupAdmin>[] = [
         ...currentAdmins.filter((admin) => admin.id !== userEmail),
         // add the new admin to the list of current admins if it's not already there
         ...(newRole ? [{ id: userEmail, role: newRole }] : []), // if the new role is null, then the user is being removed as an admin
      ]

      const totalOwners = potentialNewAdmins.filter(
         (admin) => admin.role === GROUP_DASHBOARD_ROLE.OWNER
      )

      return totalOwners.length > 0 // there must be at least one owner
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

   checkIfEmailHasAValidDashboardInvite(
      emailToCheck: string
   ): Promise<boolean> {
      return this.firestore
         .collection("groupDashboardInvites")
         .where("invitedEmail", "==", emailToCheck)
         .limit(1)
         .get()
         .then((snap) => !snap.empty)
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
