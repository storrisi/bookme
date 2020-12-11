class ApiCalendar {
  constructor() {
    this.sign = false
    this.gapi = window["gapi"]
    this.onLoadCallback = null
    this.calendar = "primary"

    this.handleClientLoad()
  }

  handleClientLoad() {
    this.gapi.load("client:auth2", () => {
      this.gapi.auth2.init({ client_id: process.env.REACT_APP_CLIENT_ID }, () => this.authenticate())
    })
  }

  authenticate() {
    return this.gapi.auth2
      .getAuthInstance()
      .signIn({ scope: "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.readonly" })
      .then(
        function () {
          return true
        },
        function (err) {
          console.error("Error signing in", err)
        }
      )
  }

  initClient() {
    this.gapi.client.setApiKey(process.env.REACT_APP_API_KEY)
    return this.gapi.client.load("https://content.googleapis.com/discovery/v1/apis/calendar/v3/rest").then(
      function () {
        return true
      },
      function (err) {
        console.error("Error loading GAPI client for API", err)
      }
    )
  }

  getCalendarList() {
    return this.gapi.client.calendar.calendarList.list({}).then(
      function (response) {
        // Handle the results here (response.result has the parsed body).
        return response.result.items
      },
      function (err) {
        console.error("Execute error", err)
      }
    )
  }
}

export default ApiCalendar
