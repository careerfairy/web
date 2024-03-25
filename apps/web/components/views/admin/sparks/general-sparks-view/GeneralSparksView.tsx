import { Box, Stack, SxProps, Typography } from "@mui/material"
import { FC, useState } from "react"
import { combineStyles, sxStyles } from "types/commonTypes"
import SparksContainer from "../components/SparksContainer"
import CreatorSparksCollection from "./CreatorSparksCollection"
import HeaderActions from "./header/HeaderActions"
import SparksProgressIndicator from "./header/SparksProgressIndicator"
import { useGroup } from "../../../../../layouts/GroupDashboardLayout"
import UpgradePlanBanner from "components/views/checkout/forms/UpgradePlanBanner"
import { DateTime } from "luxon"
import { ChevronDown, ChevronUp } from "react-feather"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import useIsMobile from "components/custom-hook/useIsMobile"

const BANNER_TITLE = "Reignite your Sparks and keep the momentum going!"
const BANNER_DESCRIPTION_PART_1 =
   "Your Sparks trial has ended, and your Sparks are no longer visible on CareerFairy."
const BANNER_DESCRIPTION_PART_2 =
   "But the magic doesn't have to stop! Upgrade now and reignite the spark to continue engaging all year round with your target audience, access in-depth analytics and showcase your job opportunities in an innovative way. Don't let the momentum you built fade, upgrade now and reignite the spark!"

const BANNER_DESCRIPTION_DAY_7 =
   "Enhance the positive momentum your Sparks trial has generated. Continue with Sparks to engage your target audience all year around, access in-depth analytics and promote your job opportunities in a new innovative format."

const styles = sxStyles({
   creatorSparksCollectionContainer: {
      pr: "0 !important",
   },
   title: {
      fontSize: "1.428rem",
      fontWeight: 600,
      lineHeight: "30px",
   },
   bannerTitle: {
      color: (theme) => theme.brand.white[100],
      textAlign: "left",
      fontFamily: "Poppins",
      fontSize: "20px",
      fontStyle: "normal",
      fontWeight: "600",
      lineHeight: "30px",
      mb: 1,
   },
   alerted: {
      color: (theme) => theme.palette.secondary.main,
   },
   banner: {
      display: "flex",
      gap: "5px",
      px: "24px",
      py: "5px",
      justifyContent: "space-between",
      alignItems: "center",
      borderRadius: "12px",
      border: "1px solid",
      borderColor: (theme) => theme.brand.purple[400],
      background: "rgba(225, 219, 251, 0.20)",
   },
   bannerDescription: {
      py: 2,
      color: (theme) => theme.palette.neutral[900],
      fontFamily: "Poppins",
      fontSize: "16px",
      fontStyle: "normal",
      fontWeight: "400",
      lineHeight: "24px",
   },
   bannerDescriptionWarning: {
      py: 2,
      color: (theme) => theme.brand.white[100],
      fontFamily: "Poppins",
      fontSize: "16px",
      fontStyle: "normal",
      fontWeight: "400",
      lineHeight: "24px",
   },
   statusTitle: {
      pt: 2,
   },
   showMoreWrapper: {
      pt: 2,
   },
   showMore: {
      color: (theme) => theme.palette.neutral[700],
   },
   showMoreWarning: {
      color: (theme) => theme.brand.white[300],
   },
})

const GeneralSparksView: FC = () => {
   const { group, groupPresenter } = useGroup()

   const isTrial = groupPresenter.isTrialPlan()
   const planDays = groupPresenter.getPlanDaysLeft()

   return (
      <Stack pb={4} alignItems="center" spacing={4.125}>
         <SparksContainer>
            <UpgradePlanBanner
               title={
                  <Typography sx={styles.bannerTitle}>
                     {BANNER_TITLE}{" "}
                  </Typography>
               }
               description={
                  <StatusDescriptionFull
                     showSx={styles.showMoreWarning}
                     sx={styles.bannerDescriptionWarning}
                  />
                  // <Stack direction={"column"} spacing={1}>
                  //    <StatusDescription
                  //       showSx={styles.showMoreWarning}
                  //       sx={styles.bannerDescriptionWarning}
                  //       description={BANNER_DESCRIPTION_PART_1}
                  //    />

                  //    <StatusDescription
                  //       showSx={styles.showMoreWarning}
                  //       sx={styles.bannerDescriptionWarning}
                  //       description={BANNER_DESCRIPTION_PART_2}
                  //    />
                  // </Stack>
               }
               show={isTrial ? planDays < 1 : null}
            />
            <UpgradePlanBanner
               bannerSx={styles.banner}
               title={<TrialEndUpgradeTitle days={planDays} />}
               description={
                  <StatusDescription
                     showSx={styles.showMore}
                     sx={styles.bannerDescription}
                     description={BANNER_DESCRIPTION_DAY_7}
                  />
               }
               show={isTrial ? planDays > 0 && planDays <= 7 : null}
            />
         </SparksContainer>
         {group.publicSparks ? null : (
            <SparksContainer>
               <SparksProgressIndicator />
            </SparksContainer>
         )}
         <SparksContainer>
            <HeaderActions />
         </SparksContainer>
         <SparksContainer sx={styles.creatorSparksCollectionContainer}>
            <CreatorSparksCollection />
         </SparksContainer>
      </Stack>
   )
}

