import { Group } from "@careerfairy/shared-lib/dist/groups"
import { Creator } from "@careerfairy/shared-lib/dist/groups/creators"
import { Speaker } from "@careerfairy/shared-lib/dist/livestreams"
import { groupTriGrams } from "@careerfairy/shared-lib/dist/utils/search"
import { faker } from "@faker-js/faker"
import { Timestamp } from "firebase-admin/firestore"
import { groupQuestions } from "../groups"
import { firestore } from "../lib/firebase"

/**
 * Pure function to create a group document in Firestore
 * Can be used by any seed that needs to create groups
 */
export async function createGroupDocument(
   groupId: string,
   overrideFields?: Partial<Group>
): Promise<Group> {
   const batch = firestore.batch()

   const universityName =
      faker.company.companyName().replace(/[^a-zA-Z\d ]/g, "") ??
      "My university"

   let data: Group = {
      id: groupId,
      groupId: groupId,
      description: faker.company.bs(),
      logoUrl: faker.image.business(),
      bannerImageUrl: faker.image.business(),
      test: false,
      universityName,
      normalizedUniversityName: universityName.toLowerCase(),
      triGrams: groupTriGrams(universityName),
      atsAdminPageFlag: true,
   }

   data = Object.assign(data, overrideFields)

   // Add group questions
   groupQuestions.forEach((questionData) => {
      const questionRef = firestore
         .collection("careerCenterData")
         .doc(groupId)
         .collection("groupQuestions")
         .doc(questionData.id)
      batch.set(questionRef, questionData)
   })

   const groupRef = firestore.collection("careerCenterData").doc(groupId)
   batch.set(groupRef, data)

   await batch.commit()

   return data
}

/**
 * Check if a group exists in Firestore
 */
export async function groupExists(groupId: string): Promise<boolean> {
   const groupRef = firestore.collection("careerCenterData").doc(groupId)
   const groupSnap = await groupRef.get()
   return groupSnap.exists
}

/**
 * Get a group from Firestore
 */
export async function getGroup(groupId: string): Promise<Group | null> {
   const groupDoc = await firestore
      .collection("careerCenterData")
      .doc(groupId)
      .get()
   return groupDoc.exists ? (groupDoc.data() as Group) : null
}

export async function creatorExists(creatorId: string): Promise<boolean> {
   const creatorSnapshot = await firestore
      .collectionGroup("creators")
      .where("id", "==", creatorId)
      .limit(1)
      .get()

   return !creatorSnapshot.empty
}

export async function createCreatorDocument(
   speaker: Speaker,
   groupId: string
): Promise<Creator> {
   const creatorData: Creator = {
      // @ts-ignore
      createdAt: Timestamp.now(),
      // @ts-ignore
      updatedAt: Timestamp.now(),
      id: speaker.id, // We use the firestore auto generated id
      documentType: "groupCreator",
      email: faker.internet.email(speaker.firstName, speaker.lastName),
      avatarUrl: speaker.avatar || "",
      story: speaker.background || "",
      groupId,
      roles: speaker.roles || [],
      linkedInUrl: speaker.linkedInUrl || "",
      firstName: speaker.firstName || "",
      lastName: speaker.lastName || "",
      position: speaker.position || "",
   }

   await firestore
      .collection("careerCenterData")
      .doc(groupId)
      .collection("creators")
      .doc(creatorData.id)
      .set(creatorData)

   return creatorData
}
