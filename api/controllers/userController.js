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
  accounts(req, res) {
    const id = req.user._id;
    User.findOne({ _id: id })
      .select('-password ')
      .then((user, err) => {
        if (user) return res.json(user.accounts);
        res.status(400).json({ err, message: `Usuario no encontrado` });
      })
      .catch(err => {
        res.status(400).json({ err, message: `Usuario no encontrado` });
      });
  },
  addAccount(req, res) {
    console.log('adding account');

    const id = req.user._id;
    const { balance, name, color } = req.body;

    const newAccount = { name, balance, color };

    User.findOne({ _id: id })
      .select('-password ')
      .then((user, err) => {
        if (user) {
          newAccount.id = user.accounts.length;
          console.log(newAccount);
          user.accounts.push(newAccount);
          user.save((err, updated) => res.json(updated.accounts));
          return res;
        }
        res.status(400).json({ err, message: `Usuario no encontrado` });
      })
      .catch(err => {
        console.log(err);
        res.status(400).json({ err, message: `Usuario nasso encontrado` });
      });
  },
  addExpense(req, res) {
    const id = req.user._id;
    const { account, expense, amount } = req.body;
    User.findOne({ _id: id })
      .select('-password ')
      .then((user, err) => {
        if (user) {
          user.accounts[account].balance -= amount;
          console.log(user.expenses);

          user.expenses[expense].total += amount;
          user.save((err, updated) => res.json(updated.expenses));
          return res;
        }
        res.status(400).json({ err, message: `Usuario no encontrado` });
      })
      .catch(err => {
        res.status(400).json({ err, message: `Usuario no encontrado` });
      });
  },
  addIncome(req, res) {
    const id = req.user._id;
    const { account, amount } = req.body;
    User.findOne({ _id: id })
      .select('-password ')
      .then((user, err) => {
        if (user) {
          user.accounts[account].balance += amount;
          user.save((err, updated) => res.json(updated.accounts));
          return res;
        }
        res.status(400).json({ err, message: `Usuario no encontrado` });
      })
      .catch(err => {
        res.status(400).json({ err, message: `Usuario no encontrado` });
      });
  },
  transfer(req, res) {
    const id = req.user._id;
    const { from, to, amount } = req.body;
    User.findOne({ _id: id })
      .select('-password ')
      .then((user, err) => {
        if (user) {
          user.accounts[from].balance -= amount;
          user.accounts[to].balance += amount;
          user.save((err, updated) => res.json(updated.accounts));
          return res;
        }
        res.status(400).json({ err, message: `Usuario no encontrado` });
      })
      .catch(err => {
        res.status(400).json({ err, message: `Usuario no encontrado` });
      });
  },
  expenses(req, res) {
    const id = req.user._id;
    User.findOne({ _id: id })
      .select('-password ')
      .then((user, err) => {
        if (user) return res.json(user.expenses);
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
      if (user) return res.status(400).json(`El email ${email} ya esta en uso`);

      const accounts = [
        { id: 0, name: 'Billetera', balance: 0, color: '#009ccc' },
        { id: 1, name: 'Banco', balance: 0, color: '#ba2402' }
      ];

      const expenses = [
        { id: 0, name: 'Servicos', total: 0 },
        { id: 1, name: 'Vivienda', total: 0 },
        { id: 2, name: 'Compras', total: 0 },
        { id: 3, name: 'Transporte', total: 0 },
        { id: 4, name: 'Proviciones', total: 0 },
        { id: 5, name: 'Entretenimiento', total: 0 }
      ];
      const newUser = new User({
        username,
        email,
        password,
        accounts,
        expenses
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
              res
                .status(400)
                .json({ error: true, message: 'Contraseña incorrecta' });
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
          res
            .status(400)
            .json({ error: true, message: `El usuario ${email} no existe!` });
        }
      })
      .catch(err => {
        res.status(400).json('Credenciales incorrectas');
      });
  },
  logout(req, res) {
    const requestBody = req.body;
    const newUser = new User(requestBody);
  },
  allAddresses() {}
};

module.exports = userController;
