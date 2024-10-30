import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { SparkInteractionSources } from "@careerfairy/shared-lib/sparks/telemetry"
import { useRouter } from "next/router"
import { ReactNode } from "react"
import { useDispatch } from "react-redux"
import {
   setCameFromPageLink,
   setCreatorId,
   setFetchedCompanyWithCreatorStatus,
} from "store/reducers/sparksFeedReducer"
import { SparksCarousel } from "../sparks/components/SparksCarousel"

type MentorSparksCarouselProps = {
   sparks: Spark[]
   title?: ReactNode | string
}

export const MentorSparksCarousel = ({
   sparks,

   title = "",
}: MentorSparksCarouselProps) => {
   const router = useRouter()
   const dispatch = useDispatch()

   const handleSparksClicked = (spark: Spark) => {
      if (!spark) return

      dispatch(setCameFromPageLink(router.asPath))
      dispatch(setCreatorId(spark.creator.id))
      dispatch(setFetchedCompanyWithCreatorStatus("started"))

      return router.push({
         pathname: `/sparks/${spark.id}`,
         query: {
            creatorId: spark.creator.id,
            interactionSource: SparkInteractionSources.Mentor_Page,
         },
      })
   }

   return (
      <SparksCarousel
         header={title}
         handleSparksClicked={handleSparksClicked}
         sparks={sparks}
      />
   )
}
