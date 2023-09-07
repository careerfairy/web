import SparksCarouselWithSuspenseComponent from "components/views/portal/sparks/SparksCarouselWithSuspenseComponent"
import { FC } from "react"
import { useCompanyPage } from ".."
import { useMountedState } from "react-use"
import { useRouter } from "next/router"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"

type Props = {
   groupId: String
}

const SparksSection: FC<Props> = ({ groupId }) => {
   const {
      group,
      upcomingLivestreams,
      pastLivestreams,
      sectionRefs: { eventSectionRef },
   } = useCompanyPage()
   const isMounted = useMountedState()
   const router = useRouter()

   const handleSparksClicked = async (spark: Spark) => {
      if (!spark) return
      router.push(`/sparks/${spark.id}`)
      return
   }

   return (
      <SparksCarouselWithSuspenseComponent
         groupId={groupId}
         handleSparksClicked={handleSparksClicked}
      />
   )
}

export default SparksSection
