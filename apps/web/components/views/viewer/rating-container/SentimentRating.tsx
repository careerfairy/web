import React, { useState } from "react"
import Stack from "@mui/material/Stack"
import Rating, { RatingProps } from "@mui/material/Rating"
import { FormHelperText, IconContainerProps } from "@mui/material"
import Box from "@mui/material/Box"
import { StylesProps } from "../../../../types/commonTypes"
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied"
import SentimentNeutralIcon from "@mui/icons-material/SentimentNeutral"
import SentimentVerySatisfiedIcon from "@mui/icons-material/SentimentVerySatisfied"
import Typography from "@mui/material/Typography"

const styles: StylesProps = {
   sentimentRating: {
      "& .MuiRating-iconEmpty .MuiSvgIcon-root": (theme) => ({
         color: theme.palette.action.disabled,
      }),
   },
}

const customIcons: {
   [index: string]: {
      icon: React.ReactElement
      label: string
   }
} = {
   1: {
      icon: <SentimentDissatisfiedIcon color="error" />,
      label: "No",
   },
   2: {
      icon: <SentimentNeutralIcon color="warning" />,
      label: "Not sure",
   },
   3: {
      icon: <SentimentVerySatisfiedIcon color="success" />,
      label: "Yes",
   },
}

const getLabelText = (value: number) =>
   `${value} Star${value !== 1 ? "s" : ""}, ${customIcons?.[value]?.label}`

const IconContainer = (props: IconContainerProps) => {
   const { value, ...other } = props
   return <span {...other}>{customIcons?.[value]?.icon}</span>
}

interface Props extends RatingProps {
   error?: string
   hideLabel?: boolean
}

const SentimentRating = ({
   error,
   readOnly,
   onChange,
   value,
   name,
   highlightSelectedOnly = true,
   hideLabel = false,
   ...rest
}: Props) => {
   const [hover, setHover] = useState(-1)
   const key = hover !== -1 ? hover : value
   const label = customIcons?.[key]?.label
   return (
      <Stack spacing={2} alignItems="center" direction="row">
         <Box>
            <Rating
               name={name}
               value={Number(value)}
               readOnly={readOnly}
               size="large"
               sx={highlightSelectedOnly && styles.sentimentRating}
               highlightSelectedOnly={highlightSelectedOnly}
               IconContainerComponent={IconContainer}
               getLabelText={getLabelText}
               max={3}
               onChangeActive={(event, newHover) => {
                  setHover(newHover)
               }}
               onChange={onChange}
               {...rest}
            />
            <FormHelperText>{error}</FormHelperText>
         </Box>
         {!hideLabel && (
            <Typography sx={{ ml: 2, minWidth: 65 }}>{label || ""}</Typography>
         )}
      </Stack>
   )
}

export default SentimentRating
