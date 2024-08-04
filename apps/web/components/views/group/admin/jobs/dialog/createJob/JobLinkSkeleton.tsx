import Skeleton from "@mui/material/Skeleton"
import SteppedDialog from "components/views/stepped-dialog/SteppedDialog"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   skeleton: {
      width: "100%",
      height: "100%",
   },
   container: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
      width: "100%",
      px: 2,
      pt: 1,
   },
   wrapperContainer: {
      px: { md: "24px !important" },
      minWidth: { md: "750px" },
   },
   content: {
      mt: { xs: 3, md: 5 },
      width: { xs: "90%", md: 600 },
      height: 300,
   },
   btn: {
      borderRadius: "100px",
      width: 100,
      height: 40,
   },
   title: {
      width: { xs: "40%", md: 400 },
      height: 60,
   },
   subTitle: {
      width: { xs: "80%", md: 500 },
      height: 40,
   },
})

const JobLinkSparksSkeleton = () => {
   return (
      <SteppedDialog.Container withActions>
         <>
            <SteppedDialog.Content sx={styles.container}>
               <Skeleton variant="text" animation="wave" sx={styles.title} />
               <Skeleton variant="text" animation="wave" sx={styles.subTitle} />

               <Skeleton
                  variant="rounded"
                  animation="wave"
                  sx={styles.content}
               />
            </SteppedDialog.Content>

            <SteppedDialog.Actions>
               <Skeleton variant="rounded" animation="wave" sx={styles.btn} />
               <Skeleton variant="rounded" animation="wave" sx={styles.btn} />
            </SteppedDialog.Actions>
         </>
      </SteppedDialog.Container>
   )
}
const JobLinkLiveStreamsSkeleton = () => {
   return (
      <SteppedDialog.Container withActions>
         <>
            <SteppedDialog.Content sx={styles.container}>
               <Skeleton variant="text" animation="wave" sx={styles.title} />

               <Skeleton
                  variant="rounded"
                  animation="wave"
                  sx={styles.content}
               />
            </SteppedDialog.Content>

            <SteppedDialog.Actions>
               <Skeleton variant="rounded" animation="wave" sx={styles.btn} />
               <Skeleton variant="rounded" animation="wave" sx={styles.btn} />
            </SteppedDialog.Actions>
         </>
      </SteppedDialog.Container>
   )
}

export { JobLinkLiveStreamsSkeleton, JobLinkSparksSkeleton }
