import { Rating, Typography } from "@mui/material"
import Box from "@mui/material/Box"
import { sxStyles } from "../../../types/commonTypes"
import { quoteBackgroundLightPink } from "../../../constants/images"

type Props = {
   title: string
   content: string
   rating: number
}

const styles = sxStyles({
   stars: {
      color: (theme) => theme.palette.primary.main,
   },
   wrapper: {
      paddingTop: 10,
      maxWidth: { xs: "80vw", md: "60vw", lg: "50vw", xl: "30vw" },
      height: "fit-content",
   },
   background: {
      height: "60vh",
      background: `url(${quoteBackgroundLightPink}) no-repeat`,
      backgroundSize: "110vh",
      backgroundPosition: "center",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
   },
})

const Testimonial = ({ title, content, rating }: Props): JSX.Element => {
   return (
      <Box sx={styles.background}>
         <Box sx={styles.wrapper}>
            <Typography variant="h2">{title}</Typography>
            {content && (
               <Typography variant="body1" marginY={3}>
                  {content}
               </Typography>
            )}
            {rating && (
               <Box display={"flex"}>
                  <Rating
                     readOnly
                     name={"testimonial-rating"}
                     value={Number(rating)}
                     precision={0.5}
                     size="large"
                     sx={styles.stars}
                  />
                  <Typography variant="h5" ml={1} alignSelf="flex-end">
                     {rating}
                  </Typography>
               </Box>
            )}
         </Box>
      </Box>
   )
}

export default Testimonial
