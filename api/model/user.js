const mongoose = require('mongoose');

const { Schema } = mongoose;
const model = mongoose.model.bind(mongoose);
const { ObjectId } = mongoose.Schema.Types;

const userSchema = Schema({
  id: ObjectId,
  username: String,
  password: String,
  email: String
});

const User = model('User', userSchema);

module.exports = { User };
