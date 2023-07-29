import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"
import BrandedMultiCheckBox from "./BrandedMultiCheckBox"
import type { StoryFn, Meta } from "@storybook/react"
import { CompanyIndustryValues } from "constants/forms"
import React, { useState } from "react"

export default {
   component: BrandedMultiCheckBox,
   argTypes: {
      onChange: { action: "changed" },
   },
} as Meta

const Template: StoryFn = (args) => {
   const [value, setValue] = useState<OptionGroup[]>([])

   return (
      <BrandedMultiCheckBox
         {...args}
         options={CompanyIndustryValues.map((industry) => industry.name)}
         value={value}
         label="Company Industries"
         onChange={(values) => setValue(values)}
      />
   )
}

export const Default = Template.bind({})
Default.args = {
   label: "Industries",
   placeholder: "Select industries",
   value: ["Accounting", "Automotive"],
}
