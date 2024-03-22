import AudienceTargeting from "./AudienceTargeting"
import Categories from "./Categories"
import GeneralSettings from "./GeneralSettings"
import ReasonsToJoin from "./ReasonsToJoin"

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
