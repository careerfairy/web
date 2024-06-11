import { SparkPresenter } from "@careerfairy/shared-lib/sparks/SparkPresenter"
import { SparksCreatorNotification } from "./SparksCreatorNotification"
import { SparksEventNotification } from "./SparksEventNotification"
import { useHasEventNotification } from "./useHasEventNotification"

type Props = {
   spark: SparkPresenter
}

export const SparksPopUpManager = ({ spark }: Props) => {
   const hasEventNotification = useHasEventNotification(spark)

   return hasEventNotification ? (
      <SparksEventNotification spark={spark} />
   ) : (
      <SparksCreatorNotification creator={spark.creator} />
   )
}
