import { sxStyles } from "@careerfairy/shared-ui"
import { Box, Stack, Tab, Tabs, useMediaQuery, useTheme } from "@mui/material"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useLivestreamFormValues } from "../../useLivestreamFormValues"
import AboutCompany from "./AboutCompany"
import AboutLivestream from "./AboutStream"
import ActionButton from "./ActionButton"
import CountDownTimer from "./CountDownTimer"
import HeroContent from "./HeroContent"
import HostInfo from "./HostInfo"
import Jobs from "./Jobs"
import LivestreamTagsContainer from "./LivestreamTagsContainer"
import LivestreamTitle from "./LivestreamTitle"
import Questions from "./Questions"
import Section from "./Section"
import ShareButton from "./ShareButton"
import Speakers from "./Speakers"

const styles = sxStyles({
   root: {
      p: {
         xs: 1,
         md: 2.25,
      },
      borderRadius: {
         md: 5,
      },
      maxWidth: 915,
      backgroundColor: "white",
      paddingBottom: "36px !important",
   },
   bottomMargin: {
      paddingBottom: "20px !important",
   },
   tabs: {
      position: "sticky",
      top: 0,
      zIndex: 2,
      bgcolor: "background.paper",
      borderBottom: "1px solid #F0F0F0",
   },
   tab: {
      fontSize: "1rem",
      fontWeight: 600,
      color: "#000",
      textTransform: "none",
   },
   mainContent: {
      px: 2,
      position: "relative",
   },
})

type PreviewContentProps = {
   isInDialog: boolean
   handleCloseDialog?: () => void
}

const PreviewContent = ({
   isInDialog,
   handleCloseDialog,
}: PreviewContentProps) => {
   const theme = useTheme()
   const centeredNav = !useMediaQuery(theme.breakpoints.down("sm"))
   const {
      values: { general, speakers, jobs },
   } = useLivestreamFormValues()
   const { group } = useGroup()
   const hasJobs = jobs.customJobs.length > 0

   return (
      <Stack spacing={4.75} sx={isInDialog ? styles.bottomMargin : styles.root}>
         <HeroContent
            backgroundImage={general.backgroundImageUrl}
            handleCloseDialog={handleCloseDialog}
         >
            <ShareButton />
            <Stack alignItems="center" justifyContent={"center"} spacing={2.5}>
               <HostInfo
                  companyName={general.company}
                  companyLogoUrl={general.companyLogoUrl}
               />
               <LivestreamTitle text={general.title} />
               <LivestreamTagsContainer
                  language={general.language}
                  interests={general.categories.values}
               />
               <CountDownTimer isPast={false} startDate={general.startDate} />
               <ActionButton />
            </Stack>
         </HeroContent>
         <Box>
            <Tabs
               sx={styles.tabs}
               textColor="secondary"
               indicatorColor="secondary"
               scrollButtons
               allowScrollButtonsMobile
               centered={centeredNav}
               variant={centeredNav ? "standard" : "scrollable"}
               value={0}
            >
               <Tab sx={styles.tab} label={"Linked jobs"} value={0} />
               <Tab sx={styles.tab} label={"About The Live Stream"} />
               <Tab sx={styles.tab} label={"About The Company"} />
               <Tab sx={styles.tab} label={"Questions"} />
            </Tabs>
         </Box>
         <Box sx={styles.mainContent}>
            {hasJobs ? (
               <Section navOffset={44}>
                  <Jobs jobs={jobs.customJobs} />
               </Section>
            ) : null}
            <Section>
               <Speakers speakers={speakers.values} />
               <Section>
                  <AboutLivestream
                     companyName={general.company}
                     summary={general.summary}
                     reasonsToJoin={general.reasonsToJoin}
                  />
               </Section>
            </Section>
            <AboutCompany
               company={group}
               backgroundImageUrl={general.backgroundImageUrl}
               companyLogoUrl={general.companyLogoUrl}
               companyName={general.company}
            />
            <Section>
               <Questions companyName={general.company} />
            </Section>
         </Box>
      </Stack>
   )
}

export default PreviewContent
