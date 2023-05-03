import Box from "@mui/material/Box"
import { Typography } from "@mui/material"
import React, { FC } from "react"
import {
   MapPin as CompanyLocationIcon,
   Tag as CompanyIndustryIcon,
   Users as CompanySizeIcon,
} from "react-feather"

type Props = {
   icon: JSX.Element
   text: string
   fontSize?: string
}
const CompanyTag: FC<Props> = ({ icon, text, fontSize = "1rem" }) => {
   return (
      <Box display="flex" alignItems="center">
         {icon}
         <Typography variant="h6" fontSize={`${fontSize} !important`} ml={1.5}>
            {text}
         </Typography>
      </Box>
   )
}

type CustomTagProps = Omit<Props, "icon">
export const CompanyCountryTag: FC<CustomTagProps> = ({
   text,
   fontSize = "1rem",
}) => {
   return (
      <CompanyTag
         icon={<CompanyLocationIcon size={`calc(${fontSize} * 1.3)`} />}
         fontSize={fontSize}
         text={text}
      />
   )
}

export const CompanyIndustryTag: FC<CustomTagProps> = ({
   text,
   fontSize = "1rem",
}) => {
   return (
      <CompanyTag
         icon={<CompanyIndustryIcon size={`calc(${fontSize} * 1.3)`} />}
         fontSize={fontSize}
         text={text}
      />
   )
}

export const CompanySizeTag: FC<CustomTagProps> = ({
   text,
   fontSize = "1rem",
}) => {
   return (
      <CompanyTag
         icon={<CompanySizeIcon size={`calc(${fontSize} * 1.3)`} />}
         fontSize={fontSize}
         text={text}
      />
   )
}

export default CompanyTag
