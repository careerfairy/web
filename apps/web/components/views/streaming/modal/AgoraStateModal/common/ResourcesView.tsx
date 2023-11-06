import React, { useMemo } from "react"
import { CardMedia, Stack, Typography } from "@mui/material"
import { sxStyles } from "../../../../../../types/commonTypes"
import Image from "next/legacy/image"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import { getDictValues } from "../../../../../../util/CommonUtil"
import { useNetworkState } from "react-use"

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
   const { online } = useNetworkState()

   const options = useMemo(
      () => getDictValues(resourceIds, resourcesDict),
      [resourceIds]
   )

   return (
      <Stack spacing={2}>
         <Typography variant="h5" fontWeight={500}>
            You might also want to view
         </Typography>
         <Stack spacing={1.5}>
            {options.map((resource) => (
               <ResourceCard
                  online={online}
                  {...resource}
                  key={resource.title}
               />
            ))}
         </Stack>
      </Stack>
   )
}

export default ResourcesView

interface ResourceCardProps {
   previewImageUrl: string
   online?: boolean
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
   online,
   previewImageCaption,
}: ResourceCardProps) => {
   return (
      <Stack
         sx={styles.root}
         direction={"row"}
         component={"article"}
         spacing={2}
      >
         {online && (
            <CardMedia sx={styles.image}>
               <Image
                  width={120}
                  height={80}
                  src={previewImageUrl}
                  alt={previewImageCaption}
               />
            </CardMedia>
         )}
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
      title: "Best Practices Before Going Live",
      authorName: "CareerFairy",
      previewImageUrl:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/landing%20photos%2Fstreamer.webp?alt=media&token=20bd52bc-860c-4f62-8292-9800e6691cee",
      actionButtonProps: {
         href: "https://support.careerfairy.io/en/article/test-the-careerfairy-streaming-app-d4ec1f/",
         label: "Read our article",
      },
   },
   troubleshootingConnectionIssues: {
      title: "Technical Requirements to Use CareerFairy",
      authorName: "CareerFairy",
      previewImageUrl:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/landing%20photos%2Fipad_680x680.jpg?alt=media&token=4e157eb7-a10b-4aed-9324-00922f96e33b",
      actionButtonProps: {
         href: "https://support.careerfairy.io/en/article/how-to-use-the-careerfairy-streaming-app-1qmh8ci/",
         label: "Read our article",
      },
   },
}
