import { createContext, FC, useContext, useMemo } from "react"
import useDialogStateHandler from "../components/custom-hook/useDialogStateHandler"
import CreditsDialog from "../components/views/credits-dialog/CreditsDialog"

type Props = {
   children: React.ReactNode
}

type ICreditsDialogContext = {
   creditsDialogOpen: boolean
   handleOpenCreditsDialog: () => void
   handleCloseCreditsDialog: () => void
}
const CreditsDialogLayout: FC<Props> = ({ children }) => {
   const [
      creditsDialogOpen,
      handleOpenCreditsDialog,
      handleCloseCreditsDialog,
   ] = useDialogStateHandler()

   const contextValue = useMemo<ICreditsDialogContext>(
      () => ({
         creditsDialogOpen,
         handleOpenCreditsDialog,
         handleCloseCreditsDialog,
      }),
      [creditsDialogOpen, handleCloseCreditsDialog, handleOpenCreditsDialog]
   )

   return (
      <CreditsDialogContext.Provider value={contextValue}>
         {children}
         <CreditsDialog
            onClose={handleCloseCreditsDialog}
            open={creditsDialogOpen}
         />
      </CreditsDialogContext.Provider>
   )
}
const CreditsDialogContext = createContext<ICreditsDialogContext>({
   creditsDialogOpen: false,
   handleOpenCreditsDialog: () => {},
   handleCloseCreditsDialog: () => {},
})

export const useCreditsDialog = () => {
   const context = useContext(CreditsDialogContext)
   if (!context) {
      throw new Error(
         "useCreditsDialog must be used within a CreditsDialogContextProvider"
      )
   }
   return context
}

export default CreditsDialogLayout
