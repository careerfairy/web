import FileUploader, {
   FileUploaderProps,
} from "components/views/common/FileUploader"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      px: 1.75,
      py: 2,
   },
})

type Props = {
   dragActive: boolean
} & FileUploaderProps

export const PDFUpload = ({ dragActive, ...props }: Props) => {
   return (
      <FileUploader {...props} sx={styles.root}>
         <>{dragActive ? "Drop the file here" : "Upload PDF"}</>
      </FileUploader>
   )
}
