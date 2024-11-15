import { CircularProgress } from "@mui/material"
import { useCallback } from "react"
import { useAuth } from "../../../../HOCs/AuthProvider"
import { SuspenseWithBoundary } from "../../../../components/ErrorBoundary"
import useMenuState from "../../../../components/custom-hook/useMenuState"
import useUserNotifications from "../../../../components/custom-hook/useUserNotifications"
import { userRepo } from "../../../../data/RepositoryInstances"
import NotificationsMenu from "./NotificationsMenu"
import UserNotificationsButton from "./UserNotificationsButton"

const Notifications = () => {
   const { userData } = useAuth()

   if (!userData || !userData.id) {
      return null
   }

   return (
      <SuspenseWithBoundary fallback={<CircularProgress />} hide>
         <Component userEmail={userData.userEmail} />
      </SuspenseWithBoundary>
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
