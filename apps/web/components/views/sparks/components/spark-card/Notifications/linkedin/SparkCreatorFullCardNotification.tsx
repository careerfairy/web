import { PublicGroup } from "@careerfairy/shared-lib/groups"
import { PublicCreator } from "@careerfairy/shared-lib/groups/creators"
import { useRouter } from "next/router"
import { useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { swipeToSparkByIndex } from "store/reducers/sparksFeedReducer"
import {
   cameFromPageLinkSelector,
   currentSparkIndexSelector,
} from "store/selectors/sparksFeedSelectors"
import { LinkedIn } from "./LinkedIn"
import { NoLinkedIn } from "./NoLinkedIn"
import { useIsTargetedUser } from "./useIsTargetedUser"

type Props = {
   group: PublicGroup
   creator: PublicCreator
}

export const SparkCreatorFullCardNotification = ({ group, creator }: Props) => {
   const router = useRouter()
   const dispatch = useDispatch()
   const currentSparkIndex = useSelector(currentSparkIndexSelector)
   const cameFromCompanyPageLink = useSelector(cameFromPageLinkSelector)
   const isUserFromTargetedCountry = useIsTargetedUser(group)

   const handleBack = useCallback(() => {
      router.push(cameFromCompanyPageLink)
   }, [cameFromCompanyPageLink, router])

   const handleSwipeToNext = useCallback(() => {
      dispatch(swipeToSparkByIndex(currentSparkIndex + 1))
   }, [currentSparkIndex, dispatch])

   return isUserFromTargetedCountry && creator?.linkedInUrl ? (
      <LinkedIn
         group={group}
         creator={creator}
         handleSwipeToNext={handleSwipeToNext}
      />
   ) : (
      <NoLinkedIn
         group={group}
         creator={creator}
         handleBack={handleBack}
         handleSwipeToNext={handleSwipeToNext}
      />
   )
}
