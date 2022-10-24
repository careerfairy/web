import React, { useMemo } from "react"
import { CardMedia, Stack, Typography } from "@mui/material"
import { sxStyles } from "../../../../../../types/commonTypes"
import Image from "next/image"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import { getDictValues } from "../../../../../../util/CommonUtil"

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
      title: "Best Practices Before Going Live",
      authorName: "CareerFairy",
      previewImageUrl:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/misc%2Fchrome-image.png?alt=media&token=b4ab3f69-3d27-4b0f-b92e-75cd9df434c4",
      actionButtonProps: {
         href: "https://careerfairy-support.crisp.help/en/article/best-practices-before-going-live-1ojgf00/?bust=1665748832154",
         label: "Read our article",
      },
   },
   troubleshootingConnectionIssues: {
      title: "Technical Requirements to Use CareerFairy",
      authorName: "CareerFairy",
      previewImageUrl:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/misc%2Fcompat-overlay.png?alt=media&token=7461d59e-bc40-480c-a89c-9dc0fe93e782",
      actionButtonProps: {
         href: "https://careerfairy-support.crisp.help/en/article/technical-requirements-to-use-livestorm-1g4nk1t/?bust=1665749028480",
         label: "Read our article",
      },
   },
}
