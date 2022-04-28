import React, { useCallback } from "react"

/**
 * Custom hook to manage the open state of the dialog
 *       - returns [isOpen, handleOpen, handleClose]
 */
const useDialog: () => [boolean, () => void, () => void] = () => {
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

export default useDialog
