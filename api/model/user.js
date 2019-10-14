const mongoose = require('mongoose');

const { Schema } = mongoose;
const model = mongoose.model.bind(mongoose);
const { ObjectId } = mongoose.Schema.Types;

const userSchema = Schema({
  id: ObjectId,
  username: String,
  password: String,
  email: String,
  accounts: [{ id: Number, name: String, balance: Number, color: String }],
  expenses: [{ id: Number, name: String, total: Number, color: String }]
});

const User = model('User', userSchema);

module.exports = { User };
