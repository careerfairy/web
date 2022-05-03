import React, { FunctionComponent } from "react"
import Box from "@mui/material/Box"
import { IconProps } from "@mui/material"
import { Icon } from "react-feather"

interface NavElementProps {
   href: string
   title: string
   icon?: FunctionComponent<IconProps> | Icon
   basePath?: string
   onClick?: () => void
}

const NavElement = ({
   href,
   icon,
   basePath,
   title,
   onClick,
}: NavElementProps) => {
   return <Box>nav</Box>
}

export default NavElement
