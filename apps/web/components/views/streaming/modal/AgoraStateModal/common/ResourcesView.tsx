import React, { useMemo } from "react"
import { CardMedia, Stack, Typography } from "@mui/material"
import { sxStyles } from "../../../../../../types/commonTypes"
import Image from "next/image"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"

const styles = sxStyles({
   root: {
      width: "100%",
   },
   image: (theme) => ({
      boxShadow: 6,
      display: "flex",
      borderRadius: 1,
      overflow: "hidden",
      "& img": {
         transition: theme.transitions.create(["transform"]),
         "&:hover": {
            transform: "scale(1.1) rotate(1deg)",
         },
      },
   }),
   titleText: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      flex: 1,
   },
   buttonWrapper: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      ml: "auto",
   },
})

type ResourceId = "troubleshootingConnectionIssues" | "howToStreamOnCareerFairy"

type Props = {
   resourceIds?: ResourceId[]
}
const ResourcesView = ({ resourceIds }: Props) => {
   const options = useMemo(
      () =>
         resourceIds?.length
            ? resourceIds.map((resourceId) => resourcesDict[resourceId] || null)
            : Object.values(resourcesDict),
      [resourceIds]
   )

   return (
      <Stack spacing={2}>
         <Typography variant="h5" fontWeight={500}>
            You might also want to view
         </Typography>
         <Stack spacing={1.5}>
            {options.map((resource) => (
               <ResourceCard {...resource} key={resource.title} />
            ))}
         </Stack>
      </Stack>
   )
}

export default ResourcesView

interface ResourceCardProps {
   previewImageUrl: string
   previewImageCaption?: string
   title: string
   authorName: string
   actionButtonProps: {
      label: string
      href: string
   }
}

export const ResourceCard = ({
   authorName,
   previewImageUrl,
   actionButtonProps,
   title,
   previewImageCaption,
}: ResourceCardProps) => {
   return (
      <Stack
         sx={styles.root}
         direction={"row"}
         component={"article"}
         spacing={2}
      >
         <CardMedia sx={styles.image}>
            <Image
               width={120}
               height={80}
               src={previewImageUrl}
               alt={previewImageCaption}
            />
         </CardMedia>
         <Box sx={styles.titleText}>
            <Typography fontWeight={500} variant={"h6"}>
               {title}
            </Typography>
            <Typography color={"text.secondary"} variant={"subtitle1"}>
               {authorName}
            </Typography>
         </Box>
         <Box sx={styles.buttonWrapper}>
            <Button
               component={"a"}
               rel={"noopener noreferrer"}
               variant={"outlined"}
               href={actionButtonProps.href}
               target={"_blank"}
            >
               {actionButtonProps.label}
            </Button>
         </Box>
      </Stack>
   )
}

const resourcesDict: Record<ResourceId, ResourceCardProps> = {
   howToStreamOnCareerFairy: {
      title: "How to Stream on CareerFairy",
      authorName: "CareerFairy",
      previewImageUrl:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/illustration-images%2Fbalck-screen-image.webp?alt=media&token=ee3edbe3-9b8f-4a08-b21a-2f111dfd9a7f",
      actionButtonProps: {
         href: "https://www.agora.io/en/blog/add-custom-backgrounds-to-your-live-video-calling-application-using-the-agora-android-uikit/",
         label: "Read our article",
      },
   },
   troubleshootingConnectionIssues: {
      title: "Troubleshooting connection issues",
      authorName: "CareerFairy",
      previewImageUrl:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/illustration-images%2Fvpn-image.jpg?alt=media&token=f029eceb-e77b-4448-94b0-0b06e7bbade2",
      previewImageCaption: "6:49",
      actionButtonProps: {
         href: "https://www.youtube.com/watch?v=65GUMaNrsYY",
         label: "Watch video",
      },
   },
}
