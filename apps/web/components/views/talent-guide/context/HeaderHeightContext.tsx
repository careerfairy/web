import { createContext, useCallback, useEffect, useRef, useState } from "react"

export const HeaderHeightContext = createContext<number>(0)

export const useMeasureHeaderHeight = () => {
   const [height, setHeight] = useState(0)
   const ref = useRef<HTMLDivElement>(null)
   const prevHeight = useRef(height)

   const measureHeight = useCallback(() => {
      if (ref.current) {
         const newHeight = ref.current.offsetHeight
         if (prevHeight.current !== newHeight) {
            prevHeight.current = newHeight
            setHeight(newHeight)
         }
      }
   }, [])

   useEffect(() => {
      const element = ref.current
      if (!element) return

      measureHeight() // Initial measurement

      const resizeObserver = new ResizeObserver(() => {
         measureHeight()
      })

      resizeObserver.observe(element)

      return () => {
         resizeObserver.disconnect()
      }
   }, [measureHeight])

   return { ref, height }
}

export const HeaderHeightProvider = ({
   children,
}: {
   children: React.ReactNode
}) => {
   const { height } = useMeasureHeaderHeight()
   return (
      <HeaderHeightContext.Provider value={height}>
         {children}
      </HeaderHeightContext.Provider>
   )
}
