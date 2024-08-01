import { PublicGroup } from "@careerfairy/shared-lib/groups"
import { PublicCreator } from "@careerfairy/shared-lib/groups/creators"
import { useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { swipeToSparkByIndex } from "store/reducers/sparksFeedReducer"
import { currentSparkIndexSelector } from "store/selectors/sparksFeedSelectors"
import { LinkedIn } from "./LinkedIn"
import { NoLinkedIn } from "./NoLinkedIn"

type Props = {
   group?: PublicGroup
   creator: PublicCreator
}

export const SparkCreatorFullCardNotification = ({ group, creator }: Props) => {
   const dispatch = useDispatch()
   const currentSparkIndex = useSelector(currentSparkIndexSelector)

   const handleSwipeToNext = useCallback(() => {
      dispatch(swipeToSparkByIndex(currentSparkIndex + 1))
   }, [currentSparkIndex, dispatch])

   return creator?.linkedInUrl ? (
      <LinkedIn creator={creator} handleSwipeToNext={handleSwipeToNext} />
   ) : (
      <NoLinkedIn
         group={group}
         creator={creator}
         handleBack={() => alert("go back")}
         handleSwipeToNext={handleSwipeToNext}
      />
   )
}
