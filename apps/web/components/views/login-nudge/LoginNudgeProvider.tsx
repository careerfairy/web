import { ReactNode } from "react"
import { LoginNudgeOverlay } from "./LoginNudgeOverlay"

type LoginNudgeProviderProps = {
   children: ReactNode
}

// Wrapper component to handle the login nudge overlay
export const LoginNudgeProvider = ({ children }: LoginNudgeProviderProps) => {
   return <LoginNudgeOverlay>{children}</LoginNudgeOverlay>
}
