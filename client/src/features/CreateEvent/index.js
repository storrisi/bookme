import React, { useState } from "react"
import {
  AppBar,
  Button,
  Grid,
  makeStyles,
  TextField,
  Slider,
  Tooltip,
  Typography,
  Switch,
  FormControlLabel,
  Snackbar,
} from "@material-ui/core"
import moment from "moment"
import "moment-duration-format"
import CreateEventElement from "./CreateEventElement"
import Event from "../../utils/EventClass"
import MuiAlert from "@material-ui/lab/Alert"

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    height: "90vh",
  },
  appBar: {
    top: 0,
    background: "white",
  },
  saveButton: {
    width: 200,
    position: "absolute",
    right: 0,
    margin: 20,
  },
  slider: {
    width: 300,
  },
  label: {
    fontSize: "10px",
  },
  snackbar: {
    width: "100%",
    "& > * + *": {
      marginTop: theme.spacing(2),
    },
  },
}))

const emptyEvent = { day: "workingDays", startingHour: "08:00", endingHour: "18:00" }

function ValueLabelComponent(props) {
  const { children, open, value } = props

  return (
    <Tooltip open={open} enterTouchDelay={0} placement="top" title={value}>
      {children}
    </Tooltip>
  )
}

const DEFAULT_EVENT_NAME = ""
const DEFAULT_ALLOW_MAX_EVENTS = false
const DEFAULT_EVENT_DURATION = 60
const DEFAULT_MAX_EVENTS = 1
const DEFAULT_EVENTS = [{ ...emptyEvent }]

