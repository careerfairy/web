import { Rating, Typography } from "@mui/material"
import Box from "@mui/material/Box"
import { sxStyles } from "../../../types/commonTypes"

type Props = {
   title: string
   content: string
   rating: number
}

const styles = sxStyles({
   stars: {
      color: (theme) => theme.palette.primary.main,
   },
})

const Testimonial = ({ title, content, rating }: Props): JSX.Element => {
   return (
      <Box paddingY={6} marginX={{ xs: 4, md: 10, lg: 36, xl: 62 }}>
         <Typography variant="h3">{title}</Typography>
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
   )
}

export default Testimonial
