import functions = require("firebase-functions")
import { admin } from "./api/firestoreAdmin"
import config from "./config"

export const updateBreakoutRoomStatusOnWrite = functions
   .region(config.region)
   .firestore.document("livestreams/{livestream}/breakoutRooms/{breakoutRoom}")
   .onWrite(async (change) => {
      try {
         const breakoutRoomId = change.after.id
         const breakoutRoomAfter = change.after.data()
         const breakoutRoomBefore = change.before.data()
         const oldHasStarted =
            (breakoutRoomBefore && breakoutRoomBefore.hasStarted) || null
         const newHasStarted =
            (breakoutRoomAfter && breakoutRoomAfter.hasStarted) || null
         const mainLivestreamRef = change.after.ref.parent.parent

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
                  openRooms:
                     admin.firestore.FieldValue.arrayUnion(breakoutRoomId),
               },
               { merge: true }
            )
            functions.logger.info(
               `Breakout room: ${breakoutRoomId} of livestream: ${mainLivestreamRef.id} is Open`
            )
         } else if (breakoutRoomAfter && !breakoutRoomAfter.hasStarted) {
            await breakoutRoomSettingsRef.set(
               {
                  openRooms:
                     admin.firestore.FieldValue.arrayRemove(breakoutRoomId),
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
   })
