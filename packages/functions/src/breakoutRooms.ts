import functions = require("firebase-functions")
import { onDocumentUpdated } from "firebase-functions/firestore"
import { FieldValue } from "./api/firestoreAdmin"

export const updateBreakoutRoomStatusOnWrite = onDocumentUpdated(
   "livestreams/{livestream}/breakoutRooms/{breakoutRoom}",
   async (event) => {
      try {
         const breakoutRoomId = event.params.breakoutRoom
         const breakoutRoomAfter = event.data?.after?.data()
         const breakoutRoomBefore = event.data?.before?.data()
         const oldHasStarted =
            (breakoutRoomBefore && breakoutRoomBefore.hasStarted) || null
         const newHasStarted =
            (breakoutRoomAfter && breakoutRoomAfter.hasStarted) || null
         const mainLivestreamRef = event.data?.after?.ref.parent.parent

         if (oldHasStarted === newHasStarted) {
            functions.logger.info(
               `The status of Breakout room: ${breakoutRoomId} of livestream: ${mainLivestreamRef.id} has not changed`
            )
            return
         }
         const breakoutRoomSettingsRef = mainLivestreamRef
            .collection("breakoutRoomsSettings")
            .doc("breakoutRoomsSetting")

         if (breakoutRoomAfter && breakoutRoomAfter.hasStarted) {
            await breakoutRoomSettingsRef.set(
               {
                  openRooms: FieldValue.arrayUnion(breakoutRoomId),
               },
               { merge: true }
            )
            functions.logger.info(
               `Breakout room: ${breakoutRoomId} of livestream: ${mainLivestreamRef.id} is Open`
            )
         } else if (breakoutRoomAfter && !breakoutRoomAfter.hasStarted) {
            await breakoutRoomSettingsRef.set(
               {
                  openRooms: FieldValue.arrayRemove(breakoutRoomId),
               },
               { merge: true }
            )
            functions.logger.info(
               `Breakout room: ${breakoutRoomId} of livestream: ${mainLivestreamRef.id}  is Closed`
            )
         }
      } catch (error) {
         functions.logger.error(
            "failed to update breakout rooms status with error:",
            error
         )
      }
   }
)
