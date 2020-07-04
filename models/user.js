const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  firstname: { type: String, required: true, minlength: 2 },
  lastname: { type: String, required: true, minlength: 2 },
  username: { type: String, required: true, minlength: 3 },
  password: { type: String, required: true, minlength: 6 },
  member: { type: Boolean, required: true },
  admin: { type: Boolean, required: true },
  messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
});

UserSchema.virtual('name').get(() => {
  const fullname = '';
  if (this.first_name && this.last_name) {
    fullname = this.first_name + ' ' + this.last_name;
  }
  if (!this.first_name || !this.last_name) {
    fullname = '';
  }
  return fullname;
});

module.exports = mongoose.model('User', UserSchema);
