import { Typography } from "@mui/material"
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
}
const CompanyTag: FC<Props> = ({ icon, text, fontSize = "1rem" }) => {
   return (
      <Box display="flex" alignItems="center" color="neutral.700">
         {icon}
         <Typography
            variant="small"
            fontSize={`${fontSize} !important`}
            ml={"0.5rem"}
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
