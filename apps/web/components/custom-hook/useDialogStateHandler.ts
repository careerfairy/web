import React, { useCallback } from "react"

/**
 * Custom hook to manage the open state of the dialog.
 *
 * @returns {[boolean, () => void, () => void]} An array containing:
 *   - `isOpen`: A boolean representing the state of the dialog.
 *   - `handleOpen`: A function to set the dialog state to open.
 *   - `handleClose`: A function to set the dialog state to closed.
 */
const useDialogStateHandler: (
   initialValue?: boolean
) => [boolean, () => void, () => void] = (initialValue: boolean = false) => {
   //  create a use dialog hook with a default value of false
   const [isOpen, setIsOpen] = React.useState<boolean>(initialValue)

   const handleOpen = useCallback(() => {
      setIsOpen(true)
   }, [])

   const handleClose = useCallback(() => {
      setIsOpen(false)
   }, [])

   return [isOpen, handleOpen, handleClose] as [boolean, () => void, () => void]
}

export default useDialogStateHandler
