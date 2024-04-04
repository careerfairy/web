import {
   collection,
   limit,
   onSnapshot,
   orderBy,
   query,
} from "firebase/firestore"
import { useEffect, useState } from "react"
import { useFirestore } from "reactfire"

type ChatCounterState = {
   initialLoad: boolean
   chatCount: number
   seenChatIdsMap: Map<string, boolean>
}

const defaultState: ChatCounterState = {
   initialLoad: true,
   chatCount: 0,
   seenChatIdsMap: new Map<string, boolean>(),
}

export const useNewChatCounter = (streamId: string, isActive: boolean) => {
   const db = useFirestore()

   const [chatCounter, setChatCounter] =
      useState<ChatCounterState>(defaultState)

   useEffect(() => {
      if (isActive && streamId) {
         const detachListener = onSnapshot(
            query(
               collection(db, "livestreams", streamId, "chatEntries"),
               orderBy("timestamp", "desc"),
               limit(1) // Only need the most recent chat for this to work
            ),
            (snapshot) => {
               setChatCounter((prevState) => {
                  let newChatCount = prevState.chatCount
                  const updatedSeenChatIdsMap = new Map(
                     prevState.seenChatIdsMap
                  )

                  snapshot.docChanges().forEach((docChange) => {
                     if (docChange.type === "added") {
                        const chatId = docChange.doc.id
                        // If the chat has not been seen, add it to the map and increment the count
                        if (!updatedSeenChatIdsMap.has(chatId)) {
                           updatedSeenChatIdsMap.set(chatId, true)
                           // Only increment if not initially loading
                           if (!prevState.initialLoad) {
                              newChatCount += 1
                           }
                        }
                     }
                  })

                  return {
                     chatCount: newChatCount,
                     seenChatIdsMap: updatedSeenChatIdsMap,
                     initialLoad: false,
                  }
               })
            }
         )

         return () => {
            setChatCounter(defaultState)
            detachListener()
         }
      }
   }, [isActive, db, streamId])

   return chatCounter.chatCount
}
