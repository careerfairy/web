import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Box } from "@mui/material"
import { sxStyles } from "../../../../../types/commonTypes"
import CustomJobDetailsView from "../CustomJobDetailsView"

const styles = sxStyles({
   wrapper: {
      p: 2,
   },
   // jobName: {
   //    fontWeight: 600,
   // },
   // subTitle: {
   //    fontSize: "18px",
   //    fontWeight: 600,
   // },
   // jobValues: {
   //    fontSize: "16px",
   // },
   // content: {
   //    mt: 4,
   // },
   // description: {
   //    fontSize: "16px",
   //    fontWeight: 400,
   //    color: (theme) => theme.palette.text.secondary,
   // },
   // linkedContentWrapper: {
   //    mt: 2,
   // },
   // viewport: {
   //    overflow: "hidden",
   // },
   // slide: {
   //    flex: {
   //       xs: `0 0 90%`,
   //       sm: `0 0 60%`,
   //       md: "0 0 60%",
   //       xl: "0 0 60%",
   //    },
   //    maxWidth: { md: 360 },
   //    minWidth: 0,
   //    height: {
   //       xs: 355,
   //       md: 355,
   //    },
   //    "&:not(:first-of-type)": {
   //       ml: `15px`,
   //    },
   //    "&:first-of-type": {
   //       ml: 0.3,
   //    },
   // },
})

type Props = {
   job: CustomJob
   handleEdit?: () => void
   companyName: string
   companyLogoUrl: string
}
const CustomJobAdminDetails = ({
   job,
   handleEdit,
   companyName,
   companyLogoUrl,
}: Props) => {
   return (
      <Box sx={styles.wrapper}>
         <CustomJobDetailsView
            job={job}
            companyName={companyName}
            companyLogoUrl={companyLogoUrl}
            handleEdit={handleEdit}
            disabledLinkedContentClick
         />
      </Box>
   )
}

export default CustomJobAdminDetails
