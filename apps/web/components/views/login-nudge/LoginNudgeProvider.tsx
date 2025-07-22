import { LoginNudgeOverlay } from "./LoginNudgeOverlay"

// Wrapper component to handle the login nudge overlay
export const LoginNudgeProvider = ({ children }) => {
   return (
      <>
         {children}
         <LoginNudgeOverlay />
      </>
   )
}
