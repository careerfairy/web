import React from "react"
import { Testimonial } from "../../../../types/cmsTypes"
import Card from "@mui/material/Card"
import CardMedia from "@mui/material/CardMedia"
import CardContent from "@mui/material/CardContent"
import Typography from "@mui/material/Typography"
import { EmbedProps } from "@graphcms/rich-text-types"
import Image from "next/legacy/image"
import Box from "@mui/material/Box"
import { alpha } from "@mui/material/styles"
const borderRadius = 5
const styles = {
   root: {
      mb: 3,
      mt: { xs: 4, md: 3 },
      mx: "auto",
      borderRadius,
      transition: "0.3s",
      boxShadow: "0px 14px 80px rgba(34, 35, 58, 0.2)",
      position: "relative",
      maxWidth: 500,
      marginLeft: "auto",
      overflow: "initial",
      background: alpha("#ffffff", 0.5),
      display: "flex",
      flexDirection: { xs: "column", md: "row" },
      alignItems: "center",
      py: { xs: 0, md: 2 },
   },
   mediaWrapper: {
      position: "relative",
      width: "100%",
      height: "100%",
      display: "contents",
      "& img": {
         borderRadius,
      },
   },
   media: {
      width: { xs: "88%", md: "100%" },
      ml: { xs: "auto", md: -3 },
      marginRight: "auto",
      marginTop: { xs: -3, md: 0 },
      height: 0,
      paddingBottom: "48%",
      borderRadius,
      backgroundColor: "#fff",
      position: "relative",
      transform: { md: "translateX(-8px)" },
   },
   content: {
      maxWidth: { md: "70%" },
   },
   cta: {
      marginTop: 4,
      textTransform: "initial",
   },
   contentText: {
      whiteSpace: "pre-line",
   },
   name: {
      fontWeight: 600,
   },
   role: {},
}
const BlogTestimonial = ({ person, content }: EmbedProps<Testimonial>) => {
   return (
      <Card variant="outlined" sx={styles.root}>
         <CardMedia sx={styles.media} title={person?.photo?.alt}>
            <Box sx={styles.mediaWrapper}>
               <Image src={person.photo.url} layout="fill" objectFit="cover" />
            </Box>
         </CardMedia>
         <CardContent sx={styles.content}>
            <Typography gutterBottom variant={"body1"} sx={styles.contentText}>
               {content}
            </Typography>
            <Typography variant={"subtitle1"} sx={styles.name}>
               {person?.name}
            </Typography>
            <Typography variant={"subtitle2"} sx={styles.role}>
               {person?.role}
            </Typography>
         </CardContent>
      </Card>
   )
}

export default BlogTestimonial
