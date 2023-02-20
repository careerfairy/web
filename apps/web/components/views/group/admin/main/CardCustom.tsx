import {
   Card,
   CardHeader,
   CardContent,
   Button,
   Menu,
   MenuItem,
} from "@mui/material"
import { Options } from "@sentry/types"
import { useState, useCallback, useMemo } from "react"
import { ChevronDown } from "react-feather"
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
   cardContent: {
      paddingX: (theme) => theme.spacing(3),
      paddingTop: 0,
   },
   cardHeader: {
      paddingX: (theme) => theme.spacing(3),
      paddingBottom: (theme) => theme.spacing(1),
   },
})

type Props = {
   title: string
   children: React.ReactNode
   options?: OptionsProps["options"]
   optionsHandler?: OptionsProps["handler"]
   minHeight?: string
}

/**
 * Card to be used on the Admin pages
 */
const CardCustom = ({
   title,
   options,
   optionsHandler,
   children,
   minHeight,
}: Props) => {
   const sxProps = useMemo(() => {
      return minHeight
         ? {
              minHeight,
           }
         : undefined
   }, [minHeight])

   return (
      <Card sx={sxProps}>
         <CardHeader
            sx={styles.cardHeader}
            title={title}
            action={
               options ? (
                  <Options
                     options={options}
                     handler={optionsHandler ? optionsHandler : undefined}
                  />
               ) : undefined
            }
            titleTypographyProps={styles.cardTitleTypographyProps}
         />
         <CardContent sx={styles.cardContent}>{children}</CardContent>
      </Card>
   )
}

export type OptionsProps = {
   options: string[]
   handler?: (option: string) => void
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
            handler?.(option)
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
            anchorOrigin={anchorOrigin}
            transformOrigin={transformOrigin}
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

const anchorOrigin = {
   vertical: "bottom",
   horizontal: "right",
} as const

const transformOrigin = {
   vertical: "top",
   horizontal: "right",
} as const

export default CardCustom
