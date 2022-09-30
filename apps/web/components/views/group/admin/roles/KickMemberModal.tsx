import React, { useState } from "react"
import AreYouSureModal from "../../../../../materialUI/GlobalModals/AreYouSureModal"
import { useFirebaseService } from "../../../../../context/firebase/FirebaseServiceContext"
import useSnackbarNotifications from "../../../../custom-hook/useSnackbarNotifications"
import { useGroup } from "../../../../../layouts/GroupDashboardLayout"
import { useAuth } from "../../../../../HOCs/AuthProvider"

type Props = {
   modalData: {
      displayName: string
      email: string
   }
   open: boolean
   handleClose: () => void
}
const KickMemberModal = ({
   modalData: { email, displayName },
   open,
   handleClose,
}: Props) => {
   const [kickingMember, setKickingMember] = useState(false)

   const { successNotification, errorNotification } = useSnackbarNotifications()
   const { authenticatedUser } = useAuth()

   const { group } = useGroup()

   const { kickFromDashboard } = useFirebaseService()

   const handleKickMember = async () => {
      try {
         setKickingMember(true)
         await kickFromDashboard({
            groupId: group.id,
            email: email,
         })
         const isMe = email === authenticatedUser.email
         successNotification(
            isMe ? "Successfully left group" : "Member kicked successfully"
         )
         handleClose()
      } catch (e) {
         errorNotification(e)
      }
      setKickingMember(false)
   }
   return (
      <AreYouSureModal
         open={open}
         handleClose={handleClose}
         loading={kickingMember}
         message={
            email === authenticatedUser.email
               ? `You are about to leave ${group.universityName}. In order to regain access at a later time, a Group Owner must invite you.`
               : `Are you sure you want to kick ${displayName}?`
         }
         handleConfirm={handleKickMember}
      />
   )
}

export default KickMemberModal
