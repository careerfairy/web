import {
   FieldOfStudyCategories,
   FieldOfStudyCategory,
} from "@careerfairy/shared-lib/fieldOfStudy"
import { sxStyles } from "@careerfairy/shared-ui"
import { Box, Stack, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "react-feather"

const styles = sxStyles({
   chevron: {
      cursor: "pointer",
      color: (theme) => theme.brand.white[100],
      borderRadius: "36px",
      p: "8px",
      background: "rgba(235, 235, 239, 0.35)",
      backdropFilter: "blur(100px)",
      width: "32px",
      height: "32px",
      transition: "background-color 0.2s ease-in-out",
      "& svg": {
         width: "16px",
         height: "16px",
      },
      "&:hover": {
         background: "rgba(235, 235, 239, 0.6)",
      },
   },
})

type FeaturedCompaniesHeader = {
   category: FieldOfStudyCategory
   onPreviousClick: () => void
   onNextClick: () => void
}

export const FeaturedCompaniesHeader = ({
   category,
   onPreviousClick,
   onNextClick,
}: FeaturedCompaniesHeader) => {
   const isMobile = useIsMobile()

   const MobileHeader = () => (
      <Typography
         // sx={{maxWidth: isMobile ? "70%" : "auto"}}
         sx={{
            px: { xs: 2, sm: 2, md: 0 },
         }}
      >
         <Typography
            variant="brandedH5"
            fontWeight={400}
            sx={{ color: (theme) => theme.brand.white[100] }}
         >
            Featured companies
         </Typography>{" "}
         <Typography
            variant="mobileBrandedH3"
            fontWeight={700}
            sx={{ color: (theme) => theme.brand.white[100] }}
         >
            hiring
            {" "
               .concat(FieldOfStudyCategories[category].name)
               .concat(" students")}
         </Typography>
      </Typography>
   )

   if (!category) return null

   return (
      <ConditionalWrapper condition={!isMobile} fallback={<MobileHeader />}>
         <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ px: 2 }}
         >
            <MobileHeader />
            <Stack direction="row" alignItems="flex-end" gap={1}>
               <Link
                  href={`/companies?featured=true&category=${category}`}
                  target="_blank"
               >
                  <Typography
                     variant="small"
                     sx={{
                        color: (theme) => theme.brand.white[100],
                        textDecoration: "underline",
                     }}
                  >
                     Sell all companies
                  </Typography>
               </Link>
               <Box
                  sx={styles.chevron}
                  component={ChevronLeft}
                  onClick={onPreviousClick}
               />
               <Box
                  sx={styles.chevron}
                  component={ChevronRight}
                  onClick={onNextClick}
               />
            </Stack>
         </Stack>
      </ConditionalWrapper>
   )
}
