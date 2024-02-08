import { Grid } from "@mui/material"
import FormSectionHeader from "../../FormSectionHeader"
import LanguageSelect from "./components/LanguageSelect"
import useIsMobile from "components/custom-hook/useIsMobile"
import BannerImageSelect from "./components/BannerImageSelect"
import StartDateTimePicker from "./components/StartDateTimePicker"
import MakeExclusiveSwitch from "./components/MakeExclusiveSwitch"
import EstimatedDurationSelect from "./components/EstimatedDurationSelect"
import { FormBrandedTextField } from "components/views/common/inputs/BrandedTextField"

const SUMMARY_PLACEHOLDER = `Describe your live stream
  • [Company] is one of the leading companies in the [industry]. We have [XYZ] employees globally...
  • We are going to present how a day in the life of our consultants looks like
  • Agenda: 30 minutes presentation and 30 minutes Q&A`

const GeneralSettings = () => {
   const isMobile = useIsMobile()

   return (
      <>
         <FormSectionHeader
            title="General Settings"
            subtitle="Fill in the general information about your live stream"
            actions={<MakeExclusiveSwitch />}
         />
         <FormBrandedTextField
            name="general.title"
            label="Live Stream Title"
            placeholder="Insert your Live Stream title"
            requiredText="(required)"
         />
         <BannerImageSelect />
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
         <FormBrandedTextField
            name="general.summary"
            label="What Is The Live Stream About?"
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
