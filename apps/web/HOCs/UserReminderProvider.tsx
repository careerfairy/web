import UserReminderContext from "context/userReminder/UserRemindersContext"
import NewsletterSnackbar from "../components/views/common/NewsletterSnackbar"
import { useAuth } from "./AuthProvider"
import { useCallback, useEffect, useState } from "react"
import { userRepo } from "../data/RepositoryInstances"
import {
   IUserReminder,
   UserReminderType,
} from "@careerfairy/shared-lib/dist/users"

const UserReminderProvider = ({ children }) => {
   const [reminders, setReminders] = useState<IUserReminder[]>([])
   const { userData } = useAuth()

   // To verify if there's any reminder ready to be shown, if yes add it to the reminders state
   useEffect(() => {
      const userId = userData?.id
      if (userId) {
         ;(async () => {
            try {
               const reminders = await userRepo.getUserReminders(userId)

               if (reminders.length) {
                  setReminders(reminders)
               }
            } catch (e) {
               console.error("Error getting the user Reminders ->", e)
            }
         })()
      }
   }, [userData?.id])

   const getReminders = useCallback(() => {
      return reminders.map((reminder: IUserReminder) => {
         // Prepared to handle future reminders
         switch (reminder.type) {
            case UserReminderType.NewsletterReminder:
               return (
                  <NewsletterSnackbar
                     isFinalReminder={!!reminder.isFinalReminder}
                     key={reminder.type}
                  />
               )
         }
      })
   }, [reminders])

   return (
      <UserReminderContext.Provider value={{}}>
         <>
            {children}
            {getReminders()}
         </>
      </UserReminderContext.Provider>
   )
}

export default UserReminderProvider