export default function CreateEvent() {
  const classes = useStyles()
  const [eventName, setEventName] = useState(DEFAULT_EVENT_NAME)
  const [allowMaxEventsPerDay, setAllowMaxEventsPerDay] = useState(DEFAULT_ALLOW_MAX_EVENTS)
  const [allowMaxEventsPerWeek, setAllowMaxEventsPerWeek] = useState(DEFAULT_ALLOW_MAX_EVENTS)
  const [eventDuration, setEventDuration] = useState(DEFAULT_EVENT_DURATION)
  const [maxEventsPerDay, setMaxEventsPerDay] = useState(DEFAULT_MAX_EVENTS)
  const [maxEventsPerWeek, setMaxEventsPerWeek] = useState(DEFAULT_MAX_EVENTS)
  const [events, setEvents] = useState(DEFAULT_EVENTS)
  const [errors, setErrors] = useState({})
  const [openConfirmation, setOpenConfirmation] = useState(false)
  const [openError, setOpenError] = useState(false)

  const onEventAdd = (item, index) => {
    const list = events.concat([emptyEvent])
    list[index] = item
    setEvents(list)
  }

  const onEventRemove = (indexToDelete) => {
    setEvents(events.filter((_, index) => index !== indexToDelete))
  }

  const onSave = async () => {
    const profileObj = JSON.parse(localStorage.getItem("profileObj"))
    const validationErrors = Event.validate({ eventName, slots: events })
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return
    const res = await Event.save(
      {
        name: eventName,
        allowMaxEventsPerDay,
        allowMaxEventsPerWeek,
        maxEventsPerDay,
        maxEventsPerWeek,
        availabilities: events,
      },
      profileObj.googleId
    )
    if (!res) return setOpenError(true)

    setOpenConfirmation(true)
    resetStatus()
  }

  const resetStatus = () => {
    setEventName(DEFAULT_EVENT_NAME)
    setAllowMaxEventsPerDay(DEFAULT_ALLOW_MAX_EVENTS)
    setAllowMaxEventsPerWeek(DEFAULT_ALLOW_MAX_EVENTS)
    setEventDuration(DEFAULT_EVENT_DURATION)
    setMaxEventsPerDay(DEFAULT_MAX_EVENTS)
    setMaxEventsPerWeek(DEFAULT_MAX_EVENTS)
    setEvents(DEFAULT_EVENTS)
  }

  function valuetext(value) {
    return moment.duration(value, "minutes").format("h [hrs], m [min]")
  }

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return
    }

    setOpenConfirmation(false)
    setOpenError(false)
  }

  return (
    <div>
      <AppBar position="fixed" color="primary" className={classes.appBar}>
        <Button variant="contained" color="primary" className={classes.saveButton} onClick={onSave}>
          Save Event
        </Button>
      </AppBar>
      <Grid className={classes.root} spacing={4} container direction="column" justify="center" alignItems="center">
        <Grid item>
          <TextField
            className={classes.slider}
            placeholder="Event Name"
            value={eventName}
            onChange={(event) => setEventName(event.target.value)}
            error={errors.hasOwnProperty("eventName")}
            id="standard-error-helper-text"
            helperText={errors.hasOwnProperty("eventName") && "Event Name is mandatory"}
          />
        </Grid>
        <Grid item>
          <Slider
            value={eventDuration}
            valueLabelFormat={valuetext}
            aria-labelledby="discrete-slider-small-steps"
            step={30}
            marks
            min={30}
            max={480}
            valueLabelDisplay="on"
            ValueLabelComponent={ValueLabelComponent}
            className={classes.slider}
            onChange={(event, newValue) => setEventDuration(newValue)}
          />
          <Typography>Slide to choose Event Duration</Typography>
        </Grid>
        <Grid item>
          <Grid spacing={4} container justify="center" alignItems="center">
            <Grid item>
              <TextField
                className={classes.slider}
                id="standard-number"
                label="Maximum Events per day"
                type="number"
                InputLabelProps={{
                  shrink: true,
                }}
                value={maxEventsPerDay}
                onChange={(event) => setMaxEventsPerDay(event.target.value)}
                disabled={!allowMaxEventsPerDay}
              />
            </Grid>
            <Grid item>
              <FormControlLabel
                control={
                  <Switch
                    checked={allowMaxEventsPerDay}
                    onChange={(event) => setAllowMaxEventsPerDay(event.target.checked)}
                    color="primary"
                    name="checkedB"
                    inputProps={{ "aria-label": "primary checkbox" }}
                    size="small"
                  />
                }
                labelPlacement="end"
                label="Enable Max Events per day control"
                classes={{
                  label: classes.label,
                }}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Grid spacing={4} container justify="center" alignItems="center">
            <Grid item>
              {" "}
              <TextField
                className={classes.slider}
                id="standard-number"
                label="Maximum Events per week"
                type="number"
                InputLabelProps={{
                  shrink: true,
                }}
                value={maxEventsPerWeek}
                onChange={(event) => setMaxEventsPerWeek(event.target.value)}
                disabled={!allowMaxEventsPerWeek}
              />
            </Grid>
            <Grid item>
              <FormControlLabel
                control={
                  <Switch
                    checked={allowMaxEventsPerWeek}
                    onChange={(event) => setAllowMaxEventsPerWeek(event.target.checked)}
                    color="primary"
                    name="checkedB"
                    inputProps={{ "aria-label": "primary checkbox" }}
                    size="small"
                  />
                }
                labelPlacement="end"
                label="Enable Max Events per week control"
                classes={{
                  label: classes.label,
                }}
              />
            </Grid>
          </Grid>
        </Grid>
        {events.map((event, index) => (
          <CreateEventElement
            item={event}
            key={`event_${index}`}
            onAdd={(item) => onEventAdd(item, index)}
            onRemove={() => onEventRemove(index)}
            hideDelete={index === 0}
            hasErrors={errors.hasOwnProperty("slots") && errors.slots.hasOwnProperty(index)}
            error={errors.hasOwnProperty("slots") && errors.slots[index]}
          />
        ))}
      </Grid>
      <Snackbar open={openConfirmation} autoHideDuration={3000} onClose={handleClose}>
        <Alert severity="success">Event saved successfully!</Alert>
      </Snackbar>
      <Snackbar open={openError} autoHideDuration={3000} onClose={handleClose}>
        <Alert severity="error">Something went wrong</Alert>
      </Snackbar>
    </div>
  )
}
