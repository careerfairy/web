import { mapFirestoreDocuments } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { GroupQuestion } from "@careerfairy/shared-lib/groups"
import { groupRepo } from "data/RepositoryInstances"
import { useEffect, useState } from "react"

export const useGroupQuestions = (groupId: string) => {
   const [groupQuestions, setGroupQuestions] = useState<GroupQuestion[]>([])
   const [questionsLoaded, setQuestionsLoaded] = useState<boolean>(false)

   useEffect(() => {
      if (!groupId) {
         setGroupQuestions([])
         setQuestionsLoaded(false)
         return
      }

      const unsubscribe = groupRepo.listenToGroupQuestions(
         groupId,
         (snapshot) => {
            const mappedQuestions =
               mapFirestoreDocuments<GroupQuestion>(snapshot) || []
            setGroupQuestions(mappedQuestions)
            setQuestionsLoaded(true)
         }
      )

      return () => {
         unsubscribe()
         setQuestionsLoaded(false)
         setGroupQuestions([])
      }
   }, [groupId])

   return { groupQuestions, questionsLoaded }
}
