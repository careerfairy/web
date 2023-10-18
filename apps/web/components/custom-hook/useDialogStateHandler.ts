import React, { useCallback } from "react"

/**
 * Custom hook to manage the open state of the dialog.
 *
 * @returns {[boolean, () => void, () => void]} An array containing:
 *   - `isOpen`: A boolean representing the state of the dialog.
 *   - `handleOpen`: A function to set the dialog state to open.
 *   - `handleClose`: A function to set the dialog state to closed.
 */
const useDialogStateHandler: () => [boolean, () => void, () => void] = () => {
   //  create a use dialog hook with a default value of false
   const [IsOpen, setIsOpen] = React.useState(false)

   const handleOpen = useCallback(() => {
      setIsOpen(true)
   }, [])

   const handleClose = useCallback(() => {
      setIsOpen(false)
   }, [])

   return [IsOpen, handleOpen, handleClose] as [boolean, () => void, () => void]
}

export default useDialogStateHandler
