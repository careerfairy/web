import { LockedComponentsModal } from "./LockedComponentsModal"

const metrics = ["Reach", "Engagement", "Audience"]

export const LockedSparksAnalytics = () => {
   return (
      <LockedComponentsModal
         title="Unlock enhanced analytics"
         text="Unlock in-depth analytics by upgrading your free trial to the full Sparks feature. You will have access to:"
         metrics={metrics}
      />
   )
}
