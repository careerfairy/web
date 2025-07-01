import type { SvgIconProps } from "@mui/material"
import type { FC, ReactNode } from "react"
import type { Icon } from "react-feather"

type IconComponent = FC<SvgIconProps> | Icon

export type INavLink = {
   id: string
   title: string
   mobileTitle?: string
   href: string
   /**
    * The Nextjs router pathname that the link should be active for.
    * */
   pathname?: string
   Icon?: IconComponent
   /**
    * Another way to set the active state of the link. Primarily used for nav links that have nested paths
    * If this is set, it will override the link.pathname and router.pathname checks.
    */
   isStillActive?: boolean
   /**
    * The children of the link. If this is set, the link will also be a dropdown.
    * */
   childLinks?: INavLink[]
   rightElement?: ReactNode
   wrapper?: FC<{
      children: ReactNode
   }>
}
