import { Button, SxProps, Typography } from "@mui/material"
import { FC } from "react"
import { Upload } from "react-feather"

type Props = {
   sx: SxProps
}

const CompanyBannerDefaultLabel: FC<Props> = ({ sx }) => {
   return (
      <>
         <Typography>Recommended size: 2880x576px</Typography>
         <Button sx={sx} className="mute">
            <Typography variant="body1">Upload picture</Typography>
            <Upload />
         </Button>
      </>
   )
}

export default CompanyBannerDefaultLabel
