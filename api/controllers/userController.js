const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Model = require('../model/user');

const { User } = Model;

const userController = {
  all(req, res) {
    User.find().exec((err, user) => res.json(user));
  },
  find(req, res) {
    const id = req.user._id;
    User.findOne({ _id: id })
      .select('-password ')
      .then((user, err) => {
        if (user) return res.json(user);
        res.status(400).json({ err, message: `Usuario no encontrado` });
      })
      .catch(err => {
        res.status(400).json({ err, message: `Usuario no encontrado` });
      });
  },
  update(req, res) {
    const idParam = req.params.id;
    const userReq = req.body;

    User.findOne({ _id: idParam }).then((err, user) => {
      if (user) {
        user.username = userReq.username;
        user.password = userReq.password;
        user.email = userReq.email;
        user.save((err, updated) => res.json(updated));
      }
      return res.status(400).json({ message: `Usuario no encontrado` });
    });
  },
  delete(req, res) {
    const { id } = req.params;
    User.findOne({ _id: id }, (err, tag) => {
      if (tag) {
        User.deleteOne({ _id: id }, (err, removed) => res.json(removed));
      } else {
        return res.status(400).json({ message: 'Nusuario no eliminado' });
      }
    });
  },
  register(req, res) {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Faltan datos' });
    }

    User.findOne({ email }).then(user => {
      if (user)
        return res
          .status(200)
          .json({ error: true, message: `El email ${email} ya esta en uso` });

      const newUser = new User({
        username,
        email,
        password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser.save().then(user => {
            jwt.sign(
              { _id: user._id },
              process.env.JWT_SECRET,
              (err, token) => {
                if (err) throw err;
                res.json({
                  error: false,
                  message: 'Usuario creado',
                  token,
                  user: {
                    id: user._id,
                    name: user.username,
                    email: user.email
                  }
                });
              }
            );
          });
        });
      });
    });
  },

  login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({
        error: true,
        message: 'Especifíca tu email y tu contraseña'
      });
    }
    User.findOne({ email })
      .then(user => {
        if (user) {
          bcrypt.compare(password, user.password).then(valid => {
            if (!valid) {
              console.log(valid);
              res.json({ error: true, message: 'Contraseña incorrecta' });
            } else {
              jwt.sign(
                { _id: user._id },
                process.env.JWT_SECRET,
                (err, token) => {
                  if (err) throw err;
                  return res.json({
                    error: false,
                    message: 'Login Exitoso!',
                    user: {
                      id: user._id,
                      name: user.username,
                      email: user.email
                    },
                    token
                  });
                }
              );
            }
          });
        } else {
          res.json({ error: true, message: `El usuario ${email} no existe!` });
        }
      })
      .catch(err => {
        res.status(400).json({ error: true, message: `Usuario no encontrado` });
      });
  },
  logout(req, res) {
    const requestBody = req.body;
    const newUser = new User(requestBody);
  },
  allAddresses() {}
};

module.exports = userController;
