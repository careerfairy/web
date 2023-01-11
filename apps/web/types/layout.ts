import type { FC } from "react"
import type { SvgIconProps } from "@mui/material"
import type { Icon } from "react-feather"

type IconComponent = FC<SvgIconProps> | Icon

export type INavLink = {
   id: string
   title: string
   href: string
   /**
    * The Nextjs router pathname that the link should be active for.
    * */
   pathname?: string
   Icon?: IconComponent
}
