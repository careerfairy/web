import { useOfflineEventCreationContext } from "../../../OfflineEventCreationContext"
import { GeneralSettings } from "./GeneralSettings"
import AudienceTargeting from "./components/AudienceTargeting"

export const OfflineEventFormGeneralStep = () => {
   const { group } = useOfflineEventCreationContext()
   return (
      <>
         <GeneralSettings />
         <AudienceTargeting countryCode={group.companyCountry?.id} />
      </>
   )
}
