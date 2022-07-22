import React, { useState } from "react"
import {
   Box,
   Button,
   Card,
   CardContent,
   CardMedia,
   CircularProgress,
   Container,
   Typography,
} from "@mui/material"
import DisplayCategoryElement from "./DisplayCategoryElement"
import { sxStyles } from "../../../../types/commonTypes"
import { BaseGroupInfo } from "../../../../pages/group/create"
import { GroupQuestion } from "@careerfairy/shared-lib/dist/groups"

const styles = sxStyles({
   root: {
      paddingTop: "50px",
      paddingBottom: "50px",
   },
   title: {
      fontWeight: "300",
      color: "primary.main",
      fontSize: "calc(1.2em + 1.5vw)",
   },
   actions: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "space-between",
   },
   buttons: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: "15px",
   },
   media: {
      display: "flex",
      justifyContent: "center",
      padding: "1.5em 1em 1em 1em",
      height: "120px",
   },
   image: {
      objectFit: "contain",
      maxWidth: "80%",
   },
})

interface Props {
   handleBack: () => void
   baseGroupInfo: BaseGroupInfo
   createCareerCenter: () => Promise<void>
   groupQuestions: GroupQuestion[]
}

const CompleteGroup = ({
   handleBack,
   baseGroupInfo,
   createCareerCenter,
   groupQuestions,
}: Props) => {
   const [submitting, setSubmitting] = useState(false)

   const handleFinalize = async () => {
      setSubmitting(true)
      await createCareerCenter()
   }

   const categories = groupQuestions.map((category) => {
      return <DisplayCategoryElement key={category.id} category={category} />
   })

   return (
      <Container sx={styles.root}>
         <Typography align="center" sx={styles.title}>
            Last Check
         </Typography>
         <div>
            <Typography variant="h5" gutterBottom>
               Details:
            </Typography>
            <Card>
               <CardMedia sx={styles.media}>
                  <Box
                     component="img"
                     sx={styles.image}
                     alt={`${baseGroupInfo.universityName} logo`}
                     src={baseGroupInfo.logoUrl}
                  />
               </CardMedia>
               <CardContent>
                  <Typography gutterBottom variant="h5" component="h2">
                     {baseGroupInfo.universityName}
                  </Typography>
                  <Typography
                     variant="body2"
                     color="textSecondary"
                     component="p"
                  >
                     {baseGroupInfo.description}
                  </Typography>
               </CardContent>
            </Card>
            <Typography style={{ marginTop: 10 }} variant="h5" gutterBottom>
               Categories:
            </Typography>
            <div className="category-wrapper">{categories}</div>
            {categories.length === 0 && <Typography>No categories</Typography>}
            <Box sx={styles.actions}>
               <Typography gutterBottom align="center">
                  Are you satisfied?
               </Typography>
               <Box sx={styles.buttons}>
                  <Button
                     variant="contained"
                     size="large"
                     style={{ marginRight: 5 }}
                     onClick={handleBack}
                  >
                     Back
                  </Button>
                  <Button
                     onClick={handleFinalize}
                     color="primary"
                     style={{ marginLeft: 5 }}
                     disabled={submitting}
                     endIcon={
                        submitting && (
                           <CircularProgress size={20} color="inherit" />
                        )
                     }
                     variant="contained"
                     size="large"
                  >
                     Finish
                  </Button>
               </Box>
            </Box>
         </div>
      </Container>
   )
}

export default CompleteGroup
