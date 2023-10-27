import React, { createContext, useContext, FC } from "react"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"

export type ActionButtonContextType = {
   onRegisterClick: (floating: boolean) => void
   livestreamPresenter: LivestreamPresenter
   userEmailFromServer: string
   isFloating?: boolean
   heroVisible?: boolean
   canWatchRecording?: boolean
   /*
    * Force dark subtext color for legacy upcoming livestreams page
    * */
   forceDarkSubText?: boolean
}

const ActionButtonContext = createContext<ActionButtonContextType>({
   isFloating: false,
   onRegisterClick: () => {},
   livestreamPresenter: null,
   heroVisible: false,
   forceDarkSubText: false,
   canWatchRecording: false,
   userEmailFromServer: null,
})

const ActionButtonProvider: FC<
   ActionButtonContextType & {
      children: React.ReactNode
   }
> = (props) => {
   return (
      <ActionButtonContext.Provider value={props}>
         {props.children}
      </ActionButtonContext.Provider>
   )
}

export const useActionButtonContext = (): ActionButtonContextType => {
   const context = useContext(ActionButtonContext)
   if (!context) {
      throw new Error(
         "useActionButtonContext must be used within an ActionButtonProvider"
      )
   }
   return context
}

export default ActionButtonProvider
