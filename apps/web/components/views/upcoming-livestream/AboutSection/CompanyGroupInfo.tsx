import React, { useMemo } from "react"
import Box from "@mui/material/Box"
import { Typography } from "@mui/material"
import Stack from "@mui/material/Stack"
import { ChevronRight as MoreIcon } from "react-feather"
import Link from "../../common/Link"
import { Group } from "@careerfairy/shared-lib/groups"
import { sxStyles } from "../../../../types/commonTypes"
import { companyNameSlugify } from "@careerfairy/shared-lib/utils"
import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"
import {
   CompanyCountryTag,
   CompanyIndustryTag,
   CompanySizeTag,
} from "../../common/company/company-tags"

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
   const showCompanyPageCta = useMemo(() => {
      const presenter = GroupPresenter.createFromDocument(companyGroupData)

      return Boolean(
         companyGroupData.publicProfile && presenter.companyPageIsReady()
      )
   }, [companyGroupData])

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
                  md: "row",
               }}
               spacing={{
                  xs: 1,
                  md: 4,
               }}
            >
               {companyGroupData.companyCountry ? (
                  <CompanyCountryTag
                     fontSize={"1.07rem"}
                     text={companyGroupData.companyCountry.name}
                  />
               ) : null}
               {companyGroupData.companyIndustries?.length ? (
                  <CompanyIndustryTag
                     fontSize={"1.07rem"}
                     text={companyGroupData.companyIndustries
                        .map(({ name }) => name)
                        .join(", ")}
                  />
               ) : null}
               {companyGroupData.companySize ? (
                  <CompanySizeTag
                     fontSize={"1.07rem"}
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
            {showCompanyPageCta ? (
               <Box
                  display="flex"
                  component={Link}
                  href={`/company/${companyNameSlugify(
                     companyGroupData.universityName
                  )}`}
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

export default CompanyGroupInfo
