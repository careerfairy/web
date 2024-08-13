import {
   ReactNode,
   createContext,
   useCallback,
   useContext,
   useMemo,
   useState,
} from "react"
import { SnackbarNotification } from "./SnackbarNotification"

export type SnackbarNotification = {
   id: string
   notification: ReactNode
   type: SnackbarNotificationType
}

export enum SnackbarNotificationType {
   CTA = "cta",
   FEEDBACK_QUESTION = "feedback-question",
}

type SnackbarNotificationsContextType = {
   queueNotification: (...notifications: SnackbarNotification[]) => void
   removeNotification: (...notificationIds: string[]) => void
   clearNotifications: () => void
   notifications: SnackbarNotification[]
   activeNotification: SnackbarNotification | null
   showNotifications: boolean
}

const SnackbarNotificationsContext = createContext<
   SnackbarNotificationsContextType | undefined
>(undefined)

type Props = {
   children: ReactNode
}

export const SnackbarNotificationsProvider = ({ children }: Props) => {
   /** The queue of notifications that will show up to the user
    * Using a Map disregards duplicates, and the object indirection
    * avoids recreating a new Map at every set state */
   const [notifications, setNotifications] = useState<{
      queue: Map<SnackbarNotification["id"], SnackbarNotification>
   }>({ queue: new Map() })

   const showNotifications = Boolean(notifications?.queue?.size >= 1)

   const allNotifications = useMemo(
      () => [...notifications.queue.values()],
      [notifications]
   )
   const firstActiveNotification = useMemo(() => {
      const [firstNotification] = allNotifications
      return firstNotification
   }, [allNotifications])

   const removeNotification = useCallback((...notificationIds: string[]) => {
      setNotifications((prev) => {
         notificationIds.forEach((notificationId) => {
            prev.queue.delete(notificationId)
         })
         return { queue: prev.queue }
      })
   }, [])

   const queueNotification = useCallback(
      (...notifications: SnackbarNotification[]) => {
         setNotifications((prev) => {
            notifications.forEach((notification) => {
               prev.queue.set(notification.id, notification)
            })
            return { queue: prev.queue }
         })
      },
      []
   )

   const clearNotifications = useCallback(() => {
      setNotifications({ queue: new Map() })
   }, [])

   const value = useMemo<SnackbarNotificationsContextType>(
      () => ({
         activeNotification: firstActiveNotification,
         notifications: allNotifications,
         queueNotification,
         removeNotification,
         showNotifications,
         clearNotifications,
      }),
      [
         firstActiveNotification,
         allNotifications,
         queueNotification,
         removeNotification,
         showNotifications,
         clearNotifications,
      ]
   )
   return (
      <SnackbarNotificationsContext.Provider value={value}>
         {children}
         <SnackbarNotification
            open={showNotifications}
            notification={firstActiveNotification?.notification}
         />
      </SnackbarNotificationsContext.Provider>
   )
}

export const useSnackbarNotifications = () => {
   const context = useContext(SnackbarNotificationsContext)
   if (!context) {
      throw new Error(
         "useSnackbarNotifications must be used within a SnackbarNotificationsProvider"
      )
   }
   return context
}
