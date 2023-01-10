import type { FC, ReactElement } from "react"
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
   pathName: string
   Icon?: IconComponent
   type: "item"
}

export type INavGroup = {
   id: string
   title: string
   Icon?: IconComponent
   type: "collapse"
   children: INavLink[]
}

export type INavItem = INavLink | INavGroup
