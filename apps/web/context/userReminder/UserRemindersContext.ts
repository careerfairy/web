import { createContext } from "react"
import { UserReminderType } from "@careerfairy/shared-lib/dist/users"

export type IUserReminderContext = {
   forceShowReminder: (reminderType: UserReminderType) => void
}

const UserReminderContext = createContext<IUserReminderContext>({
   forceShowReminder: () => {},
})

export default UserReminderContext
