import BrandedTextField from "components/views/common/inputs/BrandedTextField"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { MenuItem } from "@mui/material"
import { SelectProps } from "@mui/material/Select"
import { useLocalTracks } from "../../context"
import { sxStyles } from "types/commonTypes"
import { getRTCErrorCode } from "../../util"

const styles = sxStyles({
   root: {
      maxWidth: "100%",
      "& .MuiSelect-select": {},
   },
})
type DeviceSelectProps = SelectProps & {
   label: string
   options: MediaDeviceInfo[]
   onDeviceSelect: (deviceId: string) => void
   value: string
   permissionDenied: boolean
}

const getValue = (value: string, options: MediaDeviceInfo[]) =>
   options.find((op) => op.deviceId === value)?.deviceId ?? ""

const DeviceSelect = ({
   label,
   options,
   onDeviceSelect,
   value,
   permissionDenied,
   ...props
}: DeviceSelectProps) => {
   return (
      <BrandedTextField
         id={`select-${label.toLowerCase()}`}
         select={true}
         label={permissionDenied ? `Permission needed` : label}
         disabled={permissionDenied}
         sx={styles.root}
         InputLabelProps={{
            shrink: !permissionDenied,
         }}
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
}

export const CameraSelect = () => {
   const { setActiveCameraId, activeCameraId, cameraError, cameraDevices } =
      useLocalTracks()

   return (
      <DeviceSelect
         key={cameraDevices.length}
         label="Camera"
         options={cameraDevices}
         onDeviceSelect={setActiveCameraId}
         value={activeCameraId}
         permissionDenied={getRTCErrorCode(cameraError) === "PERMISSION_DENIED"}
      />
   )
}

export const MicrophoneSelect = () => {
   const {
      setActiveMicrophoneId,
      activeMicrophoneId,
      microphoneError: micError,
      microphoneDevices: micDevices,
   } = useLocalTracks()

   return (
      <DeviceSelect
         label="Microphone"
         options={micDevices}
         onDeviceSelect={setActiveMicrophoneId}
         value={activeMicrophoneId}
         permissionDenied={getRTCErrorCode(micError) === "PERMISSION_DENIED"}
      />
   )
}
