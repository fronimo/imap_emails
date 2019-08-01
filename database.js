const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/imap_email', {useNewUrlParser: true});

var Schema = mongoose.Schema;

var emailSchema = new Schema({
    email: String
});

var email = mongoose.model('Email', emailSchema);

module.exports = email;