import { sxStyles } from "@careerfairy/shared-ui"
import { Grid, Stack } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { FormBrandedTextField } from "components/views/common/inputs/BrandedTextField"
import { useLivestreamCreationContext } from "../../../LivestreamCreationContext"
import FormSectionHeader from "../../FormSectionHeader"
import BannerImageSelect from "./components/BannerImageSelect"
import EstimatedDurationSelect from "./components/EstimatedDurationSelect"
import LanguageSelect from "./components/LanguageSelect"
import LogoUploader from "./components/LogoUploader"
import MakeExclusiveSwitch from "./components/MakeExclusiveSwitch"
import StartDateTimePicker from "./components/StartDateTimePicker"

const styles = sxStyles({
   logoAndBannerWrapper: {
      display: "grid",
   },
   logoAndBannerWrapperDesktop: {
      gridTemplateColumns: "0.19fr 1fr",
      columnGap: "16px",
   },
   logoAndBannerWrapperMobile: {
      gridTemplateRows: "225px 1fr",
      rowGap: "16px",
   },
})

const SUMMARY_PLACEHOLDER = `Describe your live stream
  • [Company] is one of the leading companies in the [industry]. We have [XYZ] employees globally...
  • We are going to present how a day in the life of our consultants looks like
  • Agenda: 30 minutes presentation and 30 minutes Q&A`

const GeneralSettings = () => {
   const isMobile = useIsMobile()
   const { isCohostedEvent } = useLivestreamCreationContext()

   return (
      <>
         <FormSectionHeader
            title="General Settings"
            subtitle="Fill in the general information about your live stream"
            actions={<MakeExclusiveSwitch />}
         />
         <FormBrandedTextField
            name="general.title"
            label="Live stream title"
            placeholder="Insert your live stream title"
            requiredText="(required)"
         />
         {isCohostedEvent ? (
            <Stack
               sx={[
                  styles.logoAndBannerWrapper,
                  isMobile
                     ? styles.logoAndBannerWrapperMobile
                     : styles.logoAndBannerWrapperDesktop,
               ]}
            >
               <LogoUploader />
               <BannerImageSelect />
            </Stack>
         ) : (
            <BannerImageSelect />
         )}
         <Grid container columnSpacing={2} rowSpacing={isMobile ? 2 : null}>
            <Grid item xs={12} md={4}>
               <StartDateTimePicker />
            </Grid>
            <Grid item xs={12} md={4}>
               <EstimatedDurationSelect />
            </Grid>
            <Grid item xs={12} md={4}>
               <LanguageSelect />
            </Grid>
         </Grid>
         {Boolean(isCohostedEvent) && (
            <FormBrandedTextField
               name="general.company"
               label="Company name"
               placeholder="Company name"
               requiredText="(required)"
               inputProps={{ maxLength: 70 }}
               helperText="This will be shown on the livestream page"
            />
         )}
         <FormBrandedTextField
            name="general.summary"
            label="What is the live stream about?"
            fullWidth
            requiredText="(required)"
            multiline
            rows={isMobile ? 7 : 5}
            placeholder={SUMMARY_PLACEHOLDER}
         />
      </>
   )
}

export default GeneralSettings
