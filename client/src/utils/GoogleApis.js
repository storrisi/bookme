import React from "react"

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

  React.useEffect(() => {
    gapi.load("client:auth2", () => {
      gapi.auth2.init({ client_id }).then(authenticate)
    })
  })

  React.useEffect(() => {
    isAuthenticated && loadClient()
  }, [isAuthenticated])

  return { isAuthenticated, isClientLoaded, getCalendarList }
}
