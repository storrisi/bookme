import React, { useState } from "react"
import { AppBar, Button, Grid, makeStyles, TextField, Toolbar } from "@material-ui/core"
import CreateEventElement from "./CreateEventElement"
import Event from "../../utils/EventClass"

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100vh",
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
}))

const emptyEvent = { day: "", startingHour: "", endingHour: "" }

export default function CreateEvent() {
  const classes = useStyles()
  const [eventName, setEventName] = useState("")
  const [events, setEvents] = useState([{ ...emptyEvent }])
  const [errors, setErrors] = useState({})

  const onEventAdd = (item, index) => {
    const list = events.concat([emptyEvent])
    list[index] = item
    setEvents(list)
  }

  const onEventRemove = (indexToDelete) => {
    setEvents(events.filter((_, index) => index !== indexToDelete))
  }

  const onSave = () => {
    setErrors(Event.validate({ eventName, slots: events }))
  }

  console.log(errors)

  return (
    <div>
      <AppBar position="fixed" color="primary" className={classes.appBar}>
        <Button variant="contained" color="primary" className={classes.saveButton} onClick={onSave}>
          Save Event
        </Button>
      </AppBar>
      <Grid className={classes.root} container direction="column" justify="center" alignItems="center">
        <TextField
          placeholder="Event Name"
          value={eventName}
          onChange={(event) => setEventName(event.target.value)}
          error={errors.hasOwnProperty("eventName")}
          id="standard-error-helper-text"
          helperText={errors.hasOwnProperty("eventName") && "Event Name is mandatory"}
        />
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
    </div>
  )
}
