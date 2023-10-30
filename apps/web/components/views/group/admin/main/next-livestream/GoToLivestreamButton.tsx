import { AdminGroupsClaim, UserData } from "@careerfairy/shared-lib/users"
import { LoadingButton } from "@mui/lab"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { firebaseServiceInstance } from "data/firebase/FirebaseService"
import { useAuth } from "HOCs/AuthProvider"
import { useRouter } from "next/router"
import { useCallback, useState } from "react"
import { buildStreamerLink } from "util/streamUtil"

export const GoToLivestreamButton = ({
   livestreamId,
}: {
   livestreamId: string
}) => {
   const {
      query: { groupId },
   } = useRouter()
   const { userData, adminGroups } = useAuth()
   const [loading, setLoading] = useState(false)
   const { errorNotification } = useSnackbarNotifications()

   // fetch the livestream token and then open the streamer view
   // in a new tab
   const onClickHandler = useCallback(() => {
      setLoading(true)
      firebaseServiceInstance
         .getLivestreamSecureToken(livestreamId)
         .then((doc) => {
            if (doc.exists) {
               let secureToken: string = doc.data().value
               const type = getUserJoiningLinkType(
                  userData,
                  groupId as string,
                  adminGroups
               )

               window
                  .open(
                     buildStreamerLink(type, livestreamId, secureToken),
                     "_blank"
                  )
                  .focus()
            } else {
               errorNotification(
                  "Live stream doesn't have a secure token",
                  "Failed to redirect to the live stream",
                  {
                     livestreamId,
                  }
               )
            }
         })
         .catch((e) => {
            errorNotification(e, "Failed to redirect to the live stream", {
               livestreamId,
            })
         })
         .finally(() => {
            setLoading(false)
         })
   }, [adminGroups, errorNotification, groupId, livestreamId, userData])

   return (
      <LoadingButton
         loading={loading}
         color="secondary"
         variant="contained"
         onClick={onClickHandler}
      >
         Go to Live Stream
      </LoadingButton>
   )
}

function getUserJoiningLinkType(
   userData: UserData,
   groupId: string,
   adminGroups: AdminGroupsClaim
) {
   if (userData?.isAdmin) {
      return "main-streamer"
   }

   const role = adminGroups[groupId as string]

   if (role.role === "OWNER") {
      return "main-streamer"
   }

   return "joining-streamer"
}
