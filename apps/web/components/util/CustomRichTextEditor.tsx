import ReactQuill, {ReactQuillProps} from 'react-quill';
import 'react-quill/dist/quill.bubble.css';
import {forwardRef} from "react"; // import the styles


// eslint-disable-next-line react/display-name
const CustomRichTextEditorRef = forwardRef<ReactQuill, ReactQuillProps>(
    (props, ref) => {
        return (
            <ReactQuill
                {...props}
                theme="bubble"
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