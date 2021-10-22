import React, { useState, useEffect, useRef, Fragment } from "react";
import { CSVLink } from "react-csv";
import { Button } from "@material-ui/core";
import axios from "axios";
import PropTypes from "prop-types";
import StatsUtil from "../../../data/util/StatsUtil";

const CsvActionButton = ({
   url,
   children,
   disable,
   label,
   filename,
   transform,
   separator = ";",
   classes,
   group,
}) => {
   const [csvData, setCsvData] = useState([]);
   const csvInstance = useRef();

   const asyncExportMethod = () =>
      axios(url, {
         method: "GET",
      })
         .then((response) => {
            let data = response.data;
            if (transform) {
               data = transform(response.data);
            }
            setCsvData(data);
         })
         .catch((error) => console.log(error));

   useEffect(() => {
      if (
         csvData &&
         csvInstance &&
         csvInstance.current &&
         csvInstance.current.link
      ) {
         setTimeout(() => {
            csvInstance.current.link.click();
            setCsvData([]);
         });
      }
   }, [csvData]);

   useEffect(() => {
      if (registeredStudents && registeredStudents.length) {
         let newRegisteredStudentsFromGroup = [];
         if (group.universityCode) {
            newRegisteredStudentsFromGroup = registeredStudents
               .filter((student) => studentBelongsToGroup(student))
               .map((filteredStudent) =>
                  StatsUtil.getStudentInGroupDataObject(filteredStudent, group)
               );
         } else {
            const livestreamGroups = allGroups.filter((group) =>
               livestream.groupIds.includes(group.id)
            );
            newRegisteredStudentsFromGroup = registeredStudents.map(
               (student) => {
                  const livestreamGroupUserBelongsTo = StatsUtil.getFirstGroupThatUserBelongsTo(
                     student,
                     livestreamGroups,
                     group
                  );
                  return StatsUtil.getStudentInGroupDataObject(
                     student,
                     livestreamGroupUserBelongsTo || {}
                  );
               }
            );
         }
         setRegisteredStudentsFromGroup(newRegisteredStudentsFromGroup);
      }
   }, [registeredStudents]);

   return (
      <Fragment>
         <div
            onClick={() => {
               if (disable) return;
               asyncExportMethod();
            }}
         >
            {label ? (
               <Button
                  component="span"
                  color="primary"
                  variant="outlined"
                  className={classes.linkButton}
               >
                  {label}
               </Button>
            ) : (
               children
            )}
         </div>
         {csvData.length > 0 ? (
            <CSVLink
               data={csvData}
               separator={separator}
               filename={filename || "export.csv"}
               ref={csvInstance}
            />
         ) : undefined}
      </Fragment>
   );
};

CsvActionButton.propTypes = {
   children: PropTypes.node,
   classes: PropTypes.string,
   disable: PropTypes.bool,
   filename: PropTypes.string,
   label: PropTypes.string,
   separator: PropTypes.string,
   transform: PropTypes.any,
   url: PropTypes.string,
};
export default CsvActionButton;
