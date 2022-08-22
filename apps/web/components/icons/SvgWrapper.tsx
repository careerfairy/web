import { SvgIcon } from "@mui/material"
import { IColors } from "../../types/commonTypes"

const SvgWrapper = ({
   viewBox = "0 0 35 34",
   title = "title",
   children,
   sx,
   color,
}: Props) => {
   return (
      <SvgIcon
         viewBox={viewBox}
         sx={{ height: { xs: 21, md: 32 }, width: { xs: 21, md: 35 }, ...sx }}
         color={color}
      >
         <title id={title}>{title}</title>
         <g>{children}</g>
      </SvgIcon>
   )
}

type Props = {
   viewBox?: string
   description?: string
   children?: JSX.Element
   sx?: object
   color?: IColors
   title?: string
}

export default SvgWrapper
