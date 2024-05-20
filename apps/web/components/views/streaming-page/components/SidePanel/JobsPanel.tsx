import { Briefcase } from "react-feather"
import { JobList } from "../jobs/JobList"
import { SidePanelView } from "./SidePanelView"

export const JobsPanel = () => {
   return (
      <SidePanelView
         id="jobs-panel"
         title="Available jobs"
         icon={<Briefcase />}
      >
         <JobList />
      </SidePanelView>
   )
}
