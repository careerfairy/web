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
}

const PartnershipContext = createContext<PartnershipContextType>({
   handlePartnerEventClick: () => null,
})

const PartnershipProvider = ({ partnerSource, children }: Props) => {
   const handlePartnerEventClick = useCallback(
      (eventId: string) => {
         const baseUrl = getBaseUrl()
         const link = addUtmTagsToLink({
            link: `${baseUrl}/portal/livestream/${eventId}`,
            source: partnerSource || "partner",
            medium: "iframe",
            campaign: "events",
         })
         window.open(link, "_blank")
      },
      [partnerSource]
   )

   const contextValue = useMemo(
      () => ({ partnerSource, handlePartnerEventClick }),
      [handlePartnerEventClick, partnerSource]
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
