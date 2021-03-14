'use strict';
const { Validator } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [2, 30],
          isNotEmail (value) {
            if (Validator.isEmail(value)) {
              throw new Error('Username cannot be an email.');
            }
          },
          isValid (value) {
            if (value.match(/[^a-zA-Z-_]/g)) {
              throw new Error(
                `Currently, usernames may only contain the letters A-Z, an underscore, or a hyphen.
                We apologize for the inconvenience.`
              );
            }
          }
        }
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [3, 256]
        }
      },
      hashedPassword: {
        type: DataTypes.STRING.BINARY,
        allowNull: false,
        validate: {
          len: [60, 60]
        }
      },
      avatarId: {
        type: DataTypes.INTEGER,
        allowNull: true
      }
    },
    {
      defaultScope: {
        attributes: {
          exclude: ['hashedPassword', 'email', 'createdAt', 'updatedAt']
        }
      },
      scopes: {
        currentUser: {
          attributes: { exclude: ['hashedPassword'] }
        },
        loginUser: {
          attributes: {}
        }
      }
    }
  );

  User.associate = function (models) {
    const attendeeMap = {
      as: 'AttendingEvents',
      through: models.Attendee,
      foreignKey: 'userId',
      otherKey: 'eventId'
    };
    const unreadMap = {
      as: 'UnreadConversations',
      through: models.Notification,
      foreignKey: 'userId',
      otherKey: 'conversationId'
    };
    const convoMap = {
      as: 'Chats',
      through: models.RosterEntry,
      foreignKey: 'userId',
      otherKey: 'conversationId'
    };

    User.hasMany(models.Attendee, { foreignKey: 'userId' });
    User.hasMany(models.Notification, { foreignKey: 'userId' });
    User.hasMany(models.Event, { as: 'HostedEvents', foreignKey: 'ownerId' });
    User.hasMany(models.Message, { as: 'SentMessages', foreignKey: 'senderId' });
    User.hasMany(models.EventPost, { as: 'EventComments', foreignKey: 'ownerId' });
    User.hasMany(models.Conversation, { as: 'OwnedConversations', foreignKey: 'createdBy' });
    User.belongsTo(models.Image, { as: 'Avatar', foreignKey: 'avatarId' });
    User.belongsToMany(models.Event, attendeeMap);
    User.belongsToMany(models.Conversation, unreadMap);
    User.belongsToMany(models.Conversation, convoMap);
  };

  User.prototype.toSafeObject = function () {
    const { id, username, email, maxPins, Avatar } = this;
    return { id, username, email, maxPins, Avatar };
  };

  User.prototype.validatePassword = function (password) {
    return bcrypt.compareSync(password, this.hashedPassword.toString());
  };

  User.getCurrentUserById = async function (id) {
    return await User.scope('currentUser').findByPk(id, {
      include: ['Avatar']
    });
  };

  User.login = async function ({ identification, password }) {
    const user = await User.scope('loginUser').findOne({
      where: {
        email: identification
      }
    });
    if (user && user.validatePassword(password)) {
      return await User.scope('currentUser').findByPk(user.id, {
        include: ['Avatar']
      });
    }
  };

  User.signup = async function ({ username, email, password, maxPins }) {
    const hashedPassword = bcrypt.hashSync(password);
    const user = await User.create({
      username,
      email,
      hashedPassword,
      maxPins
    });
    return await User.scope('currentUser').findByPk(user.id, {
      include: ['Avatar']
    });
  };

  return User;
};
