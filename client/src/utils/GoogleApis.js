import React from "react"
import moment from "moment"
import uniq from "lodash/uniq"

export const useGoogleApi = (client_id, apiKey) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)
  const [isClientLoaded, setIsClientLoaded] = React.useState(false)
  const gapi = window["gapi"]

  const authenticate = async () => {
    const GoogleAuth = await gapi.auth2.getAuthInstance()

    if (GoogleAuth.isSignedIn.get()) {
      return setIsAuthenticated(true)
    }

    return gapi.auth2
      .getAuthInstance()
      .signIn({ scope: "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.readonly" })
      .then(
        () => setIsAuthenticated(true),
        (err) => {
          console.error("Error signing in", err)
        }
      )
  }

  const signOut = async () => gapi.auth2.getAuthInstance().signOut()

  const getCalendarList = async () => {
    return gapi.client.calendar.calendarList.list({}).then(
      function (response) {
        return response.result.items
      },
      function (err) {
        console.error("Execute error", err)
      }
    )
  }

  const createCalendarEvent = async (calendarId, organizer, details) => {
    const event = {
      summary: details.name,
      description: details.message,
      start: {
        dateTime: details.startDate,
      },
      end: {
        dateTime: details.endDate,
      },
      attendees: [{ email: details.email, responseStatus: "accepted" }],
      reminders: {
        useDefault: true,
      },
      conferenceData: {
        createRequest: { requestId: Math.random().toString().substr(2, 12) },
      },
    }

    const request = gapi.client.calendar.events.insert({
      calendarId,
      conferenceDataVersion: 1,
      sendUpdates: "all",
      resource: event,
    })

    request.execute(function (event) {
      console.log("Event created: " + event.htmlLink)
    })
  }

  const getCalendarFreeBusySlots = async (userCalendars) => {
    const calendars = userCalendars.map((calendar) => {
      return { id: calendar.id }
    })

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/freeBusy?key=${process.env.REACT_APP_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
          timeMin: moment(),
          timeMax: moment().add("3", "month"),
          items: calendars,
        }),
      }
    )

    const result = await response.json()
    if (Object.keys(result.calendars).length === 0) return false

    const busyEvents = Object.keys(result.calendars).reduce((previousValue, currentValue) => {
      const calendar = result.calendars[currentValue]
      return previousValue.concat(previousValue, calendar.busy)
    }, [])

    return uniq(busyEvents)
  }

  React.useEffect(() => {
    gapi.load("client:auth2", () => {
      gapi.auth2.init({ client_id }).then(authenticate)
    })
  })

  React.useEffect(() => {
    const loadClient = async () => {
      gapi.client.setApiKey(apiKey)
      return gapi.client.load("https://content.googleapis.com/discovery/v1/apis/calendar/v3/rest").then(
        () => {
          console.log("GAPI client loaded for API")
          setIsClientLoaded(true)
        },
        (err) => {
          console.error("Error loading GAPI client for API", err)
        }
      )
    }

    isAuthenticated && loadClient()
  }, [isAuthenticated, apiKey, gapi])

  return { signOut, isAuthenticated, isClientLoaded, getCalendarList, getCalendarFreeBusySlots, createCalendarEvent }
}
