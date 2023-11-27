import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"
import { Box, Button, Stack, Typography } from "@mui/material"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"
import Link from "components/views/common/Link"
import CircularLogo from "components/views/common/logos/CircularLogo"
import BrandedTooltip from "components/views/common/tooltips/BrandedTooltip"
import React from "react"
import { sxStyles } from "types/commonTypes"
import ActionButton from "./ActionButton"
import StatusChips from "./StatusChips"

const styles = sxStyles({
   root: {
      p: 2,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      borderRadius: 3,
      bgcolor: "background.paper",
      "& .MuiButton-root": {
         textTransform: "none",
      },
   },
   name: {
      fontWeight: 600,
      fontSize: "1.286rem !important",
      textAlign: "center",
      ...getMaxLineStyles(1),
   },
   description: {
      textAlign: "center",
      ...getMaxLineStyles(2),
   },
   descWrapper: {
      height: 40,
      pt: 0.5,
   },
   adminPageBtn: {
      color: "text.secondary",
   },
   actions: {
      mt: 2.5,
   },
   noMouseEvents: {
      pointerEvents: "none",
   },
})

type Props = {
   presenter: GroupPresenter
}
const extraInfoToolipThreshold = 145

const CompanyPlanCard = React.memo(({ presenter }: Props) => {
   const extraInfo = presenter.extraInfo || ""

   return (
      <Box sx={styles.root}>
         <CircularLogo
            src={presenter.getCompanyLogoUrl()}
            alt={presenter.universityName}
            size={64}
         />
         <Box pt={1.5} />
         <Typography variant={"h6"} sx={styles.name}>
            {presenter.universityName}
         </Typography>
         <StatusChips presenter={presenter} />
         <Box sx={styles.descWrapper}>
            <BrandedTooltip
               title={
                  extraInfo.length > extraInfoToolipThreshold ? extraInfo : ""
               }
               placement={"top"}
            >
               <Typography
                  sx={styles.description}
                  variant={"body2"}
                  color={"text.secondary"}
               >
                  {extraInfo}
               </Typography>
            </BrandedTooltip>
         </Box>
         <Stack spacing={0.5} sx={styles.actions}>
            <ActionButton presenter={presenter} />
            <Button
               component={Link}
               noLinkStyle
               size={"small"}
               color="grey"
               variant="text"
               href={`/group/${presenter.id}/admin`}
               sx={styles.adminPageBtn}
            >
               View admin page
            </Button>
         </Stack>
      </Box>
   )
})

CompanyPlanCard.displayName = "CompanyPlanCard"

export default CompanyPlanCard
