const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

// mongoose.connect('mongodb://localhost:27017/TodoApp');
mongoose.connect('mongodb+srv://Rajat:rajat@cluster0.gby4v.mongodb.net/TodoApp?retryWrites=true&w=majority');

module.exports = {mongoose};