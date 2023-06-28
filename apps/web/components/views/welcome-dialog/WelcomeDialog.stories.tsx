import { StoryObj } from "@storybook/react"
import WelcomeDialog from "./WelcomeDialog"

export default {
   component: WelcomeDialog,
}

type Story = StoryObj<typeof WelcomeDialog>

export const Default: Story = {
   args: {
      open: true,
   },
   // render: (args) => <WelcomeDialog {...args} />,
}
