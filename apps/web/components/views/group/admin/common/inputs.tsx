import { styled } from "@mui/material/styles"
import {
   Box,
   Checkbox,
   CheckboxProps,
   TextField,
   Typography,
} from "@mui/material"
import MenuItem, { menuItemClasses } from "@mui/material/MenuItem"
import Rating, { RatingProps } from "@mui/material/Rating"
import CheckRoundedIcon from "@mui/icons-material/CheckRounded"
import React, { FC } from "react"
import { sxStyles } from "../../../../../types/commonTypes"
import StarRateRoundedIcon from "@mui/icons-material/StarRateRounded"
import Stack from "@mui/material/Stack"
import Skeleton from "@mui/material/Skeleton"

const styles = sxStyles({
   checkboxIconWrapper: {
      width: 20,
      height: 20,
      borderRadius: 1,
      bgcolor: "tertiary.main",
      color: "black",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
   },
   stars: {
      color: "secondary.main",
   },
   feedbacksHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
   },
   rating: {
      mt: "-6px !important",
      ml: "-3px !important",
   },
})

export const StyledTextField: typeof TextField = styled(TextField)(
   ({ theme }) => ({
      "& .MuiOutlinedInput-root": {
         "& fieldset": {
            borderColor: "transparent !important",
         },
      },
      "& input": {
         "&::placeholder": {
            color: theme.palette.text.primary,
            opacity: 1,
         },
      },
      "& .MuiOutlinedInput-root.Mui-disabled": {
         "& fieldset": {
            borderColor: "transparent",
         },
      },
      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
         borderColor: "transparent",
      },
   })
) as typeof TextField // https://mui.com/material-ui/guides/typescript/#complications-with-the-component-prop

export const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
   [theme.breakpoints.down("sm")]: {
      minWidth: "auto !important",
   },
   [`&.${menuItemClasses.selected}`]: {
      backgroundColor: "transparent",
   },
   "&:hover": {
      backgroundColor: theme.palette.action.hover + " !important",
   },
   [`&.${menuItemClasses.focusVisible}`]: {
      backgroundColor: theme.palette.action.hover + " !important",
   },
})) as unknown as typeof MenuItem

export const StyledCheckbox = (
   props: Omit<CheckboxProps, "color" | "icon" | "checkedIcon">
) => {
   return (
      <Checkbox
         {...props}
         color={"default"}
         icon={<Box sx={styles.checkboxIconWrapper} />}
         checkedIcon={
            <Box sx={styles.checkboxIconWrapper}>
               <CheckRoundedIcon fontSize={"small"} />
            </Box>
         }
      />
   )
}

export const StyledRating: FC<RatingProps> = ({
   sx,
   value,
   size,
   color,
   ...rest
}) => {
   return (
      <Rating
         name="read-only"
         value={value}
         precision={0.5}
         sx={[
            styles.stars,
            {
               color: color || "secondary.main",
            },
            ...(Array.isArray(sx) ? sx : [sx]),
         ]}
         icon={<StarRateRoundedIcon fontSize={size} />}
         emptyIcon={<StarRateRoundedIcon fontSize={size} />}
         size={size}
         readOnly
         {...rest}
      />
   )
}

type RatingWithLabelProps = {
   average: number
   numberOfRatings: number
   color?: string
   size?: "small" | "medium" | "large"
}
export const RatingWithLabel: FC<RatingWithLabelProps> = ({
   average,
   numberOfRatings,
   color,
   size,
}) => {
   return (
      <Stack
         justifyContent="space-between"
         color={color}
         direction="row"
         alignItems="center"
         spacing={1}
      >
         <StyledRating
            color={color}
            sx={styles.rating}
            size={size}
            value={average}
         />
         <Typography
            sx={styles.feedbacksHeader}
            textAlign="center"
            color={color}
            variant="body1"
            whiteSpace={"nowrap"}
         >
            {numberOfRatings} reviews
         </Typography>
      </Stack>
   )
}

type RatingWithLabelSkeletonProps = {
   size?: "small" | "medium" | "large"
}
export const RatingWithLabelSkeleton: FC<RatingWithLabelSkeletonProps> = ({
   size,
}) => {
   return (
      <Stack direction="row" alignItems="center" spacing={1}>
         <StyledRating
            size={size}
            color={"grey.500"}
            value={5}
            readOnly
            disabled
         />
         <Typography
            sx={styles.feedbacksHeader}
            textAlign="center"
            variant="body1"
         >
            <Skeleton width={100} />
         </Typography>
      </Stack>
   )
}
