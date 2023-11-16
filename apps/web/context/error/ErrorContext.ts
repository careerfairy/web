import React from "react"

type ErrorContextType = {
   generalError: string
   setGeneralError: (value: string) => void
}

const ErrorContext = React.createContext<ErrorContextType | null>(null)

export default ErrorContext
