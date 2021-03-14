const router = require('express').Router();
const asyncHandler = require('express-async-handler');

const sessionRouter = require('./session');
const usersRouter = require('./users');
const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { User } = require('../../db/models');

if (process.env.NODE_ENV !== 'production') {
  router.get('/set-token-cookie', asyncHandler(async (req, res) => {
    const user = await User.findOne({
      where: {
        username: 'Demo-lition'
      }
    });
    setTokenCookie(res, user);
    return res.json({ user });
  }));
}

router.get('/restore-user', restoreUser, (req, res) => {
  return res.json(req.user);
});

router.use('/session', sessionRouter);

router.use('/users', usersRouter);

module.exports = router;
