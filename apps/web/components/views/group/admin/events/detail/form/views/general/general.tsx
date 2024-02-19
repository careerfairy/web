import Categories from "./Categories"
import ReasonsToJoin from "./ReasonsToJoin"
import GeneralSettings from "./GeneralSettings"
import AudienceTargeting from "./AudienceTargeting"

const LivestreamFormGeneralStep = () => {
   return (
      <>
         <GeneralSettings />
         <ReasonsToJoin />
         <Categories />
         <AudienceTargeting />
      </>
   )
}

export default LivestreamFormGeneralStep
