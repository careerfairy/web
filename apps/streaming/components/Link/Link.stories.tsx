import { Meta, StoryObj } from "@storybook/react"
import { Link, LinkProps } from "."

export default {
   component: Link,
   title: "Link",
} satisfies Meta<typeof Link>

type Story = StoryObj<typeof Link>

export const Default: Story = {}
