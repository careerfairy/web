import { Box, Stack, Typography } from "@mui/material"
import { FC } from "react"
import { sxStyles } from "types/commonTypes"
import SparksContainer from "../components/SparksContainer"
import CreatorSparksCollection from "./CreatorSparksCollection"
import HeaderActions from "./header/HeaderActions"
import SparksProgressIndicator from "./header/SparksProgressIndicator"
import { useGroup } from "../../../../../layouts/GroupDashboardLayout"
import UpgradePlanBanner from "components/views/checkout/forms/UpgradePlanBanner"
import { DateTime } from "luxon"

const BANNER_TITLE = "Reignite your Sparks and keep the momentum going!"
const BANNER_DESCRIPTION =
   "Your Sparks trial has ended, and they're no longer visible to the CareerFairy talent community. But the magic doesn't have to stop! Upgrade now and reignite the spark to continue engaging all year round with your target audience, access in-depth analytics and showcase your job opportunities in an innovative way. Don't let the momentum you built fade, upgrade now and reignite the spark!"

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
   alerted: {
      color: (theme) => theme.palette.secondary.main,
   },
   banner: {
      // mx: 5,
      // my: 1,
      // m: 2,
      display: "flex",
      // p: "24px",
      gap: "54px",
      // alignContent: "space-between",
      justifyContent: "center",
      alignItems: "center",
      // minHeight: "150px",
      // backgroundColor: "red",
      borderRadius: "12px",
      border: "1px solid var(--purple-purple---400, #9580F0)",
      background: "rgba(225, 219, 251, 0.20)",
   },
})

const GeneralSparksView: FC = () => {
   const { group, groupPresenter } = useGroup()
   const planDays =
      groupPresenter.isTrialPlan() && groupPresenter.getPlanDaysLeft()

   return (
      <Stack pb={4} alignItems="center" spacing={4.125}>
         <SparksContainer>
            <UpgradePlanBanner
               title={BANNER_TITLE}
               description={BANNER_DESCRIPTION}
               show={planDays < 1}
            />
            <UpgradePlanBanner
               bannerSx={styles.banner}
               title={<TrialEndUpgradeTitle days={planDays} />}
               description={
                  <StatusDescription description={BANNER_DESCRIPTION_DAY_7} />
               }
               show={planDays > 0 && planDays <= 7}
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
   const endsOn = `ends on ${endDate.day} ${endDate.monthShort} ${endDate.year}`
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
      <Box sx={{ pl: 2 }}>
         <Typography sx={styles.title}>
            {props.preTitle}
            <Typography component="span" sx={[styles.title, styles.alerted]}>
               {props.daysLeft} days left{" "}
            </Typography>
            {props.afterTitle}
         </Typography>
      </Box>
   )
}

type StatusDescriptionProps = {
   description
}
const StatusDescription = ({ description }: StatusDescriptionProps) => {
   return <Box sx={{ pl: 2, pt: 1 }}>{description}</Box>
}

export default GeneralSparksView
