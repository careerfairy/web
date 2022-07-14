import ErrorContext from "../context/error/ErrorContext"
import { useCallback, useState } from "react"
import ErrorSnackBar from "../components/views/common/ErrorSnackBar/ErrorSnackBar"

const ErrorProvider = ({ children }) => {
   const [generalError, setGeneralError] = useState("")

   const handleClose = useCallback(() => {
      setGeneralError("")
   }, [])

   return (
      <ErrorContext.Provider value={{ generalError, setGeneralError }}>
         {children}
         <ErrorSnackBar handleClose={handleClose} errorMessage={generalError} />
      </ErrorContext.Provider>
   )
}

export default ErrorProvider
