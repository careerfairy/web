import { SxProps, Theme, Typography } from "@mui/material"
import Box from "@mui/material/Box"
import { FC, ReactNode } from "react"
import {
   Tag as CompanyIndustryIcon,
   MapPin as CompanyLocationIcon,
   Users as CompanySizeIcon,
} from "react-feather"

type Props = {
   icon: JSX.Element
   text: string | ReactNode
   fontSize?: string
   sx?: SxProps<Theme>
   typographySx?: SxProps<Theme>
   iconSize?: number
}
const CompanyTag: FC<Props> = ({
   icon,
   text,
   fontSize = "1rem",
   sx,
   typographySx,
}) => {
   return (
      <Box display="flex" alignItems="center" color="neutral.700" sx={sx}>
         {icon}
         <Typography
            variant="small"
            fontSize={`${fontSize} !important`}
            ml={"0.5rem"}
            sx={typographySx}
         >
            {text}
         </Typography>
      </Box>
   )
}

type CustomTagProps = Omit<Props, "icon">
export const CompanyCountryTag: FC<CustomTagProps> = ({
   text,
   fontSize = "1rem",
   sx,
}) => {
   return (
      <CompanyTag
         icon={<CompanyLocationIcon size={`calc(${fontSize} * 1.3)`} />}
         fontSize={fontSize}
         text={text}
         sx={sx}
      />
   )
}

export const CompanyIndustryTag: FC<CustomTagProps> = ({
   text,
   fontSize = "1rem",
   sx,
   typographySx,
   iconSize,
}) => {
   return (
      <CompanyTag
         icon={
            <CompanyIndustryIcon
               size={iconSize ? iconSize : `calc(${fontSize} * 1.3)`}
            />
         }
         fontSize={fontSize}
         text={text}
         sx={sx}
         typographySx={typographySx}
      />
   )
}

export const CompanySizeTag: FC<CustomTagProps> = ({
   text,
   fontSize = "1rem",
   sx,
}) => {
   return (
      <CompanyTag
         icon={<CompanySizeIcon size={`calc(${fontSize} * 1.3)`} />}
         fontSize={fontSize}
         text={text}
         sx={sx}
      />
   )
}

export default CompanyTag
