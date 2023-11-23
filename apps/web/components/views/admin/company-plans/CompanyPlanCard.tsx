import { Group } from "@careerfairy/shared-lib/groups"
import { Box, Typography } from "@mui/material"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"
import CircularLogo from "components/views/common/logos/CircularLogo"
import React from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      p: 2,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      borderRadius: 3,
      bgcolor: "background.paper",
   },
   name: {
      fontWeight: 600,
      fontSize: "1.286rem !important",
      textAlign: "center",
      ...getMaxLineStyles(1),
   },
})

type Props = {
   group: Group
}

const CompanyPlanCard = (props: Props) => {
   return (
      <Box sx={styles.root}>
         <CircularLogo
            src={props.group.logoUrl}
            alt={props.group.universityName}
            size={64}
         />
         <Box pt={1.5} />
         <Typography variant={"h6"} sx={styles.name}>
            {props.group.universityName}
         </Typography>
      </Box>
   )
}

export default CompanyPlanCard
