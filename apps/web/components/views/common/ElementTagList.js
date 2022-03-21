import { Fragment } from "react"

function ElementTagList(props) {
   let colors = [
      "rgb(245, 146, 49)",
      "rgb(51, 172, 224)",
      "rgb(252, 41, 129)",
      "rgb(64, 180, 79)",
      "rgb(0,250,154)",
      "rgb(0,206,209)",
      "rgb(145,145,145)",
   ]
   let list = props.fields

   let tags = list.map((listElement, index) => {
      return (
         <div key={index}>
            <div
               className="tag"
               key={listElement}
               style={{
                  backgroundColor: colors[index % colors.length],
                  color: "white",
               }}
            >
               {listElement}
            </div>
            <style jsx>{`
               .tag {
                  display: inline-block;
                  border-radius: 12px;
                  background-color: rgba(0, 0, 0, 0);
                  padding: 2px 10px;
                  margin-right: 5px;
                  margin-bottom: 5px;
                  font-size: 0.8em;
                  font-weight: 500;
               }
            `}</style>
         </div>
      )
   })

   return (
      <Fragment>
         <div className="tag-container">{tags}</div>
         <style jsx>{`
            .tag-container {
               margin-top: 10px;
            }
         `}</style>
      </Fragment>
   )
}

export default ElementTagList
