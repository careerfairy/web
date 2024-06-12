import { Rating, Typography } from "@mui/material"
import Box from "@mui/material/Box"
import { IconContainerProps, RatingProps } from "@mui/material/Rating"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   ratingWrapper: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      alignSelf: "stretch",
      gap: "8px",
      "& .MuiRating-root": {
         display: "flex",
         alignItems: "flex-start",
         alignSelf: "stretch",
         gap: "12px",
      },
      "& .MuiRating-icon": {
         display: "flex",
         flexDirection: "column",
         justifyContent: "center",
         alignItems: "center",
         flex: "1 0 0",
         borderRadius: "4px",
         padding: "14px",
         alignSelf: "stretch",
         fontSize: "14px",
         lineHeight: "150%" /* 21px */,
         color: (theme) => theme.palette.neutral[600],
         background: (theme) => theme.brand.black[400],
      },
      "& .MuiRating-iconHover": {
         color: "white",
         background: (theme) => theme.palette.primary.main,
         transform: "none",
         transition: "none",
      },
      "& .MuiRating-label": {
         display: "none",
      },
      "& label": {
         display: "flex",
         flexDirection: "column",
         justifyContent: "center",
         alignItems: "center",
         flex: "1 0 0",
      },
   },
   subText: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      alignSelf: "stretch",
      color: (theme) => theme.palette.neutral[700],
      fontWeight: 400,
   },
})

const RatingQuestion = ({
   readOnly,
   onChange,
   value,
   name,
   ...props
}: RatingProps) => {
   return (
      <Box sx={styles.ratingWrapper}>
         <Rating
            name={name}
            value={Number(value)}
            size="large"
            readOnly={readOnly}
            max={5}
            onChange={onChange}
            IconContainerComponent={ButtonContainer}
            {...props}
         />
         <Box sx={styles.subText}>
            <Typography variant="small">Not satisfied</Typography>
            <Typography variant="small">Very satisfied</Typography>
         </Box>
      </Box>
   )
}

const ButtonContainer = ({ value, ...props }: IconContainerProps) => {
   return <span {...props}>{value}</span>
}

export default RatingQuestion
