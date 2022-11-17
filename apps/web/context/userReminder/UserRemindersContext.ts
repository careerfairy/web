import { createContext } from "react"

type IUserReminderContext = {}

const UserReminderContext = createContext<IUserReminderContext>({})

export default UserReminderContext
