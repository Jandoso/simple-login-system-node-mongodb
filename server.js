if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
};

const express = require('express');
const app = express();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Users = require('./models/users');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');

const initializePassport = require('./passport-config')
initializePassport(
    passport, 
    email => users.find(user => user.email === email)
)

mongoose.connect("mongodb://localhost:27017/usersNodeSystem", { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection
db.on("error", console.log.bind(console, "connection error:"))
db.once("open", function(){
    console.log("Sucessfully connected to DB")
})

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    )
    next()
  })

app.use(bodyParser.json());

let users = [];

app.set('view-engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    res.render('index.ejs');
});

app.get('/login', (req, res) => {
    res.render('login.ejs');
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

app.get('/register', (req, res) => {
    res.render('register.ejs');
});

app.post('/register', async (req, res) => {
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10)

        const newUser = {
            name : req.body.name,
            email : req.body.email,
            password : hashedPassword
        }
        const user = new Users(newUser)
        user.save()
        res.redirect('/login')
    } catch {
        res.send({message: "erro ao salvar"})
    }
  })

app.listen(3000);

