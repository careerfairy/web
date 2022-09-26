import React from "react"

interface NotificationsContextInterface {
   notifications: any[]
   setNewNotification: React.Dispatch<React.SetStateAction<any>>
}
const NotificationsContext = React.createContext<NotificationsContextInterface>(
   {
      notifications: [],
      setNewNotification: () => {},
   } as NotificationsContextInterface
)

export default NotificationsContext
