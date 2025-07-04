const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const mongoose = require('mongoose');
const User = require('/models/user.js');

const app = express();
const port = 3000;

// MongoDB connection
mongoose.connect('mongodb+srv://erozeroelectro:YkhFRSmwU9iOmWS1@apdev-mco.h5f8ux9.mongodb.net/?retryWrites=true&w=majority&appName=APDEV-MCO', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB error:", err));