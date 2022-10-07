import React, { ComponentProps } from "react"
import { CardMedia, Divider, Stack, Typography } from "@mui/material"
import { sxStyles } from "../../../../../../types/commonTypes"
import Image from "next/image"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import dynamic from "next/dynamic"
import CircularProgress from "@mui/material/CircularProgress"

const ResourceVideoPLayer = dynamic(() => import("./ResourceVideoPLayer"), {
   ssr: false,
   loading: () => <CircularProgress />,
})

const styles = sxStyles({
   fullWidth: {
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
      "& .MuiButton-root": {
         whiteSpace: "nowrap",
      },
   },
})

type Props = {
   options: ComponentProps<typeof ResourceCard>[]
}
const ResourcesView = ({ options }: Props) => {
   return (
      <Stack spacing={2}>
         <Typography variant="h5" fontWeight={500}>
            You might also want to view
         </Typography>
         <Stack divider={<Divider flexItem />} spacing={2}>
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
   videoUrl?: string
   actionButtonProps?: {
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
   videoUrl,
}: ResourceCardProps) => {
   return (
      <Stack
         sx={styles.fullWidth}
         direction={videoUrl ? "column" : "row"}
         component={"article"}
         spacing={2}
      >
         <Stack sx={styles.fullWidth} spacing={2} direction={"row"}>
            {!videoUrl && (
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
         </Stack>

         {actionButtonProps && (
            <Box sx={styles.buttonWrapper}>
               <Button
                  component={"a"}
                  rel={"noopener noreferrer"}
                  variant={"outlined"}
                  size={"small"}
                  href={actionButtonProps.href}
                  target={"_blank"}
               >
                  {actionButtonProps.label}
               </Button>
            </Box>
         )}
         {videoUrl && (
            <ResourceVideoPLayer
               videoUrl={videoUrl}
               previewImageUrl={previewImageUrl}
            />
         )}
      </Stack>
   )
}

export const resources: ComponentProps<typeof ResourceCard>[] = [
   {
      title: "How to fix connection issues",
      authorName: "Max Voss",
      previewImageUrl:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/illustration-images%2Fbalck-screen-image.webp?alt=media&token=ee3edbe3-9b8f-4a08-b21a-2f111dfd9a7f",
      videoUrl: "https://www.youtube.com/watch?v=35BkHichD2M",
   },
   {
      title: "How to use a VPN",
      authorName: "Maximilian Schwarzmüller",
      previewImageUrl:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/illustration-images%2Fvpn-image.jpg?alt=media&token=f029eceb-e77b-4448-94b0-0b06e7bbade2",
      previewImageCaption: "6:49",
      actionButtonProps: {
         href: "https://www.agora.io/en/blog/past-present-future-of-webrtc/",
         label: "Read more",
      },
   },
]
