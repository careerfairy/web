import { countriesOptionCodes } from "@careerfairy/shared-lib/constants/forms"
import { FieldOfStudyCategories } from "@careerfairy/shared-lib/fieldOfStudy"
import { FeaturedGroup } from "@careerfairy/shared-lib/groups"
import { Chip, IconButton, Stack, Typography } from "@mui/material"

import { Dialog } from "@mui/material"
import { X } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   dialogPaper: {
      padding: 2,
      width: "547px",
   },
   targetDetails: {
      padding: "12px",
      borderRadius: "16px",
      background: (theme) => theme.brand.white[400],
   },
   chip: {
      py: "4px",
      background: (theme) => theme.brand.white[100],
      borderRadius: "60px",
      border: (theme) => `1px solid ${theme.palette.neutral[300]}`,
      fontSize: "16px",
      fontWeight: 400,
      color: (theme) => theme.palette.neutral[700],
   },
})

type Props = {
   featuredData: FeaturedGroup
   open: boolean
   onClose: () => void
}

export const BoostedCompanyDialog = ({
   featuredData,
   open,
   onClose,
}: Props) => {
   const targetCountriesNames =
      featuredData?.targetCountries?.map(
         (country) => countriesOptionCodes.find((c) => c.id === country)?.name
      ) ?? []
   const targetAudienceNames =
      featuredData?.targetAudience.map(
         (audience) => FieldOfStudyCategories[audience].name + " students"
      ) ?? []

   return (
      <Dialog
         open={open}
         onClose={onClose}
         PaperProps={{ sx: styles.dialogPaper }}
      >
         <Stack spacing={2}>
            <Stack
               direction="row"
               justifyContent="space-between"
               alignItems={"center"}
            >
               <Typography variant="brandedH3" fontWeight={700} color={"black"}>
                  Campaign summary
               </Typography>
               <IconButton onClick={onClose}>
                  <X color="black" />
               </IconButton>
            </Stack>
            <Stack
               justifyContent={"space-between"}
               spacing={"12px"}
               sx={styles.targetDetails}
            >
               <TargetDetails
                  title="Target countries"
                  tags={targetCountriesNames}
               />
               <TargetDetails
                  title="Target audience"
                  tags={targetAudienceNames}
               />
            </Stack>
         </Stack>
      </Dialog>
   )
}

type TargetDetailsProps = {
   title: string
   tags: string[]
}
const TargetDetails = ({ title, tags }: TargetDetailsProps) => {
   return (
      <Stack spacing={"12px"}>
         <Typography variant="medium" color={"neutral.900"} fontWeight={600}>
            {title}
         </Typography>
         <Stack direction={"row"} spacing={"4px"}>
            {tags.map((tag) => (
               <Chip key={tag} label={tag} sx={styles.chip} />
            ))}
         </Stack>
      </Stack>
   )
}
