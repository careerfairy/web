import ScrollToBottom, {
   useScrollToBottom,
   useSticky,
} from "react-scroll-to-bottom"
import React, { useEffect } from "react"

const ScrollElements = ({ scrollItems }) => {
   const scrollToBottom = useScrollToBottom()
   const [sticky] = useSticky() //  In order for use sticky hook to work,
   useEffect(() => {
      //  the component must be the child of a scroll to bottom
      if (sticky) {
         scrollToBottom({ behavior: "auto" })
      }
   }, [scrollItems])

   return <React.Fragment>{scrollItems}</React.Fragment>
}

const CustomScrollToBottom = ({ scrollItems, ...props }) => {
   return (
      <ScrollToBottom {...props}>
         <ScrollElements scrollItems={scrollItems} />
      </ScrollToBottom>
   )
}

export default CustomScrollToBottom
