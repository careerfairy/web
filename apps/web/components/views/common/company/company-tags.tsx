import { Typography } from "@mui/material"
import Box from "@mui/material/Box"
import { FC, ReactNode } from "react"
import {
   Tag as CompanyIndustryIcon,
   MapPin as CompanyLocationIcon,
   Users as CompanySizeIcon,
} from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   ellipsisTypography: {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      flex: 1,
      minWidth: 0,
   },
})

type Props = {
   icon: JSX.Element
   text: string | ReactNode
   fontSize?: string
   disableMultiline?: boolean
   color?: string
}

const CompanyTag: FC<Props> = ({
   icon,
   text,
   fontSize = "1rem",
   disableMultiline = false,
   color = "neutral.700",
}) => {
   return (
      <Box display="flex" alignItems="center" color={color}>
         {icon}
         <Typography
            variant="small"
            fontSize={`${fontSize} !important`}
            ml={"0.5rem"}
            sx={disableMultiline ? styles.ellipsisTypography : {}}
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
   color = "neutral.700",
}) => {
   return (
      <CompanyTag
         icon={<CompanyLocationIcon size={`calc(${fontSize} * 1.3)`} />}
         fontSize={fontSize}
         text={text}
         color={color}
      />
   )
}

export const CompanyIndustryTag: FC<CustomTagProps> = ({
   text,
   fontSize = "1rem",
   disableMultiline = false,
   color = "neutral.700",
}) => {
   return (
      <CompanyTag
         icon={<CompanyIndustryIcon size={`calc(${fontSize} * 1.3)`} />}
         fontSize={fontSize}
         text={text}
         disableMultiline={disableMultiline}
         color={color}
      />
   )
}

export const CompanySizeTag: FC<CustomTagProps> = ({
   text,
   fontSize = "1rem",
   color = "neutral.700",
}) => {
   return (
      <CompanyTag
         icon={<CompanySizeIcon size={`calc(${fontSize} * 1.3)`} />}
         fontSize={fontSize}
         text={text}
         color={color}
      />
   )
}

export default CompanyTag
