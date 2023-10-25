import React from "react"
import Card from "@mui/material/Card"
import CardMedia from "@mui/material/CardMedia"
import Box from "@mui/material/Box"
import Image from "next/legacy/image"
import CardContent from "@mui/material/CardContent"
import Typography from "@mui/material/Typography"
import { CompanyCaseStudyPreview } from "../../../types/cmsTypes"
import Link from "next/link"
import { GraphCMSImageLoader } from "../../cms/util"

interface Props {
   caseStudyPreview: CompanyCaseStudyPreview
}
const borderRadius = 3
const styles = {
   root: {
      maxWidth: 500,
      background: "transparent",
      cursor: "pointer",
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
      height: 0,
      paddingBottom: "62%",
      borderRadius,
      backgroundColor: "#fff",
      position: "relative",
   },
   content: {
      padding: 4,
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
const CaseStudyCard = ({ caseStudyPreview }: Props) => {
   return (
      <Link href={`/companies/customers/${caseStudyPreview.slug}`}>
         <Card elevation={0} sx={styles.root}>
            <CardMedia sx={styles.media} title={caseStudyPreview.company.name}>
               <Box sx={styles.mediaWrapper}>
                  <Image
                     src={caseStudyPreview.coverImage.url}
                     layout="fill"
                     objectFit="cover"
                     loader={GraphCMSImageLoader}
                  />
               </Box>
            </CardMedia>
            <CardContent>
               <Typography
                  gutterBottom
                  variant={"subtitle1"}
                  color={"text.secondary"}
                  sx={styles.contentText}
               >
                  {caseStudyPreview.company.name}
               </Typography>
               <Typography variant={"h6"} sx={styles.name}>
                  {caseStudyPreview.title}
               </Typography>
            </CardContent>
         </Card>
      </Link>
   )
}

export default CaseStudyCard
