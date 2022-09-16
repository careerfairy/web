import { createContext, Dispatch, useContext, useMemo, useState } from "react"

type DefaultContext = {
   formCompleted: boolean
   setFormCompleted: Dispatch<boolean>
   selectedEventId: string
   setSelectedEventId: Dispatch<string>
}

const MarketingLandingPageContext = createContext<DefaultContext>({
   formCompleted: false,
   selectedEventId: "",
   setSelectedEventId: () => {},
   setFormCompleted: () => {},
})

const MarketingLandingPageProvider = ({ children }): JSX.Element => {
   const [formCompleted, setFormCompleted] = useState(false)
   const [selectedEventId, setSelectedEventId] = useState("")

   const contextValue = useMemo(
      () => ({
         selectedEventId,
         setSelectedEventId,
         formCompleted,
         setFormCompleted,
      }),
      [formCompleted, selectedEventId]
   )

   return (
      <MarketingLandingPageContext.Provider value={contextValue}>
         {children}
      </MarketingLandingPageContext.Provider>
   )
}

const useMarketingLandingPage = () =>
   useContext<DefaultContext>(MarketingLandingPageContext)

export { MarketingLandingPageProvider, useMarketingLandingPage }
