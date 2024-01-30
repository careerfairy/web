import ReactQuill, {ReactQuillProps} from 'react-quill';
// import 'react-quill/dist/quill.bubble.css';
import 'react-quill/dist/quill.snow.css';

import {forwardRef} from "react"; // import the styles

type Props = ReactQuillProps & {
    setFieldValue: (field: string, name: string) => void
    name: string
}

// eslint-disable-next-line react/display-name
const CustomRichTextEditorRef = forwardRef<ReactQuill, Props>(
    (props, ref) => {
        const { setFieldValue, name } = props

        return (
            <ReactQuill
            {...props}
            // theme="bubble"
            onChange={(values) => setFieldValue(name, values)}
            modules={modules}
            ref={ref}
            />
        )
});

/*const CustomRichTextEditor: FC<ReactQuillProps> = ({children, ...props}) => {
    console.log(props)

    return (
        <ReactQuill
            {...props}
            theme="bubble"
            modules={modules}
        >
            {children}
        </ReactQuill>
    )
}*/

// set some default props because we don't want all the features enabled
const modules = {
    toolbar: [
        [{'header': [1, 2, false]}],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
        ['link', 'image'],
        ['clean']
    ],
}

export default CustomRichTextEditorRef