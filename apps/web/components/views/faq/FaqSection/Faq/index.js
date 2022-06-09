import React from "react"
import FaqItem from "./FaqItem"
import makeStyles from "@mui/styles/makeStyles"

const useStyles = makeStyles((theme) => ({
   root: {
      display: "flex",
   },
}))

function Faq(props) {
   const classes = useStyles()
   return (
      <div className={classes.root}>
         <div>
            {props.items.map((item, index) => (
               <FaqItem
                  question={item.question}
                  answer={item.answer}
                  href={item.href}
                  key={index}
               />
            ))}
         </div>
      </div>
   )
}

export default Faq
