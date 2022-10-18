import { createContext, Dispatch, useContext, useMemo, useState } from "react"

type DefaultContext = {
   isOnCreationForm: boolean
   showJobSection: boolean
   setShowJobSection: Dispatch<boolean>
}

const StreamCreationContext = createContext<DefaultContext>({
   isOnCreationForm: true,
   showJobSection: false,
   setShowJobSection: () => {},
})

const StreamCreationProvider = ({ children }) => {
   const [showJobSection, setShowJobSection] = useState(false)

   const contextValue = useMemo(
      () => ({
         isOnCreationForm: true,
         showJobSection,
         setShowJobSection,
      }),
      [showJobSection]
   )

   return (
      <StreamCreationContext.Provider value={contextValue}>
         {children}
      </StreamCreationContext.Provider>
   )
}

const useStreamCreationProvider = () =>
   useContext<DefaultContext>(StreamCreationContext)

export { StreamCreationProvider, useStreamCreationProvider }
