import { MouseEvent, useCallback, useMemo, useState } from "react"

type ReturnType = {
   anchorEl: HTMLElement
   handleClick: (event: MouseEvent<HTMLElement>) => void
   handleClose: () => void
   open: boolean
}
const useMenuState = (): ReturnType => {
   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

   const open = Boolean(anchorEl)

   const handleClick = useCallback((event: MouseEvent<HTMLElement>) => {
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
