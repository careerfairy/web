import { useEffect, useRef } from "react"

// A DEV only hook to track what props are causing a component to re-render
export default function useTraceUpdate(
   props: Record<string, unknown>,
   name?: string
) {
   const prev = useRef(props)
   useEffect(() => {
      const changedProps = Object.entries(props).reduce((ps, [k, v]) => {
         if (prev.current[k] !== v) {
            ps[k] = [prev.current[k], v]
         }
         return ps
      }, {})
      if (Object.keys(changedProps).length > 0) {
         console.log(
            `🚀 Changed props: ${name ? `${name} - ` : ""}`,
            changedProps
         )
      }
      prev.current = props
   })
}
