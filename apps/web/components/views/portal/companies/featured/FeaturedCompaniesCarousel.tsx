import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"
import { chunkArray } from "@careerfairy/shared-lib/utils"
import { sxStyles } from "@careerfairy/shared-ui"
import { Avatar, Box, Button, Stack, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import { forwardRef } from "react"

const styles = sxStyles({
   companyCardRoot: {
      width: {
         xs: "317px !important",
         sm: "317px !important",
         md: "340px !important",
      },
      minWidth: {
         xs: "317px !important",
         sm: "317px !important",
         md: "340px !important",
      },
      maxWidth: {
         xs: "317px !important",
         sm: "317px !important",
         md: "340px !important",
      },
   },
   carouselRoot: {
      overflow: "hidden",
   },
   companyName: {
      color: (theme) => theme.brand.white[100],
      fontWeight: 600,
      textOverflow: "ellipsis",
      overflow: "hidden",
      whiteSpace: "nowrap",
   },
   companyIndustries: {
      color: (theme) => theme.brand.white[400],
      fontWeight: 400,
      textOverflow: "ellipsis",
      overflow: "hidden",
      whiteSpace: "nowrap",
   },
   companyCountry: {
      color: (theme) => theme.brand.white[400],
      fontWeight: 400,
      textOverflow: "ellipsis",
      overflow: "hidden",
      whiteSpace: "nowrap",
   },
   followButton: {
      width: "fit-content",
      p: "4px 12px",
      borderRadius: "18px",
      background: "rgba(252, 252, 254, 0.43)",
      backdropFilter: "blur(100px)",
      boxShadow: "0px 0px 42px 0px rgba(20, 20, 20, 0.08)",
      border: "1px solid transparent",
      "&:hover": {
         borderRadius: "18px",
         border: "1px solid #FFF",
         background: "rgba(252, 252, 254, 0.43)",
         boxShadow: "0px 0px 42px 0px rgba(20, 20, 20, 0.08)",
         backdropFilter: "blur(100px)",
      },
   },
})

export type ChildRefType = {
   goNext: () => void
   goPrev: () => void
}

type Props = {
   companies: GroupPresenter[]
   emblaRef
}

const FeaturedCompaniesCarousel = forwardRef<ChildRefType, Props>((props) => {
   const { companies, emblaRef } = props
   const isMobile = useIsMobile()

   const MobileCompanies = () => (
      <Stack direction="column" spacing={2}>
         <ChunkCompaniesView companies={chunkArray(companies, 2)?.at(0)} />
         <ChunkCompaniesView companies={chunkArray(companies, 2)?.at(1)} />
      </Stack>
   )

   return (
      <Box sx={styles.carouselRoot} ref={emblaRef}>
         <ConditionalWrapper condition={isMobile}>
            <MobileCompanies />
         </ConditionalWrapper>
         <ConditionalWrapper condition={!isMobile}>
            <Stack direction={"row"} spacing={"32px"}>
               {companies.map((company) => (
                  <FeatureCompanyCard key={company.id} company={company} />
               ))}
            </Stack>
         </ConditionalWrapper>
      </Box>
   )
})

type CompaniesListProps = {
   companies: GroupPresenter[]
}

const ChunkCompaniesView = ({ companies }: CompaniesListProps) => {
   if (!companies.length) return null

   return (
      <Stack direction="row" spacing={2}>
         {companies.at(0) ? (
            <FeatureCompanyCard company={companies.at(0)} />
         ) : null}
         {companies.at(1) ? (
            <FeatureCompanyCard company={companies.at(1)} />
         ) : null}
      </Stack>
   )
}

const FeatureCompanyCard = ({ company }: { company: GroupPresenter }) => {
   const industries = company.companyIndustries
      .map((industry) => industry.name)
      .join(", ")

   return (
      <Stack
         direction="row"
         spacing={2}
         sx={styles.companyCardRoot}
         alignItems={"center"}
      >
         <Avatar src={company.logoUrl} sx={{ width: "64px", height: "64px" }} />
         <Stack sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="medium" sx={styles.companyName}>
               {company.universityName}
            </Typography>
            <Typography variant="small" sx={styles.companyIndustries}>
               {industries}
            </Typography>
            <Typography variant="small" sx={styles.companyCountry}>
               {company.companyCountry?.name}
            </Typography>
         </Stack>
         <Button variant="contained" sx={styles.followButton}>
            <Typography
               variant="small"
               fontWeight={400}
               sx={{ color: (theme) => theme.brand.white[100] }}
            >
               Follow
            </Typography>
         </Button>
      </Stack>
   )
}

FeaturedCompaniesCarousel.displayName = "FeaturedCompaniesCarousel"

export default FeaturedCompaniesCarousel