type TrialEndProps = {
   days: number
}
const TrialEndUpgradeTitle = ({ days }: TrialEndProps) => {
   const endDate = DateTime.now().plus({ days: days })
   const month = endDate.monthShort.replace(".", "")
   const monthShort = month.at(0).toUpperCase() + month.substring(1)
   const endsOn = `on ${endDate.day} ${monthShort} ${endDate.year}`
   return (
      <>
         <StatusTitle
            preTitle="Your Sparks trial "
            afterTitle={endsOn}
            daysLeft={days}
            critical={true}
         />
      </>
   )
}

type StatusTitleProps = {
   critical: boolean
   daysLeft: number
   preTitle: string
   afterTitle: string
}
const StatusTitle = (props: StatusTitleProps) => {
   return (
      <Box sx={styles.statusTitle}>
         <Typography sx={styles.title}>
            {props.preTitle}
            <Typography component="span" sx={[styles.title, styles.alerted]}>
               ends in {props.daysLeft} days{" "}
            </Typography>
            {props.afterTitle}
         </Typography>
      </Box>
   )
}

type StatusDescriptionProps = {
   description: string
   sx: SxProps
   showSx?: SxProps
}
const StatusDescription = ({
   description,
   sx,
   showSx,
}: StatusDescriptionProps) => {
   const isMobile = useIsMobile("md")
   // TODO: more concise substring
   const shortDescription = description.substring(0, 100)
   return (
      <Box sx={sx}>
         <ConditionalWrapper condition={isMobile} fallback={description}>
            <ShowMoreComponent
               showSx={showSx}
               full={description}
               short={shortDescription}
            />
         </ConditionalWrapper>
      </Box>
   )
}

type StatusDescriptionFullProps = {
   sx: SxProps
   showSx?: SxProps
}
const StatusDescriptionFull = ({ sx, showSx }: StatusDescriptionFullProps) => {
   const [showingMore, setShowingMore] = useState(true)
   const isMobile = useIsMobile()
   return (
      <Box sx={sx}>
         <Stack>
            <Box>
               {BANNER_DESCRIPTION_PART_1}
               {!showingMore ? "..." : ""}
               <ConditionalWrapper condition={showingMore || !isMobile}>
                  <Box mt={4} />
                  {BANNER_DESCRIPTION_PART_2}
               </ConditionalWrapper>
            </Box>
            <Box
               onClick={() => setShowingMore(!showingMore)}
               display={"flex"}
               sx={combineStyles(styles.showMoreWrapper, showSx)}
            >
               <Box>
                  <ConditionalWrapper condition={isMobile}>
                     <ConditionalWrapper
                        fallback="Show More"
                        condition={showingMore}
                     >
                        Show Less
                     </ConditionalWrapper>
                  </ConditionalWrapper>
               </Box>
               <Box>
                  <ConditionalWrapper condition={isMobile}>
                     <ConditionalWrapper
                        condition={showingMore}
                        fallback={<ChevronDown />}
                     >
                        <ChevronUp />
                     </ConditionalWrapper>
                  </ConditionalWrapper>
               </Box>
            </Box>
         </Stack>
      </Box>
   )
}

type ShowMoreComponentProps = {
   full: string
   short: string
   showSx?: SxProps
}
const ShowMoreComponent = (props: ShowMoreComponentProps) => {
   const [showingMore, setShowingMore] = useState(true)
   const text = showingMore ? props.full : props.short
   return (
      <Stack>
         <Box>
            {text}
            {!showingMore ? "..." : ""}
         </Box>
         <Box
            onClick={() => setShowingMore(!showingMore)}
            display={"flex"}
            sx={combineStyles(styles.showMoreWrapper, props.showSx)}
         >
            <Box>
               <ConditionalWrapper fallback="Show More" condition={showingMore}>
                  Show Less
               </ConditionalWrapper>
            </Box>
            <Box>
               <ConditionalWrapper
                  condition={showingMore}
                  fallback={<ChevronDown />}
               >
                  <ChevronUp />
               </ConditionalWrapper>
            </Box>
         </Box>
      </Stack>
   )
}
export default GeneralSparksView
