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
}

const defaultState: ChatCounterState = {
   initialLoad: true,
   chatCount: 0,
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
               snapshot.docChanges().forEach((docChange) => {
                  if (docChange.type === "added") {
                     setChatCounter((prevState) => {
                        return {
                           ...prevState,
                           chatCount: prevState.initialLoad
                              ? 0
                              : prevState.chatCount + 1,
                           initialLoad: false,
                        }
                     })
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
