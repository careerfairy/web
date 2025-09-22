import { FormBrandedTextField } from "components/views/common/inputs/BrandedTextField"
import FormSectionHeader from "components/views/group/admin/events/detail/form/FormSectionHeader"

import { AddressAutofillOptions } from "@mapbox/search-js-core"
import { Box } from "@mui/material"
import FormLocationAutoFill from "components/views/common/inputs/FormLocationAutoFill"
import BannerImageSelect from "components/views/group/admin/events/detail/form/views/general/components/BannerImageSelect"

import { useOfflineEventCreationContext } from "../../../OfflineEventCreationContext"
import MakeExclusiveSwitch from "./components/MakeExclusiveSwitch"
import StartDateTimePicker from "./components/StartDateTimePicker"

const DESCRIPTION_PLACEHOLDER =
   "E.g., Join us for an engaging offline event where we showcase the vibrant culture at [Company], a top player in the [industry]. Our team of [XYZ] dedicated professionals will share insights into their daily experiences. The event will feature a 30-minute presentation followed by a 30-minute Q&A session, allowing you to connect directly with our consultants and learn more about their roles."

export const GeneralSettings = () => {
   const { group } = useOfflineEventCreationContext()

   const options: Partial<AddressAutofillOptions> = {
      country: group.companyCountry?.id,
      streets: false,
   }

   return (
      <>
         <FormSectionHeader
            title="General Settings"
            subtitle="Fill in the general information about your offline event"
            actions={<MakeExclusiveSwitch />}
         />
         <FormBrandedTextField
            name="general.title"
            label="Event name"
            placeholder="E.g., Discover the internship opportunities in our IT transformation team!"
            requiredText="(required)"
         />
         <Box>
            <BannerImageSelect
               fieldName="general.backgroundImageUrl"
               emptyBannerLabel="Upload your event banner image"
               recommendedSizeLabel="Recommended size: 1920x1080"
               withCropper={true}
               cropperConfig={{
                  title: "Upload event banner image",
                  type: "rectangle",
                  aspectRatio: 3 / 2,
                  cropBoxResizable: true,
                  key: "offline-event-banner-cropper",
               }}
            />
         </Box>
         <StartDateTimePicker
            fieldName="general.startAt"
            label="Event date"
            toolbarTitle="Select offline event start date"
         />
         <FormLocationAutoFill
            name="general.street"
            label="Address"
            placeholder="E.g., Max-Daetwyler-Platz 2"
            requiredText="(required)"
            options={options}
         />
         <FormBrandedTextField
            name="general.registrationUrl"
            label="Registration Link"
            placeholder="E.g., careerpage.com/event"
            requiredText="(required)"
         />
         <FormBrandedTextField
            name="general.description"
            label="Event description"
            placeholder={DESCRIPTION_PLACEHOLDER}
            multiline
            rows={4}
            requiredText="(required)"
         />
      </>
   )
}
