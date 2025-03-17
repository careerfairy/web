import { Box, Grid, Typography } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useSparks from "components/custom-hook/spark/useSparks"
import { useIsMounted } from "components/custom-hook/utils/useIsMounted"
import { FallbackComponent } from "components/views/portal/sparks/FallbackComponent"
import SparkPreviewCard from "components/views/sparks/components/spark-card/SparkPreviewCard"
import { FC, useEffect } from "react"
import { SectionAnchor, TabValue, useCompanyPage } from ".."

type Props = {
   groupId: string
}

const CarouselHeader = () => {
   return (
      <Typography variant="brandedH3" fontWeight={"600"} color="black">
         Sparks
      </Typography>
   )
}

const Loader = () => {
   return <FallbackComponent header={<CarouselHeader />} />
}

const SparksTab: FC<Props> = ({ groupId }) => {
   // const dispatch = useDispatch()

   const {
      // group,
      sectionRefs: { eventSectionRef },
      activeTab,
   } = useCompanyPage()
   // const router = useRouter()
   const isMounted = useIsMounted()

   useEffect(() => {
      if (activeTab === TabValue.sparks && eventSectionRef.current) {
         eventSectionRef.current.scrollIntoView({ behavior: "smooth" })
      }
   }, [activeTab, eventSectionRef])

   // const handleSparksClicked = useCallback(
   //    (spark: Spark) => {
   //       if (spark) {
   //          dispatch(setCameFromPageLink(router.asPath))
   //          router.push({
   //             pathname: `/sparks/${spark.id}`,
   //             query: {
   //                ...router.query, // spread current query params
   //                groupId: group.id,
   //                interactionSource: SparkInteractionSources.Company_Page,
   //             },
   //          })
   //       }
   //       return
   //    },
   //    [dispatch, group.id, router]
   // )

   return (
      <Box>
         <SectionAnchor ref={eventSectionRef} tabValue={TabValue.sparks} />
         {isMounted ? (
            <SuspenseWithBoundary fallback={<Loader />}>
               <SparksGrid groupId={groupId} />
            </SuspenseWithBoundary>
         ) : (
            <Loader />
         )}
      </Box>
   )
}

type SparksGridProps = {
   groupId: string
}
const SparksGrid = ({ groupId }: SparksGridProps) => {
   const { data: groupSparks } = useSparks({
      groupId,
   })
   return (
      <Grid container spacing={2}>
         {groupSparks?.map((spark) => (
            <Grid item key={spark.id} xs={6} sm={4} md={3}>
               <SparkPreviewCard
                  key={spark.id}
                  spark={spark}
                  questionLimitLines={true}
                  muted
               />
            </Grid>
         ))}
      </Grid>
   )
}

export default SparksTab
