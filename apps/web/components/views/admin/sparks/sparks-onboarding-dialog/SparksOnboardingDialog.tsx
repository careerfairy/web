import { useAuth } from "HOCs/AuthProvider"
import React from "react"
import useSparksB2BOnboardingCompletion from "./useSparksB2BOnboardingCompletion"

const SparksOnboardingDialog = () => {
   const { userData } = useAuth()

   const data = useSparksB2BOnboardingCompletion(userData.id)

   return <div>SparksOnboardingDialog</div>
}

export default SparksOnboardingDialog
