import UserReminderContext, {
   IUserReminderContext,
} from "context/userReminder/UserRemindersContext"
import NewsletterSnackbar from "../components/views/common/NewsletterSnackbar"
import { useAuth } from "./AuthProvider"
import { useCallback, useContext, useEffect, useMemo, useState } from "react"
import { userRepo } from "../data/RepositoryInstances"
import { IUserReminder, UserReminderType } from "@careerfairy/shared-lib/users"
import { errorLogAndNotify } from "../util/CommonUtil"

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
               errorLogAndNotify(e)
            }
         })()
      }
   }, [userData?.id])

   const forceShowReminder = useCallback(
      async (reminderType) => {
         // Confirm the userData is loaded and the user is not unsubscribed
         if (!userData?.id || userData?.unsubscribed === false) {
            return
         }

         // Confirm if the reminder is shown, if yes do nothing
         const visibleReminder = reminders.some(
            (reminder) => reminder.type === reminderType
         )
         if (visibleReminder) {
            return
         }

         try {
            const userReminder = await userRepo.getUserReminder(
               userData.id,
               reminderType
            )

            // If reminder was already completed or isn't the 1st one, do nothing
            if (
               userReminder?.complete ||
               userReminder?.isFirstReminder === false
            ) {
               return
            }

            // Create and show reminder
            const reminder = {
               complete: false,
               type: reminderType,
               notBeforeThan: new Date(),
               isFirstReminder: true,
            } as IUserReminder

            await userRepo.updateUserReminder(userData.id, reminder)
            setReminders((prevReminders) => [...prevReminders, reminder])
         } catch (e) {
            errorLogAndNotify(e)
         }
      },
      [reminders, userData?.id, userData?.unsubscribed]
   )

   const contextValue = useMemo(
      () => ({
         forceShowReminder,
      }),
      [forceShowReminder]
   )

   const getReminders = useCallback(() => {
      return reminders.map((reminder: IUserReminder) => {
         // Prepared to handle future reminders
         switch (reminder.type) {
            case UserReminderType.NewsletterReminder:
               return (
                  <NewsletterSnackbar
                     isFirstReminder={reminder.isFirstReminder}
                     key={reminder.type}
                  />
               )
         }
      })
   }, [reminders])

   return (
      <UserReminderContext.Provider value={contextValue}>
         <>
            {children}
            {getReminders()}
         </>
      </UserReminderContext.Provider>
   )
}

export const useUserReminders = () =>
   useContext<IUserReminderContext>(UserReminderContext)

export default UserReminderProvider
