import {
   Button,
   Card,
   CardContent,
   CardHeader,
   Menu,
   MenuItem,
   Stack,
   Box,
   Paper,
   Table,
   TableBody,
   TableCell,
   TableContainer,
   TableRow,
   Rating,
   Link,
} from "@mui/material"
import StarRateRoundedIcon from "@mui/icons-material/StarRateRounded"
import { ChevronDown, ExternalLink } from "react-feather"
import { useCallback, useState } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   dropdownButton: {
      color: "black",
      textTransform: "none",
      paddingRight: (theme) => theme.spacing(2),
   },
   cardTitleTypographyProps: {
      fontWeight: 500,
   },
   tableBody: {
      ".MuiTableCell-root": {
         borderBottom: "1px solid #EDE7FD",
      },
   },
   tableRow: {
      "&:last-child td, &:last-child th": { border: 0 },
   },
   stars: {
      color: (theme) => theme.palette.primary.main,
   },
   rowTitle: {
      fontWeight: 500,
      fontSize: "1rem",
      marginLeft: (theme) => theme.spacing(2),
      paddingLeft: 0,
   },
   cardContent: {
      paddingX: (theme) => theme.spacing(3),
      paddingTop: 0,
   },
   cardHeader: {
      paddingX: (theme) => theme.spacing(3),
      paddingBottom: (theme) => theme.spacing(1),
   },
})

const AggregatedFeedbackCard = () => {
   return (
      <Card>
         <CardHeader
            sx={styles.cardHeader}
            title="Live Stream Feedback"
            action={
               <Options options={["Latest", "Oldest"]} handler={() => {}} />
            }
            titleTypographyProps={styles.cardTitleTypographyProps}
         />
         <CardContent sx={styles.cardContent}>
            <FeedbackCardContent />
         </CardContent>
      </Card>
   )
}

const FeedbackCardContent = () => {
   const data = [
      {
         title: "Psychology of Learning – The Basis Session",
         rating: 4.5,
      },
      {
         title: "Open House @ Voith | Automation Engineering - An Electrifying Profession",
         rating: 3.1,
      },
      {
         title: "Psychology of Learning – The Basis Session 2",
         rating: 1,
      },
   ]
   return (
      <Box>
         <TableContainer>
            <Table>
               <TableBody sx={styles.tableBody}>
                  {data.map((row) => (
                     <TableRow key={row.title} sx={styles.tableRow}>
                        <TableCell
                           component="th"
                           scope="row"
                           sx={styles.rowTitle}
                        >
                           {row.title}
                        </TableCell>
                        <TableCell align="right">
                           <Rating
                              name="read-only"
                              value={row.rating}
                              precision={0.5}
                              sx={styles.stars}
                              icon={<StarRateRoundedIcon />}
                              emptyIcon={<StarRateRoundedIcon />}
                              readOnly
                           />
                        </TableCell>
                        <TableCell align="right" sx={{ paddingRight: 0 }}>
                           <Link href="#" underline="none" color="secondary">
                              <ExternalLink width="20" />
                           </Link>
                        </TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </TableContainer>
      </Box>
   )
}

const LivestreamFeedbackEntry = () => {
   return <Box></Box>
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

   const handleSelect = useCallback(
      (option: string) => {
         return () => {
            handler(option)
            setSelected(option)
            handleClose()
         }
      },
      [handleClose, handler]
   )

   return (
      <div>
         <Button
            aria-controls={open ? "basic-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            onClick={handleClick}
            endIcon={<ChevronDown width="16" height={16} />}
            disableRipple={true}
            sx={styles.dropdownButton}
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
               <MenuItem key={option} onClick={handleSelect(option)}>
                  {option}
               </MenuItem>
            ))}
         </Menu>
      </div>
   )
}

export default AggregatedFeedbackCard
