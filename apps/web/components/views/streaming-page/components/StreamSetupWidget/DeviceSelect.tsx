import { useCameras, useMicrophones } from "components/custom-hook/streaming"
import BrandedTextField from "components/views/common/inputs/BrandedTextField"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { MenuItem } from "@mui/material"
import { SelectProps } from "@mui/material/Select"
import { useLocalTracks } from "../../context"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      "& .MuiSelect-select": {
         maxWidth: 150,
      },
   },
})
type DeviceSelectProps = SelectProps & {
   label: string
   options: MediaDeviceInfo[]
   onDeviceSelect: (deviceId: string) => void
   value: string
}

const getValue = (value: string, options: MediaDeviceInfo[]) =>
   options.find((op) => op.deviceId === value)?.deviceId ?? ""

const DeviceSelect = ({
   label,
   options,
   onDeviceSelect,
   value,
   ...props
}: DeviceSelectProps) => (
   <BrandedTextField
      id={`select-${label.toLowerCase()}`}
      select={true}
      label={label}
      sx={styles.root}
      fullWidth
      size="medium"
      value={getValue(value, options)}
      SelectProps={{
         IconComponent: () => <ExpandMoreIcon />,
      }}
      // @ts-ignore
      onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
         return onDeviceSelect(event.target.value as string)
      }}
      {...props}
   >
      {options.map((option) => (
         <MenuItem key={option.deviceId} value={option.deviceId}>
            {option.label}
         </MenuItem>
      ))}
   </BrandedTextField>
)

export const CameraSelect = () => {
   const { cameraOn, setActiveCameraId, activeCameraId } = useLocalTracks()

   const { data: cameraDevices } = useCameras()

   return (
      <DeviceSelect
         key={cameraDevices.length}
         label="Camera"
         options={cameraDevices}
         onDeviceSelect={setActiveCameraId}
         disabled={!cameraOn}
         value={activeCameraId}
      />
   )
}

export const MicrophoneSelect = () => {
   const {
      micOn: microphoneOn,
      setActiveMicrophoneId,
      activeMicrophoneId,
   } = useLocalTracks()

   const { data: microphoneDevices } = useMicrophones()

   return (
      <DeviceSelect
         label="Microphone"
         options={microphoneDevices}
         onDeviceSelect={setActiveMicrophoneId}
         disabled={!microphoneOn}
         value={activeMicrophoneId}
      />
   )
}
