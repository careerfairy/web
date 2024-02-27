import React, { useState } from "react"
import { Box, Button, Collapse } from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import SanitizedHTML from "components/util/SanitizedHTML"

const styles = {
   groupBioWrapper: {
      margin: "0 auto",
      display: "flex",
      alignItems: "center",
      flexDirection: "column",
      color: (theme) => theme.palette.common.white,
      marginBottom: "1rem",
   },
   groupBioButton: {
      color: (theme) => theme.palette.common.white,
   },
   groupBioIconFlipped: {
      transform: "rotate(180deg)",
   },
   groupBioIcon: {
      transition: (theme) =>
         theme.transitions.create("transform", {
            duration: theme.transitions.duration.standard,
            easing: theme.transitions.easing.easeInOut,
         }),
   },
   groupBioText: (theme) => ({
      color: "inherit",
      whiteSpace: "pre-line",
      padding: theme.spacing(0, 20),
      [theme.breakpoints.down("md")]: {
         padding: theme.spacing(0),
      },
   }),
}

const GroupBio = ({ groupBio }) => {
   const [showMore, setShowMore] = useState(false)
   const handleToggle = () => setShowMore(!showMore)
   return (
      <Box sx={styles.groupBioWrapper}>
         <Button
            endIcon={
               <ExpandMoreIcon
                  sx={[
                     styles.groupBioIcon,
                     showMore && styles.groupBioIconFlipped,
                  ]}
               />
            }
            size="large"
            sx={styles.groupBioButton}
            onClick={handleToggle}
         >
            {showMore ? "Hide Info" : "More Info"}
         </Button>
         <Collapse in={showMore}>
            <SanitizedHTML sx={styles.groupBioText} htmlString={groupBio} />
         </Collapse>
      </Box>
   )
}

export default GroupBio
