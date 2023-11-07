import { action } from "@storybook/addon-actions"
import { Meta, StoryObj } from "@storybook/react"

import { ResponsiveButton, ResponsiveButtonProps } from "."

const baseArgs: ResponsiveButtonProps = {
   children: "Click Me",
   onClick: action("onClick"),
}

export default {
   component: ResponsiveButton,
   args: baseArgs,
} satisfies Meta<typeof ResponsiveButton>

type Story = StoryObj<typeof ResponsiveButton>

export const Default: Story = {}

export const LongText: Story = {
   args: { children: "Really Looooong Text" },
}
