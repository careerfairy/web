import { GroupWithPolicy } from "@careerfairy/shared-lib/src/groups"
import {
   LivestreamEvent,
   LivestreamGroupQuestionsMap,
} from "@careerfairy/shared-lib/src/livestreams"
import { Box, Button, IconButton, Stack, Typography } from "@mui/material"
import { sxStyles } from "../../../../../types/commonTypes"
import useIsMobile from "../../../../custom-hook/useIsMobile"

import { useUpcomingPanelEventsSWR } from "components/custom-hook/panels/useUpcomingPanelEventsSWR"
import { RectanglePanelCard } from "components/views/panels/cards/RectanglePanelCard"
import { SquarePanelCard } from "components/views/panels/cards/SquarePanelCard"
import { Fragment, useCallback, useEffect, useRef } from "react"
import { Check, ChevronLeft, ChevronRight } from "react-feather"
import Link from "../../../common/Link"
import { useLiveStreamDialog } from "../../LivestreamDialog"
import useRegistrationHandler from "../../useRegistrationHandler"

const CARD_HEIGHT = 275

const styles = sxStyles({
   root: {
      display: "flex",
      flexDirection: "column",
      gap: 3,
      p: { xs: 2, md: 3 },
      minHeight: "100%",
      position: "relative",
      background:
         "radial-gradient(77.33% 35.71% at 50% 57.27%, rgba(31, 219, 192, 0.16) 0%, rgba(31, 219, 192, 0.00) 100%), radial-gradient(133.95% 87.68% at 50% 50%, rgba(0, 161, 255, 0.00) 0%, rgba(0, 161, 255, 0.22) 100%), radial-gradient(66.92% 33.44% at 50% 57.45%, rgba(42, 186, 165, 0.44) 0%, rgba(42, 186, 165, 0.00) 100%), linear-gradient(0deg, #0A1E1B 0%, #0A1E1B 100%), #FDFDFD",
      // Text sits on top of animated dialog background
      color: (theme) => theme.brand.white[100],
   },
   topLeftBar: {
      position: "absolute",
      top: 16,
      left: 16,
      zIndex: 10,
   },
   centerContent: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
      gap: { xs: 6, md: 3 },
      width: "100%",
      maxWidth: "728px",
      alignSelf: "center",
      mt: { xs: 6, md: 0 },
   },
   header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      textAlign: "center",
      mt: { xs: 1, md: 2 },
   },
   backButton: {
      position: "absolute",
      left: 0,
      top: 0,
      color: (theme) => theme.brand.white[100],
   },
   title: {
      color: (theme) => theme.brand.white[100],
      fontWeight: 700,
   },
   subtitle: {
      color: (theme) => theme.brand.white[100],
      opacity: 0.9,
   },
   cards: (theme) => ({
      display: "grid",
      gridTemplateColumns: { xs: "1fr", tablet: "1fr 1fr", md: "1fr 1fr" },
      gap: 2,
      alignItems: "stretch",
      width: "100%",
      [theme.breakpoints.up("tablet")]: { gap: 3 },
   }),
   ctaContainer: {
      mt: "auto",
   },
   cardWrapper: {
      position: "relative",
      minHeight: { tablet: `${CARD_HEIGHT}px` },
   },
   overlaySaturationBlack: (theme) => ({
      pointerEvents: "none",
      position: "absolute",
      inset: 0,
      borderRadius: "16px",
      backgroundColor: theme.brand.black[900],
      mixBlendMode: "saturation",
      zIndex: 1,
   }),
   overlaySaturationAlpha: {
      pointerEvents: "none",
      position: "absolute",
      inset: 0,
      borderRadius: "16px",
      backgroundColor: "rgba(0,0,0,0.4)",
      mixBlendMode: "saturation",
      zIndex: 2,
   },
   outlineOverlay: {
      pointerEvents: "none",
      position: "absolute",
      inset: 0,
      borderRadius: "16px",
      outlineOffset: 0,
      zIndex: 3,
   },
   checkboxBase: {
      pointerEvents: "none",
      position: "absolute",
      bottom: { xs: 6, tablet: "auto" },
      right: { xs: 6, tablet: "auto" },
      top: { xs: "auto", tablet: 12 },
      left: { xs: "auto", tablet: 12 },
      width: 28,
      height: 28,
      borderRadius: 30,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 4,
   },
   checkboxSelected: (theme) => ({
      bgcolor: theme.palette.primary.main,
   }),
   checkboxUnselected: (theme) => ({
      bgcolor: theme.brand.black[700],
      border: `2px solid ${theme.brand.black[700]}`,
   }),
})

type Props = {
   goToPrevious: () => void
   handleSubmit: (values: LivestreamGroupQuestionsMap) => Promise<void>
}

/**
 * UI for the user to answer the group questions and give consent
 */
