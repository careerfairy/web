import { Box, Button, Stack, Typography, darken } from "@mui/material"
import exp from "constants"
import { FC } from "react"
import { sxStyles } from "types/commonTypes"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import Link from "components/views/common/Link"
import { fontGrid } from "@mui/material/styles/cssUtils"

const styles = sxStyles({
   root: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      backgroundColor: "background.paper",
      borderRadius: 5,
      color: "primary.main",
      height: (theme) => theme.spacing(43),
      position: "relative",
      zIndex: 1,
      overflow: "hidden",
      px: 3,
   },
   linkBtn: {
      textTransform: "none",
      mt: 2,
      boxShadow: "none",
   },
   timeIcon: {
      fontSize: 47,
   },
   overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "40%",
      bgcolor: (theme) => darken(theme.palette.background.paper, 0.05),
      zIndex: -1,
   },
   title: {
      mt: 1.2,
      fontSize: "1.285rem",
      fontWeight: 600,
      color: "text.primary",
      textAlign: "center",
   },
})

type Props = {
   link: string
   companyName: string
}

const MoreCard: FC<Props> = ({ link, companyName }) => (
   <Box sx={styles.root}>
      <AccessTimeIcon color="inherit" sx={styles.timeIcon} />
      <Typography sx={styles.title}>
         There’s still more from {companyName} to see
      </Typography>
      <Button
         color="primary"
         variant="contained"
         sx={styles.linkBtn}
         component={Link}
         href={link}
         fullWidth
         size="large"
      >
         Check All
      </Button>
      <Box sx={styles.overlay} />
   </Box>
)

export default MoreCard
