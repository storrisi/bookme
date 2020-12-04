import React, { useState } from "react"
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom"
import Home from "../features/Home"
import CreateEvent from "../features/CreateEvent"
import { UserContext } from "../utils/UserContext"

export default function App() {
  const [context, setContext] = useState({})
  return (
    <UserContext.Provider value={[context, setContext]}>
      <Router>
        <div>
          <nav>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
            </ul>
          </nav>
          <Switch>
            <Route path="/create-event">
              <CreateEvent />
            </Route>
            <Route path="/">
              <Home />
            </Route>
          </Switch>
        </div>
      </Router>
    </UserContext.Provider>
  )
}
