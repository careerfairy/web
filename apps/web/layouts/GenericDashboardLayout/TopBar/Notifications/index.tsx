import { Box, CircularProgress } from "@mui/material"
import UserNotificationsButton from "./UserNotificationsButton"
import { useAuth } from "../../../../HOCs/AuthProvider"
import { SuspenseWithBoundary } from "../../../../components/ErrorBoundary"
import useMenuState from "../../../../components/custom-hook/useMenuState"
import useUserNotifications from "../../../../components/custom-hook/useUserNotifications"
import NotificationsMenu from "./NotificationsMenu"
import { PublicUserNotification } from "@careerfairy/shared-lib/users/userNotifications"
import { FieldValue } from "../../../../data/firebase/FirebaseInstance"
import { Timestamp } from "@careerfairy/shared-lib/firebaseTypes"
import { useCallback, useState } from "react"

const Notifications = () => {
   const { userData } = useAuth()

   return (
      <Box>
         <SuspenseWithBoundary fallback={<CircularProgress />} hide>
            {userData?.userEmail ? (
               <Component userEmail={userData.userEmail} />
            ) : null}
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

   const [mock, setMock] = useState(mockNotifications)

   const handleDeleteNotifications = useCallback(() => {
      setMock([])
   }, [])

   return (
      <>
         <UserNotificationsButton
            notifications={mock}
            handleClick={handleClick}
         />

         <NotificationsMenu
            anchorEl={anchorEl}
            notifications={mock}
            handleClose={handleClose}
            handleDeleteNotifications={handleDeleteNotifications}
         />
      </>
   )
}

const mockNotifications: PublicUserNotification[] = [
   {
      id: "Notification1",
      createdAt: FieldValue.serverTimestamp() as Timestamp,
      message: "Jane Street has recently published a new Spark. Watch it now!",
      companyName: "Jane Street",
      isRead: false,
      imageUrl:
         "http://localhost:3000/_next/image?url=https%3A%2F%2Ffirebasestorage.googleapis.com%2Fv0%2Fb%2Fcareerfairy-e1fd9.appspot.com%2Fo%2Fgroup-logos%252F9c7a38bb-d0d3-4b54-a25c-e15cfb85b7fd_ogo_cc_1200x900.png%3Falt%3Dmedia%26token%3D1fbda507-2c08-4646-8d5c-f5d50cfd2dc1&w=256&q=90",
      actionUrl: "HTTPS://NOTIFICATION-1",
   },
   {
      id: "Notification2",
      createdAt: FieldValue.serverTimestamp() as Timestamp,
      message:
         "The live stream from Google that you’ve subscribed for is starting soon!",
      isRead: true,
      actionUrl: "HTTPS://NOTIFICATION-2",
      companyName: "Google",
   },
   {
      id: "Notification3",
      createdAt: FieldValue.serverTimestamp() as Timestamp,
      message:
         "You’ve missed a live stream! But no worries, your recording is ready and free for 5 days",
      isRead: false,
      imageUrl:
         "http://localhost:3000/_next/image?url=https%3A%2F%2Ffirebasestorage.googleapis.com%2Fv0%2Fb%2Fcareerfairy-e1fd9.appspot.com%2Fo%2Fgroup-logos%252F32036c54-10a7-4aed-a9e4-66dabbe7f8a0_nter_2_680x680.png%3Falt%3Dmedia%26token%3De4637a34-689e-4abc-b221-04613e6c3f66&w=48&q=75",
      actionUrl: "HTTPS://NOTIFICATION-3",
   },
   {
      id: "Notification4",
      createdAt: FieldValue.serverTimestamp() as Timestamp,
      message: "Message Message Message from notification 3",
      isRead: false,
      imageUrl:
         "http://localhost:3000/_next/image?url=https%3A%2F%2Ffirebasestorage.googleapis.com%2Fv0%2Fb%2Fcareerfairy-e1fd9.appspot.com%2Fo%2Fgroup-logos%252F32036c54-10a7-4aed-a9e4-66dabbe7f8a0_nter_2_680x680.png%3Falt%3Dmedia%26token%3De4637a34-689e-4abc-b221-04613e6c3f66&w=48&q=75",
      actionUrl: "HTTPS://NOTIFICATION-3",
   },
   {
      id: "Notification5",
      createdAt: FieldValue.serverTimestamp() as Timestamp,
      message: "Message Message Message from notification 3",
      isRead: true,
      imageUrl:
         "http://localhost:3000/_next/image?url=https%3A%2F%2Ffirebasestorage.googleapis.com%2Fv0%2Fb%2Fcareerfairy-e1fd9.appspot.com%2Fo%2Fgroup-logos%252F32036c54-10a7-4aed-a9e4-66dabbe7f8a0_nter_2_680x680.png%3Falt%3Dmedia%26token%3De4637a34-689e-4abc-b221-04613e6c3f66&w=48&q=75",
      actionUrl: "HTTPS://NOTIFICATION-3",
   },
]
