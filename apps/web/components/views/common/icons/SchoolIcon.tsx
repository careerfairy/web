import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon"
import ReactComponent from "public/icons/school-icon.svg"

export const SchoolIcon = (props: SvgIconProps) => {
   return <SvgIcon component={ReactComponent} viewBox="0 0 36 36" {...props} />
}
