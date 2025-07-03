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
    * Path prefix pattern to match against router pathname for determining active state.
    * Used for section-level navigation where the link should be active for multiple sub-paths.
    * Example: "/group/[groupId]/admin/content" would match "/group/[groupId]/admin/content/live-streams"
    */
   activePathPrefix?: string
   /**
    * The children of the link. If this is set, the link will also be a dropdown.
    * */
   childLinks?: INavLink[]
   rightElement?: ReactNode
   wrapper?: FC<{
      children: ReactNode
   }>
}
