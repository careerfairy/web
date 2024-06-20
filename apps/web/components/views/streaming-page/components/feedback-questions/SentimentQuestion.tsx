import { IconContainerProps } from "@mui/material"
import Box from "@mui/material/Box"
import Rating, { RatingProps } from "@mui/material/Rating"
import Typography from "@mui/material/Typography"
import Image, { ImageProps } from "next/image"
import React from "react"
import { StylesProps } from "types/commonTypes"

const styles: StylesProps = {
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
      "& .MuiRating-icon": (theme) => ({
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
         color: theme.palette.neutral[600],
         background: theme.brand.black[400],
      }),
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
}

const Icon = ({ src, alt }: ImageProps) => {
   return <Image src={src} alt={alt} width={23} height={23} quality={100} />
}

const customIcons: {
   [index: number]: {
      icon: React.ReactElement
   }
} = {
   1: {
      icon: <Icon src="/emojis/sad1.png" alt="not happy" />,
   },
   2: {
      icon: <Icon src="/emojis/sad2.png" alt="not happy" />,
   },
   3: {
      icon: <Icon src="/emojis/neutral.png" alt="neutral" />,
   },
   4: {
      icon: <Icon src="/emojis/happy2.png" alt="happy" />,
   },
   5: {
      icon: <Icon src="/emojis/happy1.png" alt="very happy" />,
   },
}

const SentimentQuestion = ({
   readOnly,
   onChange,
   value,
   name,
   ...rest
}: RatingProps) => {
   return (
      <Box sx={styles.ratingWrapper}>
         <Rating
            name={name}
            value={Number(value)}
            readOnly={readOnly}
            size="large"
            IconContainerComponent={IconContainer}
            max={5}
            onChange={onChange}
            {...rest}
         />
         <Box sx={styles.subText}>
            <Typography variant="small">Not happy</Typography>
            <Typography variant="small">Very happy</Typography>
         </Box>
      </Box>
   )
}

const IconContainer = (props: IconContainerProps) => {
   const { value, ...other } = props
   return <span {...other}>{customIcons?.[value]?.icon}</span>
}

export default SentimentQuestion
