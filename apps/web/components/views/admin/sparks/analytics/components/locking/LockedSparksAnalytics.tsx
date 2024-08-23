import useIsMobile from "components/custom-hook/useIsMobile"
import LockedComponents from "./LockedComponents"

const lockedSparkAnalyticsDesktopImage =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/misc%2Fsparks-locked-background.png?alt=media&token=f724cb9e-1a8d-4891-a56c-432039935835"
const lockedSparkAnalyticsMobileImage =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/misc%2Fsparks-locked-background-mobile.png?alt=media&token=22923a7d-9b9c-4eeb-90df-43e5624bac0e"

const metrics = ["Reach", "Engagement", "Audience"]

export const LockedSparksAnalytics = () => {
   const isMobile = useIsMobile()

   const src = isMobile
      ? lockedSparkAnalyticsMobileImage
      : lockedSparkAnalyticsDesktopImage

   return (
      <LockedComponents>
         <LockedComponents.PlaceholderImage src={src} />
         <LockedComponents.Info
            title="Unlock enhanced analytics"
            text="Unlock in-depth analytics by upgrading your free trial to the full Sparks feature. You will have access to:"
            metrics={metrics}
         />
      </LockedComponents>
   )
}
