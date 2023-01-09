import React, { useCallback, useMemo } from "react"

type ReturnType = {
   anchorEl: HTMLElement
   handleClick: (event: React.MouseEvent<HTMLElement>) => void
   handleClose: () => void
   open: boolean
}
const useMenuState = (): ReturnType => {
   const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

   const open = Boolean(anchorEl)

   const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget)
   }, [])

   const handleClose = useCallback(() => {
      setAnchorEl(null)
   }, [])

   return useMemo(
      () => ({ anchorEl, open, handleClick, handleClose }),
      [anchorEl, open, handleClick, handleClose]
   )
}

export default useMenuState
