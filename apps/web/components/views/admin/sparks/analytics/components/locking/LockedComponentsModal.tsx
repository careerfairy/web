import { Box, Stack, Typography } from "@mui/material"
import UpgradePlanButton from "components/views/checkout/forms/UpgradePlanButton"
import GroupPlansDialog from "components/views/checkout/GroupPlansDialog"
import LockedIcon from "components/views/common/icons/LockedIcon"
import { Unlock } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      position: "fixed",
      zIndex: 9000,
      left: "50%",
      top: "50%",
      transform: {
         xs: "translate(-50%, -50%)",
         md: "translate(-50%, -50%)",
         lg: "translate(-29%, -50%)",
      },
      borderRadius: 2,
   },
   infoWrapper: {
      bgcolor: "#FCFCFE",
      borderRadius: 2,
      boxShadow: "0px 0px 42px 0px rgba(20, 20, 20, 0.08)",
      p: {
         xs: 2.5,
         sm: 4,
      },
      maxWidth: 552,
      zIndex: 1,
   },
   lockedIcon: {
      color: "secondary.main",
      width: {
         xs: 56,
         sm: 64,
      },
      height: {
         xs: 56,
         sm: 64,
      },
   },
   heading: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
   },
   title: {
      textAlign: "center",
      fontWeight: 700,
      fontSize: {
         xs: "1.428rem",
         sm: "1.714rem",
      },
   },
   text: {
      textAlign: "center",
      fontSize: "1.142rem",
   },
   metrics: {
      color: "secondary.main",
      fontWeight: 600,
      fontSize: "1.142rem",
      textAlign: "center",
      listStylePosition: "inside", // Ensure bullets are inside the content flow
      p: 0,
      "& span": {
         position: "relative",
         left: -8,
      },
   },
})

type LockedComponentsModalProps = {
   title: string
   text: string
   metrics: string[]
}

export const LockedComponentsModal = ({
   title,
   text,
   metrics,
}: LockedComponentsModalProps) => {
   return (
      <Box sx={styles.root} data-testid="locked-spark-analytics">
         <Stack spacing={2} sx={styles.infoWrapper}>
            <Stack spacing={1} sx={styles.heading}>
               <LockedIcon sx={styles.lockedIcon} />
               <Typography component="h3" sx={styles.title}>
                  {title}
               </Typography>
               <Typography sx={styles.text}>{text}</Typography>
            </Stack>
            <Box component="ul" sx={styles.metrics}>
               {metrics.map((metric) => (
                  <li key={metric}>
                     <span>{metric}</span>
                  </li>
               ))}
            </Box>
            <Box sx={styles.text}>
               <GroupPlansDialog />
               <UpgradePlanButton
                  text="Unlock it now"
                  icon={<Unlock strokeWidth={3} />}
               />
            </Box>
         </Stack>
      </Box>
   )
}
