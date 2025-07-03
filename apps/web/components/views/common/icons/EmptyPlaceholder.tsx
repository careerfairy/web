import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon"
import ReactComponent from "public/illustrations/empty-placeholder.svg"

export const EmptyPlaceholder = (props: SvgIconProps) => {
   return (
      <SvgIcon component={ReactComponent} viewBox="0 0 195 128" {...props} />
   )
}
