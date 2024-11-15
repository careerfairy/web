import BadgeOutlined from "@mui/icons-material/BadgeOutlined"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"
import { useCallback, useEffect, useRef, useState } from "react"
import { useLocalStorage } from "react-use"
import { useAuth } from "../../../HOCs/AuthProvider"
import usePulseStyles from "../../../materialUI/Misc/pulse"
import useIsMobile from "../../custom-hook/useIsMobile"
import { BrandedTooltip } from "../streaming-page/components/BrandedTooltip"
import UserDataModal, { missingDataFields } from "./UserDataModal"

const styles = {
   containerIcon: {
      width: "26px",
      height: "26px",
      backgroundColor: "primary.main",
      borderRadius: "50%",
      display: "flex",
      justifyContent: "center",
   },
}

export const MISSING_DATA_KEY = "cf_missing_data" // localstorage key
export const MISSING_DATA_DISMISS_PERIOD_MS = 3600 * 24 * 7 // 1 week

const MissingDataButton = ({
   switchInterval = 1000, // 1s delay until a more intrusive button
}: Props) => {
   const { authenticatedUser: user, userData, isLoggedOut } = useAuth()
   const isMobile = useIsMobile()
   const pulseClasses = usePulseStyles()
   const buttonRef = useRef(null)
   const [missingFields, setMissingFields] = useState([])
   const [hidden, setHidden] = useState(true)
   const [showLargeButton, setShowLargeButton] = useState(false)
   const [isModalOpen, setIsModalOpen] = useState(false)
   const [dismissedAt, setDismissedAt, removeDismissedAt] = useLocalStorage(
      MISSING_DATA_KEY,
      null
   )

   // confirm with localstorage if we should hide or not
   useEffect(() => {
      if (missingFields.length === 0) {
         setHidden(true)
         return
      }

      if (dismissedAt) {
         try {
            if (Date.now() - dismissedAt > MISSING_DATA_DISMISS_PERIOD_MS) {
               setHidden(false)
               removeDismissedAt()
               return
            }
         } catch (e) {
            console.error(e)
         }
      } else {
         setHidden(false)
      }
   }, [dismissedAt, missingFields])

   // check if we have any field missing
   useEffect(() => {
      if (!isModalOpen && user && userData) {
         setMissingFields(
            missingDataFields.filter((f) => f.isMissing(userData))
         )
      }
   }, [user, userData, isModalOpen])

   // switch to a more intrusive style after a while
   useEffect(() => {
      if (missingFields.length > 0 && !isModalOpen) {
         const timer = setTimeout(
            () => {
               setShowLargeButton(true)
            },
            switchInterval,
            missingFields
         )

         return () => clearTimeout(timer)
      }
   }, [switchInterval, missingFields, isModalOpen])

   const handleModalOpen = () => {
      setIsModalOpen(true)
   }

   const handleModalClose = useCallback(
      (e, reason) => {
         if (reason === undefined) {
            // dismiss button click
            setDismissedAt(Date.now())
            setHidden(true)
         }

         if (reason === "end") {
            // save button click (last step)
            setHidden(true)
         }

         setIsModalOpen(false)
      },
      [setDismissedAt]
   )

   if (hidden || isLoggedOut) return null

   return (
      <Box>
         <BrandedTooltip title={`You have missing data in your profile`}>
            {showLargeButton && !isMobile ? (
               <Button
                  variant="contained"
                  size="medium"
                  disableElevation
                  className={isModalOpen ? "" : pulseClasses.pulseAnimate}
                  onClick={handleModalOpen}
               >
                  Fill in missing data
               </Button>
            ) : (
               <IconButton
                  ref={buttonRef}
                  color="primary"
                  size="small"
                  onClick={handleModalOpen}
               >
                  <Box
                     component="span"
                     sx={styles.containerIcon}
                     className={isModalOpen ? "" : pulseClasses.pulseAnimate}
                  >
                     <BadgeOutlined sx={{ color: "white" }} />
                  </Box>
               </IconButton>
            )}
         </BrandedTooltip>

         {isModalOpen ? (
            <UserDataModal
               handleModalClose={handleModalClose}
               isModalOpen={isModalOpen}
               missingFields={missingFields}
            />
         ) : null}
      </Box>
   )
}

type Props = {
   switchInterval?: number
}

export default MissingDataButton
