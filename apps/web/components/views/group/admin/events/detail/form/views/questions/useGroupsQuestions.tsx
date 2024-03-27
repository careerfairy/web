import { Group, GroupQuestion } from "@careerfairy/shared-lib/groups"
import { collection, getDocs, query, where } from "firebase/firestore"
import { useEffect, useMemo, useState } from "react"
import { useFirestore } from "reactfire"
import { LivestreamFormQuestionsTabValues } from "../../types"

type GroupQuestionsByGroup =
   LivestreamFormQuestionsTabValues["registrationQuestions"]
type ReturnType = {
   groupsQuestions: GroupQuestionsByGroup
   isLoading: boolean
   error: Error | null
}

export const useGroupsQuestions = (groups: Group[]): ReturnType => {
   const firestore = useFirestore()

   const [groupsQuestions, setGroupsQuestions] =
      useState<GroupQuestionsByGroup>([])
   const [isLoading, setIsLoading] = useState<boolean>(true)
   const [error, setError] = useState<Error | null>(null)

   const groupIds = useMemo(() => groups.map((group) => group.id), [groups])

   useEffect(() => {
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
            const allQuestions: GroupQuestionsByGroup = querySnapshots.flatMap(
               (querySnapshot, index) =>
                  querySnapshot.docs.map((doc) => {
                     const question = { ...doc.data() } as GroupQuestion
                     const group = groups.find(
                        (group) => group.id === groupIds[index]
                     )
                     return {
                        ...question,
                        groupId: groupIds[index],
                        groupName: group.universityName,
                        universityCode: group.universityCode,
                     }
                  })
            )

            setGroupsQuestions(allQuestions)
         } catch (err) {
            setError(
               err instanceof Error ? err : new Error("An error occurred")
            )
         } finally {
            setIsLoading(false)
         }
      }

      fetchQuestions()
   }, [firestore, groupIds, groups])

   return { groupsQuestions, isLoading, error }
}
