import React, { useState, useEffect } from "react"
import { Grid, makeStyles, Select, MenuItem, FormControl, InputLabel, IconButton } from "@material-ui/core"
import DeleteIcon from "@material-ui/icons/Delete"
import AddIcon from "@material-ui/icons/Add"
import Event from "../../utils/EventClass"

const useStyles = makeStyles((theme) => ({
  root: {},
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  button: {
    marginTop: theme.spacing(2),
  },
}))

const daySelection = [
  { value: "everyday", label: "Everyday" },
  { value: "workingDays", label: "Working Days (Mon - Fri)" },
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wedsneday", label: "Wedsneday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
]

export default function CreateEventElement({ item, onAdd, onRemove, hideDelete, hasErrors, error }) {
  const classes = useStyles()

  const [eventData, setEventData] = useState(item)

  const onEventAdd = () => onAdd(eventData)

  useEffect(() => {
    console.log(item)
    setEventData(item)
  }, [item])

  return eventData ? (
    <Grid className={classes.root} container direction="row" justify="center" alignItems="center">
      <FormControl className={classes.formControl}>
        <InputLabel>Day Selection</InputLabel>
        <Select
          value={eventData.day}
          onChange={(event) => setEventData({ ...eventData, day: event.target.value })}
          error={error === Event.EMPTY_VALUE || error === Event.EMPTY_DAY}
        >
          {daySelection.map((day) => (
            <MenuItem value={day.value} key={day.value}>
              {day.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl className={classes.formControl}>
        <InputLabel>Starting Hour</InputLabel>
        <Select
          value={eventData.startingHour}
          onChange={(event) => setEventData({ ...eventData, startingHour: event.target.value })}
          error={
            error === Event.EMPTY_VALUE || error === Event.EMPTY_STARTING_HOUR || error === Event.START_GREATER_THAN_END
          }
        >
          {Array.from(Array(24).keys()).map((hour) => [
            <MenuItem value={`${String(hour).padStart(2, "0")}:00`} key={`from_${String(hour).padStart(2, "0")}:00`}>
              {String(hour).padStart(2, "0")}:00
            </MenuItem>,
            <MenuItem value={`${String(hour).padStart(2, "0")}:30`} key={`from_${String(hour).padStart(2, "0")}:30`}>
              {String(hour).padStart(2, "0")}:30
            </MenuItem>,
          ])}
        </Select>
      </FormControl>
      <FormControl className={classes.formControl}>
        <InputLabel>Ending Hour</InputLabel>
        <Select
          value={eventData.endingHour}
          onChange={(event) => setEventData({ ...eventData, endingHour: event.target.value })}
          error={
            error === Event.EMPTY_VALUE || error === Event.EMPTY_ENDING_HOUR || error === Event.END_LOWER_THAN_START
          }
        >
          {Array.from(Array(24).keys()).map((hour) => [
            <MenuItem value={`${String(hour).padStart(2, "0")}:00`} key={`to_${String(hour).padStart(2, "0")}:00`}>
              {String(hour).padStart(2, "0")}:00
            </MenuItem>,
            <MenuItem value={`${String(hour).padStart(2, "0")}:30`} key={`to_${String(hour).padStart(2, "0")}:30`}>
              {String(hour).padStart(2, "0")}:30
            </MenuItem>,
          ])}
        </Select>
      </FormControl>
      <IconButton aria-label="add" onClick={onEventAdd}>
        <AddIcon fontSize="small" className={classes.button} />
      </IconButton>

      <IconButton aria-label="delete" onClick={onRemove} disabled={hideDelete}>
        <DeleteIcon fontSize="small" className={classes.button} />
      </IconButton>
    </Grid>
  ) : (
    <div></div>
  )
}
