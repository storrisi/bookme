import React from 'react';
import { GoogleLogin } from 'react-google-login';

const App = () => {
  const responseGoogle = (response) => {
    console.log(response);
  }

  console.log(process.env.REACT_APP_CLIENT_ID)

  return <GoogleLogin
  clientId={process.env.REACT_APP_CLIENT_ID}
  buttonText="Login"
  onSuccess={responseGoogle}
  onFailure={responseGoogle}
  cookiePolicy={'single_host_origin'}
/>
}

export default App