import { sxStyles } from "@careerfairy/shared-ui"
import { Box, Stack, Tab, Tabs, useMediaQuery, useTheme } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { useGroup } from "layouts/GroupDashboardLayout"
import { forwardRef, useMemo } from "react"
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
import Section from "./Section"
import ShareButton from "./ShareButton"
import Speakers from "./Speakers"
import { REAL_DIALOG_WIDTH } from "./commons"

const styles = sxStyles({
   root: {
      padding: {
         xs: 1,
         md: 2.25,
      },
      borderRadius: {
         md: 5,
      },
      backgroundColor: "white",
      paddingBottom: "36px !important",
      width: `${REAL_DIALOG_WIDTH}px`,
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
      cursor: "initial",
   },
   mainContent: {
      px: 2,
      position: "relative",
   },
})

type PreviewContentProps = {
   isInDialog: boolean
   handleCloseDialog?: () => void
   scale?: number
}

const PreviewContent = forwardRef(
   ({ isInDialog, handleCloseDialog, scale }: PreviewContentProps, ref) => {
      const isMobile = useIsMobile()
      const theme = useTheme()
      const centeredNav = !useMediaQuery(theme.breakpoints.down("sm"))
      const {
         values: { general, speakers, jobs },
      } = useLivestreamFormValues()
      const { group } = useGroup()
      const hasJobs = jobs.customJobs.length > 0

      const scaledStyles = useMemo(() => {
         if (!scale) return {}
         return {
            transformOrigin: "top left",
            "-webkit-transform": `scale(${scale})`,
            "-moz-transform": `scale(${scale})`,
            "-o-transform": `scale(${scale})`,
            transform: `scale(${scale})`,
         }
      }, [scale])

      return (
         <Box
            sx={isInDialog ? { padding: 0 } : [styles.root, scaledStyles]}
            ref={ref}
         >
            <Stack spacing={4.75}>
               <HeroContent
                  backgroundImage={general.backgroundImageUrl}
                  handleCloseDialog={handleCloseDialog}
               >
                  {!isMobile && <ShareButton />}
                  <Stack
                     alignItems="center"
                     justifyContent={"center"}
                     spacing={2.5}
                  >
                     <HostInfo
                        companyName={general.company}
                        companyLogoUrl={general.companyLogoUrl}
                     />
                     <LivestreamTitle text={general.title} />
                     <LivestreamTagsContainer
                        language={general.language}
                        interests={general.categories.values}
                     />
                     <CountDownTimer
                        isPast={false}
                        startDate={general.startDate}
                     />
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
                     value={Boolean(isInDialog) && 0}
                  >
                     <Tab
                        disableRipple
                        sx={styles.tab}
                        label={"Linked jobs"}
                        value={0}
                     />
                     <Tab
                        disableRipple
                        sx={styles.tab}
                        label={"About The Live Stream"}
                     />
                     <Tab
                        disableRipple
                        sx={styles.tab}
                        label={"About The Company"}
                     />
                     <Tab disableRipple sx={styles.tab} label={"Questions"} />
                  </Tabs>
               </Box>
               <Box sx={styles.mainContent}>
                  {hasJobs ? (
                     <Section navOffset={6}>
                        <Jobs jobs={jobs.customJobs} />
                     </Section>
                  ) : null}
                  <Section navOffset={!hasJobs ? 6 : undefined}>
                     <Speakers speakers={speakers.values} />
                     <Section>
                        <AboutLivestream
                           companyName={general.company}
                           summary={general.summary}
                           reasonsToJoin={general.reasonsToJoin}
                        />
                     </Section>
                  </Section>
                  <Section>
                     <AboutCompany
                        company={group}
                        backgroundImageUrl={general.backgroundImageUrl}
                        companyLogoUrl={general.companyLogoUrl}
                        companyName={general.company}
                     />
                  </Section>
               </Box>
            </Stack>
         </Box>
      )
   }
)

PreviewContent.displayName = "PreviewContent"

export default PreviewContent
