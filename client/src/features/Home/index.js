import React, { useState } from "react"
import { GoogleLogin } from "react-google-login"
import { Avatar, Button, Grid, Typography, makeStyles } from "@material-ui/core"
import { refreshTokenSetup } from "../../utils/token"
import { Link } from "react-router-dom"

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100vh",
  },
}))

const App = () => {
  const [user, setUser] = useState({})
  const classes = useStyles()

  const onSuccess = (res) => {
    console.log(res)
    refreshTokenSetup(res)
    setUser(res.profileObj)
    localStorage.setItem("profileObj", JSON.stringify(res.profileObj))
  }

  const onFailure = (res) => {
    console.log("Login failed: res:", res)
    alert(`Failed to login. 😢 Please ping this to repo owner twitter.com/sivanesh_fiz`)
  }

  console.log(process.env.REACT_APP_CLIENT_ID)

  return (
    <Grid className={classes.root} container direction="column" justify="center" alignItems="center">
      {Object.keys(user).length === 0 ? (
        <GoogleLogin
          clientId={process.env.REACT_APP_CLIENT_ID}
          buttonText="Login"
          onSuccess={onSuccess}
          onFailure={onFailure}
          cookiePolicy={"single_host_origin"}
          isSignedIn={true}
          scopes={["https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/calendar.readonly"]}
        />
      ) : (
        <Grid container direction="column" justify="center" alignItems="center" spacing={4}>
          <Grid item direction="column" justify="center" alignItems="center">
            <Grid container direction="column" justify="center" alignItems="center" spacing={4}>
              <Typography variant="h4" component="h4">
                {user.name}
              </Typography>
              <Typography>{user.email}</Typography>
              <Avatar src={user.imageUrl} />
            </Grid>
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary">
              Connect your Calendar
            </Button>
            <Link to="/create-event">
              <Button variant="contained" color="primary">
                Create a new BookMe Event
              </Button>
            </Link>
          </Grid>
        </Grid>
      )}
    </Grid>
  )
}

export default App
