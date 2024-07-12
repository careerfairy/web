import { UserReminderType } from "@careerfairy/shared-lib/users"
import { createContext } from "react"

export type IUserReminderContext = {
   forceShowReminder: (reminderType: UserReminderType) => void
}

const UserReminderContext = createContext<IUserReminderContext>({
   forceShowReminder: () => {},
})

export default UserReminderContext
