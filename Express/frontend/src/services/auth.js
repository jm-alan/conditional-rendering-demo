import csrfetch from '../store/csrf';

export const authenticate = async () => {
  await csrfetch('/api/csrf/restore');
  const res = await csrfetch('/api/session/');
  return res.data.user;
};

export const login = async (identification, password) => {
  const res = await csrfetch('/api/session/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ identification, password })
  });
  return res.data.user;
};

export const logout = async () => {
  await csrfetch('/api/session/', {
    method: 'DELETE'
  });
};

export const signUp = async (username, email, password) => {
  const res = await csrfetch('/api/users/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username,
      email,
      password
    })
  });
  return res.data.user;
};
