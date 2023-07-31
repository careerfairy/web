import { Collapse, Stack, Typography } from "@mui/material"
import { FC } from "react"
import { EyeOff as HiddenIcon } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      color: "white",
      width: "100%",
      background: "rgba(58, 58, 58, 0.80)",
      fontSize: "0.85714rem",
      py: 1,
      "& svg": {
         width: "1em",
         height: "1em",
      },
   },
   hiddenText: {
      fontSize: "0.85714rem",
      lineHeight: "117.5%",
      letterSpacing: "-0.03121rem",
   },
   collapsed: {
      zIndex: 1,
   },
})

type Props = {
   sparkPublished: boolean
}

const HiddenStatus: FC<Props> = ({ sparkPublished }) => {
   return (
      <Collapse sx={styles.collapsed} in={!sparkPublished}>
         <Stack
            spacing={0.5625}
            justifyContent="center"
            alignItems="center"
            direction="row"
            sx={styles.root}
         >
            <HiddenIcon />
            <Typography sx={styles.hiddenText}>Hidden Spark</Typography>
         </Stack>
      </Collapse>
   )
}

export default HiddenStatus
