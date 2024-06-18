import { SparkPresenter } from "@careerfairy/shared-lib/sparks/SparkPresenter"
import { SparksCreatorNotification } from "./SparksCreatorNotification"
import { SparksEventNotification } from "./SparksEventNotification"
import { useHasEventNotification } from "./useHasEventNotification"

type Props = {
   spark: SparkPresenter
   shouldShowLinkedInCTA?: boolean
}

export const SparksPopUpNotificationManager = ({
   spark,
   shouldShowLinkedInCTA,
}: Props) => {
   const hasEventNotification = useHasEventNotification(spark)

   return hasEventNotification ? (
      <SparksEventNotification spark={spark} />
   ) : (
      <SparksCreatorNotification
         spark={spark}
         shouldShowLinkedInCTA={shouldShowLinkedInCTA}
      />
   )
}
