import Image from "next/image"

// material-ui
import { alpha } from "@mui/material/styles"
import { Avatar, Box } from "@mui/material"
import EditGroupIcon from "@mui/icons-material/EditOutlined"

// project imports
import { getResizedUrl } from "../../components/helperFunctions/HelperFunctions"
import Link from "../../components/views/common/Link"
import { sxStyles } from "../../types/commonTypes"
import { useGroup } from "./index"

const styles = sxStyles({
   logoWrapper: {
      height: 180,
      width: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
   },
   logoWrapperHeightNormal: {
      height: 180,
   },
   logoWrapperHeightCompact: {
      height: 100,
   },
   hoverOverlay: (theme) => ({
      position: "absolute",
      inset: 0,
      transition: theme.transitions.create(["opacity"]),
      opacity: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      "&:hover, &:focus": {
         opacity: 1,
         background: alpha(theme.palette.common.black, 0.4),
      },
   }),
   companyAvatar: {
      padding: 1,
      backgroundColor: "white",
      border: "none !important",
      width: "80%",
      height: 100,
      borderRadius: 3,
      position: "relative",
   },
   nextImageWrapper: {
      position: "relative",
      width: "100%",
      height: "100%",
   },
})

const EditGroupLogo = () => {
   const { group, shrunkLeftMenuState } = useGroup()
   return (
      <Box
         sx={[
            styles.logoWrapper,
            shrunkLeftMenuState !== "disabled"
               ? styles.logoWrapperHeightCompact
               : styles.logoWrapperHeightNormal,
         ]}
      >
         <Avatar
            title={`${group.universityName} logo`}
            variant="rounded"
            sx={styles.companyAvatar}
         >
            <Box sx={styles.nextImageWrapper}>
               <Image
                  src={getResizedUrl(group?.logoUrl, "lg")}
                  layout="fill"
                  objectFit="contain"
                  quality={100}
                  alt={`logo of company ${group.universityName}`}
               />
            </Box>
            <Box
               component={Link}
               href={`/group/${group.id}/admin/edit`}
               sx={styles.hoverOverlay}
            >
               <EditGroupIcon fontSize="large" />
            </Box>
         </Avatar>
      </Box>
   )
}

export default EditGroupLogo
