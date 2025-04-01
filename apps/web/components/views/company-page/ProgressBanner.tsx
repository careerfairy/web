import Arrow from "@mui/icons-material/ArrowForwardRounded"
import CloseIcon from "@mui/icons-material/Close"
import {
   Box,
   Container,
   Grid,
   IconButton,
   LinearProgress,
   Stack,
   Typography,
   linearProgressClasses,
} from "@mui/material"
import { useCallback, useMemo } from "react"
import { useSessionStorage } from "react-use"
import { sxStyles } from "../../../types/commonTypes"
import { useCompanyPage } from "./index"

const styles = sxStyles({
   root: {
      position: "relative",
   },
   progress: {
      flex: 1,
      height: 10,
      borderRadius: 5,
      [`& .${linearProgressClasses.bar}`]: {
         borderRadius: 5,
      },
   },
   progressNotReady: (theme) => ({
      [`&.${linearProgressClasses.colorPrimary}`]: {
         backgroundColor:
            theme.palette.grey[theme.palette.mode === "light" ? 200 : 800],
      },
   }),
   progressContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
   },
   list: {
      listStyleType: "none",
      pl: 0,
   },
   listItem: {
      display: "list-item",
      position: "relative",
      paddingLeft: 3,
      "&:not(:last-child)": {
         mb: 1,
      },
      "&::before": {
         content: "'\\2022'",
         position: "absolute",
         left: 0,
         color: "primary.main",
         fontSize: "2.5rem",
         lineHeight: "1.3rem",
      },
   },

   closeButtonWrapper: {
      position: "absolute",
      top: 0,
      right: 0,
      p: 1,
   },
   listItemContent: {
      display: "flex",
      alignItems: "center",
      color: "text.primary",
      "& .arrow": {
         transition: (theme) => theme.transitions.create("all"),
         ml: 1,
      },
      "&:hover": {
         "& .arrow": {
            opacity: 1,
            ml: 2,
         },
      },
   },
})

const sessionKey = "hasDismissedProgressBanner"
const ProgressBanner = () => {
   const { groupPresenter, editMode } = useCompanyPage()

   const [hasDismissedBanner, setHasDismissedBanner] =
      useSessionStorage(sessionKey)

   const progress = useMemo(() => {
      return groupPresenter.getCompanyPageProgress()
   }, [groupPresenter])

   const handleDismiss = useCallback(() => {
      setHasDismissedBanner("true")
   }, [setHasDismissedBanner])

   if (progress.isComplete || hasDismissedBanner || !editMode) return null

   return (
      <Box sx={styles.root}>
         <Container disableGutters maxWidth="lg">
            <Grid container>
               <Grid item xs={12} md={6}>
                  <Stack px={3} py={3} spacing={2}>
                     <Typography fontWeight={600} variant={"h4"}>
                        {progress.isReady
                           ? "How Appealing Is Your Profile?"
                           : "Ready To Start?"}
                     </Typography>
                     <Stack direction={"row"} alignItems={"center"} spacing={2}>
                        <LinearProgress
                           sx={[
                              styles.progress,
                              !progress.isReady && styles.progressNotReady,
                           ]}
                           variant={"determinate"}
                           value={progress.percentage}
                        />
                        <Typography variant={"body1"} fontWeight={500}>
                           {progress.percentage}%
                        </Typography>
                     </Stack>
                     <Typography variant={"body1"} fontWeight={500}>
                        {progress.isReady
                           ? "Add the following to complete your company page and attract young talent:"
                           : "The following information is missing to generate the company page:"}
                     </Typography>
                     <Box sx={styles.list} component="ul">
                        {progress.currentSteps.map((point) => (
                           <Box
                              sx={styles.listItem}
                              component="li"
                              key={point.label}
                           >
                              <Box component={"a"} sx={styles.listItemContent}>
                                 <Typography variant="body1" color="black">
                                    {point.label}
                                 </Typography>
                                 <Arrow className={"arrow"} />
                              </Box>
                           </Box>
                        ))}
                     </Box>
                  </Stack>
               </Grid>
            </Grid>
         </Container>
         <Box sx={styles.closeButtonWrapper}>
            <IconButton onClick={handleDismiss}>
               <CloseIcon />
            </IconButton>
         </Box>
      </Box>
   )
}

export default ProgressBanner
