import { Button } from "@mui/material"

export default function ClientFilePicker(props) {
   if (process.browser) {
      const { FilePicker } = require("react-file-picker")
      return (
         <FilePicker
            extensions={props.extensions}
            onChange={props.onChange}
            onError={props.onError}
         >
            <Button id="uploadButton">Upload Your CV</Button>
         </FilePicker>
      )
   } else {
      return (
         <div>
            <input type="file" style={{ display: "none" }} />
            <Button id="uploadButton">Upload Your CV</Button>
         </div>
      )
   }
}
