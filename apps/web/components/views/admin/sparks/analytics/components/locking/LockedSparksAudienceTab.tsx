import { LockedComponentsModal } from "./LockedComponentsModal"

const metrics = ["Top countries", "Top universities", "Top field of studies"]

export const LockedSparksAudienceTab = () => {
   return (
      <LockedComponentsModal
         title="Unlock audience"
         text="Unlock in-depth audience insights"
         metrics={metrics}
      />
   )
}
