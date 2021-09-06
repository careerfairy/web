function MulitLineText({ text = "" }) {
   let textElements = text.split("//n").map((textElement, index) => {
      return (
         <div key={index} style={{ margin: "15px 0" }}>
            {textElement}
         </div>
      );
   });

   return <div>{textElements}</div>;
}

export default MulitLineText;
