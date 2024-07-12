import { UserJobApplicationDocument } from "@careerfairy/shared-lib/users"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded"
import { CardContent, CardHeader, Divider, Typography } from "@mui/material"
import Card from "@mui/material/Card"
import Skeleton from "@mui/material/Skeleton"
import Stack from "@mui/material/Stack"
import React, { useMemo } from "react"
import { sxStyles } from "../../../../types/commonTypes"
import DateUtil from "../../../../util/DateUtil"

const styles = sxStyles({
   title: {
      fontWeight: 600,
      lineHeight: "23px",
   },
   subtitle: {
      fontWeight: 400,
      fontSize: 18,
   },
   detailWrapper: {
      display: "flex",
      alignItems: "center",
   },
   icon: {
      mr: 1,
   },
   content: {
      px: 4,
      pt: 0,
   },
   header: {
      px: 4,
      pt: 3,
      pb: 2,
      alignItems: "start",
   },
})

type JobApplicationCardProps = {
   jobApplication: UserJobApplicationDocument
}
export const JobApplicationCard = ({
   jobApplication,
}: JobApplicationCardProps) => {
   const detailItems = useMemo<ApplicationDetailItem[]>(() => {
      const details: ApplicationDetailItem[] = [
         {
            icon: <TaskAltRoundedIcon sx={styles.icon} />,
            title: `Applied ${DateUtil.getJobApplicationDate(
               jobApplication.date.toDate()
            )}`,
         },
      ]

      if (jobApplication.currentStage) {
         details.push({
            icon: <InfoOutlinedIcon sx={styles.icon} />,
            title: `Stage ${jobApplication.currentStage}`,
         })
      }

      return details
   }, [jobApplication])

   return (
      <Card>
         <CardHeader
            sx={styles.header}
            title={
               <Typography sx={styles.title} variant="h4" gutterBottom>
                  {jobApplication.job.name}
               </Typography>
            }
            subheader={
               <Typography sx={styles.subtitle} variant="body1">
                  {`Associated to ${jobApplication.livestream.title} event`}
               </Typography>
            }
         />
         <CardContent sx={styles.content}>
            <Stack
               divider={<Divider orientation="vertical" flexItem />}
               direction={{ xs: "column", sm: "row" }}
               spacing={{ xs: 1, sm: 2 }}
            >
               {detailItems.map((detailItem) => (
                  <ApplicationDetail key={detailItem.title} {...detailItem} />
               ))}
            </Stack>
         </CardContent>
      </Card>
   )
}

export const JobApplicationCardSkeleton = () => {
   return (
      <Card>
         <CardHeader
            title={
               <Typography sx={styles.title} variant="h4" gutterBottom>
                  <Skeleton variant={"text"} width={"50%"} />
               </Typography>
            }
            sx={styles.header}
            action={<Skeleton width={25} height={15} />}
            subheader={
               <Typography sx={styles.subtitle} variant="body1">
                  <Skeleton variant="text" width={"80%"} />
               </Typography>
            }
         />
         <CardContent sx={styles.content}>
            <Stack direction={"row"} spacing={2}>
               <Skeleton variant={"text"} height={25} width={"20%"} />
               <Skeleton variant={"text"} height={25} width={"20%"} />
            </Stack>
         </CardContent>
      </Card>
   )
}

type ApplicationDetailItem = {
   icon: React.ReactElement
   title: string
   color?: string
}
const ApplicationDetail = ({
   icon,
   title,
   color = "text.secondary",
}: ApplicationDetailItem) => {
   return (
      <Stack
         sx={{
            color,
         }}
         direction={"row"}
         alignItems={"center"}
      >
         {icon}
         <Typography variant="body1">{title}</Typography>
      </Stack>
   )
}
