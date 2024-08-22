import { addUtmTagsToLink } from "@careerfairy/shared-lib/utils"
import { getBaseUrl } from "components/helperFunctions/HelperFunctions"
import { createContext, useCallback, useContext, useMemo } from "react"

type Props = {
   partnerSource: string
   children: React.ReactNode
}
type PartnershipContextType = {
   partnerSource?: string
   handlePartnerEventClick: (eventId: string) => void
   getPartnerEventLink: (eventId: string) => string
}

const PartnershipContext = createContext<PartnershipContextType>({
   handlePartnerEventClick: () => null,
   getPartnerEventLink: () => null,
})

const PartnershipProvider = ({ partnerSource, children }: Props) => {
   const getPartnerEventLink = useCallback(
      (eventId: string) => {
         const baseUrl = getBaseUrl()
         const link = addUtmTagsToLink({
            link: `${baseUrl}/portal/livestream/${eventId}`,
            source: partnerSource || "partner",
            medium: "iframe",
            campaign: "events",
         })

         return link
      },
      [partnerSource]
   )

   const handlePartnerEventClick = useCallback(
      (eventId: string) => {
         window.open(getPartnerEventLink(eventId), "_blank")
      },
      [getPartnerEventLink]
   )

   const contextValue = useMemo(
      () => ({ partnerSource, handlePartnerEventClick, getPartnerEventLink }),
      [getPartnerEventLink, handlePartnerEventClick, partnerSource]
   )

   return (
      <PartnershipContext.Provider value={contextValue}>
         {children}
      </PartnershipContext.Provider>
   )
}

const usePartnership = () =>
   useContext<PartnershipContextType>(PartnershipContext)

export { PartnershipProvider, usePartnership }
