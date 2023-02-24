import React from "react"
import Box from "@mui/material/Box"
import { Typography } from "@mui/material"
import Stack from "@mui/material/Stack"
import {
   ChevronRight as MoreIcon,
   MapPin as CompanyLocationIcon,
   Tag as CompanyIndustryIcon,
   Users as CompanySizeIcon,
} from "react-feather"
import Link from "../../common/Link"
import { Group } from "@careerfairy/shared-lib/groups"
import { sxStyles } from "../../../../types/commonTypes"

type Props = {
   companyGroupData: Group
}

const styles = sxStyles({
   animateMarginOnHover: {
      "&:hover": {
         mr: 1,
         transition: (theme) => theme.transitions.create("margin-right"),
      },
   },
})
const CompanyGroupInfo = ({ companyGroupData }: Props) => {
   return (
      <Box>
         <Stack spacing={1}>
            <Typography
               whiteSpace={"pre-line"}
               fontWeight={"bold"}
               variant="h6"
               gutterBottom
            >
               About {companyGroupData.universityName}
            </Typography>

            <Stack
               direction={{
                  xs: "column",
                  sm: "row",
               }}
               spacing={{
                  xs: 1,
                  sm: 4,
               }}
            >
               {companyGroupData.companyCountry ? (
                  <CompanyTag
                     icon={<CompanyLocationIcon />}
                     text={companyGroupData.companyCountry.name}
                  />
               ) : null}
               {companyGroupData.companyIndustry ? (
                  <CompanyTag
                     icon={<CompanyIndustryIcon />}
                     text={companyGroupData.companyIndustry.name}
                  />
               ) : null}
               {companyGroupData.companySize ? (
                  <CompanyTag
                     icon={<CompanySizeIcon />}
                     text={companyGroupData.companySize}
                  />
               ) : null}
            </Stack>

            <Typography
               style={{ whiteSpace: "pre-line" }}
               color="textSecondary"
               variant="h6"
            >
               {companyGroupData.extraInfo}
            </Typography>
            {companyGroupData.publicProfile ? (
               <Box
                  display="flex"
                  component={Link}
                  href={`#`} // TODO: add company profile link like below:
                  // href={`/company/${companyNameSlugify(
                  //    companyGroupData.universityName
                  // )}`}
                  alignItems={"center"}
                  noLinkStyle
                  color={"secondary.main"}
                  fontWeight={"600"}
               >
                  <Typography
                     variant={"h6"}
                     fontWeight={"bold"}
                     mr={0.5}
                     sx={styles.animateMarginOnHover}
                  >
                     Discover {companyGroupData.universityName}
                  </Typography>
                  <MoreIcon strokeWidth={"3.5"} size={22} fontWeight={"bold"} />
               </Box>
            ) : null}
         </Stack>
      </Box>
   )
}

const CompanyTag = ({ icon, text }: { icon: JSX.Element; text: string }) => {
   return (
      <Box display="flex" alignItems="center">
         {icon}
         <Typography variant="h6" ml={1.5}>
            {text}
         </Typography>
      </Box>
   )
}

export default CompanyGroupInfo
