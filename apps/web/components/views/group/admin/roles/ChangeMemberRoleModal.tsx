import React, { useState } from "react"
import AreYouSureModal from "../../../../../materialUI/GlobalModals/AreYouSureModal"
import { GROUP_DASHBOARD_ROLE } from "@careerfairy/shared-lib/dist/groups"
import { useFirebaseService } from "../../../../../context/firebase/FirebaseServiceContext"
import useSnackbarNotifications from "../../../../custom-hook/useSnackbarNotifications"
import { useGroup } from "../../../../../layouts/GroupDashboardLayout"
import { Typography } from "@mui/material"

type Props = {
   modalData: {
      currentRole: GROUP_DASHBOARD_ROLE
      newRole: GROUP_DASHBOARD_ROLE
      displayName: string
      email: string
   }
   open: boolean
   handleClose: () => void
}
const ChangeMemberRoleModal = ({
   modalData: { email, newRole, currentRole, displayName },
   open,
   handleClose,
}: Props) => {
   const [changingRole, setChangingRole] = useState(false)

   const { successNotification, errorNotification } = useSnackbarNotifications()

   const { group } = useGroup()

   const { changeRole } = useFirebaseService()

   const handleChangeRole = async () => {
      try {
         setChangingRole(true)
         await changeRole({
            groupId: group.id,
            email: email,
            newRole: newRole,
         })
         successNotification("Role changed successfully")
         handleClose()
      } catch (e) {
         errorNotification(e)
      }
      setChangingRole(false)
   }
   return (
      <AreYouSureModal
         open={open}
         handleClose={handleClose}
         loading={changingRole}
         handleConfirm={handleChangeRole}
         message={
            <>
               <Typography gutterBottom variant={"body1"}>
                  This will change the <b>{currentRole}</b> role of{" "}
                  <b>{displayName}</b> to <b>{newRole}</b>?`
               </Typography>
               <Typography variant="body2">
                  {newRole === GROUP_DASHBOARD_ROLE.OWNER
                     ? "This user will have full access to the dashboard and will be able to invite other admins."
                     : "This user will have limited access to your dashboard."}
               </Typography>
            </>
         }
      />
   )
}

export default ChangeMemberRoleModal
