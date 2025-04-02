import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"
import { Rocket } from "@mui/icons-material"
import { Box, Button, Stack, Typography } from "@mui/material"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"
import Link from "components/views/common/Link"
import CircularLogo from "components/views/common/logos/CircularLogo"
import React, { Dispatch, SetStateAction, useState } from "react"
import { sxStyles } from "types/commonTypes"
import ActionButton from "./ActionButton"
import { BoostedCompanyDialog } from "./BoostedCompanyDialog"
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
   noMouseEvents: {
      pointerEvents: "none",
   },
   actions: {
      width: "100%",
   },
   logoContainer: {
      position: "relative",
      width: 64,
      height: 64,
   },
   rocketIcon: {
      position: "absolute",
      bottom: 4,
      right: 2,
      color: (theme) => theme.palette.warning[500],
      backgroundColor: (theme) => theme.palette.warning[50],
      border: (theme) => `1px solid ${theme.palette.warning[500]}`,
      padding: 0.5,
      fontSize: 20,
      borderRadius: "48px",
      cursor: "pointer",
   },
})

type Props = {
   presenter: GroupPresenter
   setGroupToManage: Dispatch<SetStateAction<GroupPresenter>>
}

const CompanyPlanCard = React.memo(({ presenter, setGroupToManage }: Props) => {
   const [isBoostedDialogOpen, setIsBoostedDialogOpen] = useState(false)
   const isFeaturedGroup = presenter.isFeaturedGroup()

   return (
      <Box sx={styles.root}>
         <Box sx={styles.logoContainer}>
            <CircularLogo
               src={presenter.getCompanyLogoUrl()}
               alt={presenter.universityName}
               size={64}
            />
            {isFeaturedGroup ? (
               <Rocket
                  onClick={() => {
                     setIsBoostedDialogOpen(true)
                  }}
                  sx={styles.rocketIcon}
               />
            ) : null}
         </Box>
         <Box pt={1.5} />
         <Typography variant={"h6"} sx={styles.name}>
            {presenter.universityName}
         </Typography>
         <Box pt={1.5} />
         <StatusChips presenter={presenter} />
         <Box pt={4} />
         <Stack sx={styles.actions} spacing={0.5}>
            <ActionButton
               onClick={() => setGroupToManage(presenter)}
               presenter={presenter}
            />
            <Button
               component={Link}
               noLinkStyle
               size={"small"}
               color="grey"
               variant="text"
               href={`/group/${presenter.id}/admin`}
               sx={styles.adminPageBtn}
            >
               View dashboard
            </Button>
         </Stack>
         <BoostedCompanyDialog
            featuredData={presenter.featured}
            open={isBoostedDialogOpen}
            onClose={() => setIsBoostedDialogOpen(false)}
         />
      </Box>
   )
})

CompanyPlanCard.displayName = "CompanyPlanCard"

export default CompanyPlanCard
