// material-ui
import { Box, Typography } from "@mui/material"
import EditGroupIcon from "@mui/icons-material/EditOutlined"

// project imports
import { getMaxLineStyles } from "../../components/helperFunctions/HelperFunctions"
import { sxStyles } from "../../types/commonTypes"
import { useGroup } from "./index"
import CircularLogo from "components/views/common/CircularLogo"
import HoverOverlay from "components/views/common/HoverOverlay"

const styles = sxStyles({
   root: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "80%",
      padding: 1,
      gap: 1,
   },
   rootHeightNormal: {
      height: 180,
   },
   rootHeightCompact: {
      height: 100,
   },
   details: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      justifyContent: "center",
   },
   maxOneLine: {
      ...getMaxLineStyles(1),
   },
   hoverOverlay: {
      color: "white",
   },
})

const EditGroupCard = () => {
   const { group, shrunkLeftMenuState } = useGroup()
   const companyName = group?.universityName

   return (
      <Box
         sx={[
            styles.root,
            shrunkLeftMenuState !== "disabled"
               ? styles.rootHeightCompact
               : styles.rootHeightNormal,
         ]}
      >
         <CircularLogo
            src={group?.logoUrl}
            alt={`logo of company ${companyName}`}
            size={80}
            objectFit="contain"
         >
            <HoverOverlay
               href={`/group/${group.id}/admin/edit`}
               icon={
                  <EditGroupIcon sx={styles.hoverOverlay} fontSize="large" />
               }
            />
         </CircularLogo>
         <Box sx={styles.details}>
            <Typography fontWeight={300} variant={"body1"} color={"#959595"}>
               {"Dashboard"}
            </Typography>
            <Typography sx={styles.maxOneLine} fontWeight={500} color="black">
               {companyName}
            </Typography>
         </Box>
      </Box>
   )
}

export default EditGroupCard
