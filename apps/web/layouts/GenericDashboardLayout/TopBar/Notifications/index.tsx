import { Box, CircularProgress } from "@mui/material"
import UserNotificationsButton from "./UserNotificationsButton"
import { useAuth } from "../../../../HOCs/AuthProvider"
import { SuspenseWithBoundary } from "../../../../components/ErrorBoundary"
import useMenuState from "../../../../components/custom-hook/useMenuState"
import useUserNotifications from "../../../../components/custom-hook/useUserNotifications"
import NotificationsMenu from "./NotificationsMenu"
import { useCallback } from "react"
import { userRepo } from "../../../../data/RepositoryInstances"

const Notifications = () => {
   const { userData } = useAuth()

   if (!userData || !userData.id) {
      return null
   }

   return (
      <Box>
         <SuspenseWithBoundary fallback={<CircularProgress />} hide>
            <Component userEmail={userData.userEmail} />
         </SuspenseWithBoundary>
      </Box>
   )
}

export default Notifications

type ComponentProps = {
   userEmail: string
}

const Component = ({ userEmail }: ComponentProps) => {
   const { handleClick, handleClose, anchorEl } = useMenuState()
   const notifications = useUserNotifications(userEmail)

   const handleDeleteNotifications = useCallback(async () => {
      await userRepo.deleteAllUserNotifications(userEmail)
   }, [userEmail])

   const handleNotificationClick = useCallback(
      async (notificationId: string) => {
         handleClose()
         void userRepo.markUserNotificationAsRead(userEmail, notificationId)
      },
      [handleClose, userEmail]
   )

   return (
      <>
         <UserNotificationsButton
            notifications={notifications}
            handleClick={handleClick}
            anchorEl={anchorEl}
         />

         <NotificationsMenu
            anchorEl={anchorEl}
            notifications={notifications}
            handleClose={handleClose}
            handleClick={handleNotificationClick}
            handleDeleteNotifications={handleDeleteNotifications}
         />
      </>
   )
}