export const PanelsConsentView = ({ goToPrevious, handleSubmit }: Props) => {
   const { registrationState, onRegisterSuccess } = useLiveStreamDialog()
   const { data: panels = [] } = useUpcomingPanelEventsSWR({
      // If users are already in the dialog, then they are allowed to see all panels
      disableCountryLimitation: true,
   })
   const {
      selectedLivestreams,
      isLivestreamSelected,
      toggleLivestreamSelection,
      setLivestreamSelections,
   } = useRegistrationHandler()

   const { groupsWithPolicies } = registrationState

   const policiesToAccept = groupsWithPolicies?.length > 0

   const handleBack = useCallback(() => {
      onRegisterSuccess ? undefined : goToPrevious()
   }, [goToPrevious, onRegisterSuccess])

   return (
      <>
         <Stack sx={styles.root}>
            <Box sx={styles.topLeftBar}>
               <IconButton onClick={handleBack} sx={styles.backButton}>
                  <ChevronLeft size={24} />
               </IconButton>
            </Box>

            <Box sx={styles.centerContent}>
               <Box sx={styles.header}>
                  <Stack spacing={1} alignItems="center" width="100%">
                     <Typography variant="brandedH2" sx={styles.title}>
                        Ready to stand out this fall?
                     </Typography>
                     <Typography variant="medium" sx={styles.subtitle}>
                        Two sessions to get you fully ready for this hiring
                        season. Check your status below.
                     </Typography>
                  </Stack>
               </Box>

               <PanelSelectionGrid
                  panels={panels}
                  selectedLivestreams={selectedLivestreams}
                  isLivestreamSelected={isLivestreamSelected}
                  toggleLivestreamSelection={toggleLivestreamSelection}
                  setLivestreamSelections={setLivestreamSelections}
               />
               {policiesToAccept ? (
                  <ConsentText groupsWithPolicies={groupsWithPolicies} />
               ) : null}
            </Box>

            <Box sx={styles.ctaContainer}>
               <Button
                  fullWidth
                  disabled={selectedLivestreams.length === 0}
                  onClick={() => handleSubmit({})}
                  variant="contained"
                  size="medium"
                  color="primary"
                  endIcon={<ChevronRight size={24} />}
               >
                  Complete registration
               </Button>
            </Box>
         </Stack>
      </>
   )
}

const ConsentText = ({
   groupsWithPolicies,
}: {
   groupsWithPolicies: GroupWithPolicy[]
}) => {
   return (
      <Stack spacing={1}>
         <Typography>
            By registering you agree that your information (first name, last
            name, university affiliation) will be transferred to the organiser.
            The data protection notice of the organiser applies.
            <br />
            <br />
            You can find it here:&nbsp;
            {groupsWithPolicies.map((group, index) => (
               <Fragment key={group.universityName}>
                  <Link
                     target="_blank"
                     href={group.privacyPolicyUrl}
                     rel="noreferrer"
                  >
                     {group.universityName}
                  </Link>
                  {index < groupsWithPolicies.length - 1 ? ", " : "."}
               </Fragment>
            ))}
         </Typography>
      </Stack>
   )
}

type PanelSelectionGridProps = {
   panels: LivestreamEvent[]
   selectedLivestreams: LivestreamEvent[]
   isLivestreamSelected: (id: string) => boolean
   toggleLivestreamSelection: (event: LivestreamEvent) => void
   setLivestreamSelections: (events: LivestreamEvent[]) => void
}

const PanelSelectionGrid = ({
   panels,
   selectedLivestreams,
   isLivestreamSelected,
   toggleLivestreamSelection,
   setLivestreamSelections,
}: PanelSelectionGridProps) => {
   const isMobile = useIsMobile()
   const initializedRef = useRef(false)

   // Make panels selected as default on first render
   useEffect(() => {
      if (
         !initializedRef.current &&
         panels?.length &&
         selectedLivestreams.length === 0
      ) {
         setLivestreamSelections(panels)
         initializedRef.current = true
      }
   }, [panels, selectedLivestreams.length, setLivestreamSelections])

   return (
      <Box sx={styles.cards}>
         {panels.map((event) => {
            const isSelected = isLivestreamSelected(event.id)
            return (
               <Box key={event.id} sx={styles.cardWrapper}>
                  {isMobile ? (
                     <RectanglePanelCard
                        event={event}
                        hideRegistrationStatus
                        onCardClick={() => toggleLivestreamSelection(event)}
                     />
                  ) : (
                     <SquarePanelCard
                        event={event}
                        onCardClick={() => toggleLivestreamSelection(event)}
                     />
                  )}
                  {/* Desaturation overlays when not selected */}
                  {!isSelected ? (
                     <>
                        <Box sx={styles.overlaySaturationBlack} />
                        <Box sx={styles.overlaySaturationAlpha} />
                     </>
                  ) : null}
                  {/* Selection outline overlay */}
                  <Box
                     sx={[
                        styles.outlineOverlay,
                        isSelected
                           ? (theme) => ({
                                outline: `2px solid ${theme.palette.primary.main}`,
                             })
                           : null,
                     ]}
                  />
                  {/* Checkbox */}
                  <Box
                     sx={[
                        styles.checkboxBase,
                        isSelected
                           ? styles.checkboxSelected
                           : styles.checkboxUnselected,
                     ]}
                  >
                     {isSelected ? <Check size={16} color="white" /> : null}
                  </Box>
               </Box>
            )
         })}
      </Box>
   )
}
