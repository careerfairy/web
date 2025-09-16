import { FormBrandedTextField } from "components/views/common/inputs/BrandedTextField"
import FormSectionHeader from "components/views/group/admin/events/detail/form/FormSectionHeader"

import BannerImageSelect from "components/views/group/admin/events/detail/form/views/general/components/BannerImageSelect"
import StartDateTimePicker from "components/views/group/admin/events/detail/form/views/general/components/StartDateTimePicker"
import GroupCityDropdown from "./components/GroupCityDropdown"
import MakeExclusiveSwitch from "./components/MakeExclusiveSwitch"

export const GeneralSettings = () => {
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
            placeholder="Insert your offline event title"
            requiredText="(required)"
         />
         <BannerImageSelect
            fieldName="general.backgroundImageUrl"
            emptyBannerLabel="Upload your event banner image"
            recommendedSizeLabel="Recommended size: 1920x1080"
            withCropper={true}
            cropperConfig={{
               title: "Upload event banner image",
               type: "rectangle",
               aspectRatio: 16 / 9,
               cropBoxResizable: true,
               key: "offline-event-banner-cropper",
            }}
         />
         <StartDateTimePicker
            fieldName="general.startAt"
            label="Event date"
            toolbarTitle="Select offline event start date"
         />
         <GroupCityDropdown
            fieldName="general.city"
            label="City"
            placeholder="E.g., Zurich"
            requiredText={"(required)"}
         />
         <FormBrandedTextField
            name="general.street"
            label="Address"
            placeholder="Enter the event address"
            requiredText="(required)"
         />
         <FormBrandedTextField
            name="general.registrationUrl"
            label="Registration URL"
            placeholder="https://example.com/register"
            requiredText="(required)"
         />
         <FormBrandedTextField
            name="general.description"
            label="Description"
            placeholder="Describe your offline event"
            multiline
            rows={4}
            requiredText="(required)"
         />
      </>
   )
}
