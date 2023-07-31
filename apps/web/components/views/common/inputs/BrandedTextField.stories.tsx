import BrandedTextField from "./BrandedTextField"
import type { StoryFn, Meta } from "@storybook/react"
import React, { useState } from "react"

export default {
   component: BrandedTextField,
   argTypes: {
      onChange: { action: "changed" },
   },
} as Meta

const Template: StoryFn = (args) => {
   const [value, setValue] = useState("")
   return (
      <BrandedTextField
         {...args}
         value={value}
         onChange={(event) => setValue(event.target.value)}
      />
   )
}

export const Default = Template.bind({})
Default.args = {
   label: "Email",
   placeholder: "Enter your email",
   value: "example@email.com",
}
