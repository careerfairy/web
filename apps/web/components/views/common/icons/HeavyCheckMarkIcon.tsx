import ReactComponent from "public/icons/heavy-check-mark-icon.svg"

import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon"

export const HeavyCheckMarkIcon = (props: SvgIconProps) => {
   return <SvgIcon component={ReactComponent} {...props} />
}
