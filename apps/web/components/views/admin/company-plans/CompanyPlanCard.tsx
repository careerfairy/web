import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"
import { Box, Button, Stack, Typography } from "@mui/material"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"
import Link from "components/views/common/Link"
import CircularLogo from "components/views/common/logos/CircularLogo"
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
   noMouseEvents: {
      pointerEvents: "none",
   },
   actions: {
      width: "100%",
   },
})

type Props = {
   presenter: GroupPresenter
   setGroupToManage: (group: GroupPresenter) => void
}

const CompanyPlanCard = React.memo(({ presenter, setGroupToManage }: Props) => {
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
      </Box>
   )
})

CompanyPlanCard.displayName = "CompanyPlanCard"

export default CompanyPlanCard
