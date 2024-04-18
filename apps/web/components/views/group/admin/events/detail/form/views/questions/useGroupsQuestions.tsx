import { Group, GroupQuestion } from "@careerfairy/shared-lib/groups"
import { reducedRemoteCallsOptions } from "components/custom-hook/utils/useFunctionsSWRFetcher"
import { collection, getDocs, query, where } from "firebase/firestore"
import { useMemo } from "react"
import { useFirestore } from "reactfire"
import useSWR from "swr"
import { LivestreamFormQuestionsTabValues } from "../../types"

type GroupQuestionsByGroup =
   LivestreamFormQuestionsTabValues["registrationQuestions"]

type ReturnType = {
   groupsQuestions: GroupQuestionsByGroup
   isLoading: boolean
   isValidating: boolean
   error: Error | null
}

export const useGroupsQuestions = (groups: Group[]): ReturnType => {
   const firestore = useFirestore()

   const groupIds = useMemo(
      () => groups.map((group) => group.groupId),
      [groups]
   )

   const fetchQuestions = async () => {
      try {
         const promises = groupIds.map((groupId) => {
            const q = query(
               collection(
                  firestore,
                  "careerCenterData",
                  groupId,
                  "groupQuestions"
               ),
               where("questionType", "==", "custom")
            )
            return getDocs(q)
         })

         const querySnapshots = await Promise.all(promises)
         return querySnapshots.flatMap((querySnapshot, index) =>
            querySnapshot.docs.map((doc) => {
               const question = { ...doc.data() } as GroupQuestion
               const group = groups.find(
                  (group) => group.groupId === groupIds[index]
               )

               return {
                  ...question,
                  groupId: groupIds[index],
                  groupName: group.universityName,
                  universityCode: group.universityCode,
               }
            })
         )
      } catch (error) {
         throw error instanceof Error ? error : new Error("An error occurred")
      }
   }

   const swrKey = `groupsQuestions-${groupIds.sort().join("-")}`

   const { data, isLoading, isValidating, error } = useSWR(
      groupIds.length > 0 ? swrKey : null,
      fetchQuestions,
      reducedRemoteCallsOptions
   )

   return {
      groupsQuestions: data || [],
      isLoading,
      isValidating,
      error,
   }
}
