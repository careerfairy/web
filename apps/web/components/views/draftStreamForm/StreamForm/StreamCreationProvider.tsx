import { createContext, Dispatch, useContext, useMemo, useState } from "react"

type DefaultContext = {
   showJobSection: boolean
   setShowJobSection: Dispatch<boolean>
   showPromotionInputs: boolean
   setShowPromotionInputs: Dispatch<boolean>
   formHasChanged: boolean
   setFormHasChanged: Dispatch<boolean>
   isPromotionInputsDisabled: boolean
   setIsPromotionInputsDisabled: Dispatch<boolean>
}

const StreamCreationContext = createContext<DefaultContext>({
   showJobSection: false,
   setShowJobSection: () => {},
   showPromotionInputs: false,
   setShowPromotionInputs: () => {},
   formHasChanged: false,
   setFormHasChanged: () => {},
   isPromotionInputsDisabled: false,
   setIsPromotionInputsDisabled: () => {},
})

const StreamCreationProvider = ({ children }) => {
   const [showJobSection, setShowJobSection] = useState(false)
   const [showPromotionInputs, setShowPromotionInputs] = useState(false)
   const [formHasChanged, setFormHasChanged] = useState(false)
   const [isPromotionInputsDisabled, setIsPromotionInputsDisabled] =
      useState(false)

   const contextValue = useMemo(
      () => ({
         showJobSection,
         setShowJobSection,
         showPromotionInputs,
         setShowPromotionInputs,
         formHasChanged,
         setFormHasChanged,
         isPromotionInputsDisabled,
         setIsPromotionInputsDisabled,
      }),
      [
         formHasChanged,
         isPromotionInputsDisabled,
         showJobSection,
         showPromotionInputs,
      ]
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
