import { Box, Button, Typography } from "@mui/material"
import useGroupCustomJobs from "../../../../custom-hook/useGroupCustomJobs"
import JobList from "./JobList"
import { Briefcase, PlusCircle } from "react-feather"
import { sxStyles } from "../../../../../types/commonTypes"
import { FC, useCallback } from "react"
import Stack from "@mui/material/Stack"
import { openPrivacyPolicyDialog } from "../../../../../store/reducers/adminJobsReducer"
import { useDispatch } from "react-redux"
import { useTheme } from "@mui/material/styles"

const styles = sxStyles({
   wrap: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
      mb: "100px",
      px: 4,
   },
   info: {
      maxWidth: "500px",
      alignItems: "center",
      textAlign: "center",
   },
   subtitle: {
      fontSize: "16px",
   },
   btn: {
      textTransform: "none",
   },
})

type Props = {
   groupId: string
}
const JobsContent: FC<Props> = ({ groupId }) => {
   const allJobs = useGroupCustomJobs(groupId)

   return allJobs.length > 0 ? <JobList /> : <NoJobs />
}

const NoJobs = () => {
   const theme = useTheme()
   const dispatch = useDispatch()

   const handleCreteNewJobClick = useCallback(() => {
      dispatch(openPrivacyPolicyDialog())
   }, [dispatch])

   return (
      <Box sx={styles.wrap}>
         <Stack spacing={4} sx={styles.info}>
            <Briefcase size={70} color={theme.palette.secondary.main} />

            <Typography variant={"h5"} fontWeight={"bold"}>
               Promote your job openings!
            </Typography>
            <Typography variant={"subtitle1"} sx={styles.subtitle}>
               Ready to kickstart your hiring journey? Create your first job
               posting and promote it to your talent community.
            </Typography>
            <Button
               variant="contained"
               color="secondary"
               startIcon={<PlusCircle />}
               onClick={handleCreteNewJobClick}
               sx={styles.btn}
            >
               Create new job
            </Button>
         </Stack>
      </Box>
   )
}

export default JobsContent
