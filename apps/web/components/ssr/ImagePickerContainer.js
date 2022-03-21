import { window } from "global"

function ImagePickerContainer(props) {
   if (window) {
      var { ImagePicker } = require("react-file-picker")
      return <ImagePicker {...props} />
   } else {
      return (
         <div>
            <input type="file" style={{ display: "none" }} />
            {/* <button className='ui primary button'><i aria-hidden='true' className='upload icon'/>Upload Slides [.pdf]</button> */}
            {props.children}
         </div>
      )
   }
}

export default ImagePickerContainer
