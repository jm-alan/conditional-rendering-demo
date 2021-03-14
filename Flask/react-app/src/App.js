import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import LoginForm from './components/auth/LoginForm';
import SignUpForm from './components/auth/SignUpForm';
import NavBar from './components/NavBar';
import ProtectedRoute from './components/auth/ProtectedRoute';
import UsersList from './components/UsersList';
import User from './components/User';
import { authenticate } from './store/session';

function App () {
  const dispatch = useDispatch();

  const user = useSelector(state => state.session.user);
  const loaded = useSelector(state => state.session.loaded);

  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    dispatch(authenticate());
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <BrowserRouter>
      <NavBar />
      <Switch>
        <Route path='/sign-up' exact>
          <SignUpForm authenticated={authenticated} setAuthenticated={setAuthenticated} />
        </Route>
        <ProtectedRoute path='/users' exact>
          <UsersList />
        </ProtectedRoute>
        <ProtectedRoute path='/users/:userId' exact>
          <User />
        </ProtectedRoute>
        <Route path='/' exact>
          <h1>My Home Page</h1>
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
