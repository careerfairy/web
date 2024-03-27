import { Typography } from "@mui/material"

const LoadErrorMessage = ({ label }) => {
   return (
      <Typography variant="subtitle1" color="#FE9B0E">
         Ups! Something went wrong. <br />
         Unable to load {label}. Try to refresh the page.
      </Typography>
   )
}

export default LoadErrorMessage
