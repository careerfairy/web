import {
   Button,
   Card,
   CardContent,
   CardHeader,
   Menu,
   MenuItem,
} from "@mui/material"
import { ChevronDown } from "react-feather"
import { useCallback, useState } from "react"

const AggregatedFeedbackCard = () => {
   return (
      <Card>
         <CardHeader
            title="Live Stream Feedback"
            action={
               <Options
                  options={["Latest", "Highest Rating", "Lowest Rating"]}
                  handler={() => {}}
               />
            }
            titleTypographyProps={{ fontWeight: 500 }}
         />
         <CardContent>rows</CardContent>
      </Card>
   )
}

type OptionsProps = {
   options: string[]
   handler: (option: string) => void
}
const Options = ({ options, handler }: OptionsProps) => {
   const [anchorEl, setAnchorEl] = useState(null)
   const [selected, setSelected] = useState(options[0])
   const open = Boolean(anchorEl)

   const handleClick = useCallback((event) => {
      setAnchorEl(event.currentTarget)
   }, [])

   const handleClose = useCallback(() => {
      setAnchorEl(null)
   }, [])

   const handleSelect = useCallback((option: string) => {
      return () => {
         handler(option)
         setSelected(option)
         handleClose()
      }
   }, [])

   return (
      <div>
         <Button
            aria-controls={open ? "basic-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            onClick={handleClick}
            endIcon={<ChevronDown width="16" height={16} />}
            disableRipple={true}
            sx={{
               color: "black",
               textTransform: "none",
            }}
         >
            {selected}
         </Button>
         <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{
               vertical: "bottom",
               horizontal: "right",
            }}
            transformOrigin={{
               vertical: "top",
               horizontal: "right",
            }}
         >
            {options.map((option) => (
               <MenuItem onClick={handleSelect(option)}>{option}</MenuItem>
            ))}
         </Menu>
      </div>
   )
}

export default AggregatedFeedbackCard
