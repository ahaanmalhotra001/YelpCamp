if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const ExpressError = require('./utils/ExpressError')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')     //helps in making ejs template: set app.egine for ejs
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const LocalStrategy = require('passport-local')  //to use passport with local (username) strategy
const User = require('./models/user')
const mongoSanitize = require('express-mongo-sanitize') //sanitinise the input before passing onto mongo
const helmet = require('helmet') //to imporove security; has 11 middlewares that mainly change headers:: to save from attacks

const campRoutes = require('./routes/campground.js')
const reviewRoutes = require('./routes/review.js')
const userRoutes = require('./routes/user.js')

const MongoStore = require("connect-mongo");
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'
// 'mongodb://localhost:27017/yelp-camp'
mongoose.connect(dbUrl, {
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex:true,
    useFindAndModify : false
})

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Connected to Mongoose')
});

app.use(express.static(path.join(__dirname, 'public')))
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({extended : true}))
app.use(methodOverride('_method')) //As forms only support post or get requests
app.use(mongoSanitize({replaceWith : '_'})) //sanitinise the input before passing onto mongo

const secret = process.env.SECRET || 'squirrel'

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
});

// Sessions are used to store state data on the server side
const sessionConfig = {
    store,
    name : 'sess',
    secret, 
    resave : false,     //to avoid depracation warning
    saveUninitialized: true, //to avoid depracation warning
    cookie : {
        httpOnly : true, //security. Session cookies cant be accessed through JS scripts
        //secure : true, 
        expires : Date.now() + 1000*60*60*24*7, //in milliseconds
        maxAge : 1000*60*60*24*7
    }
}

app.use(session(sessionConfig))
app.use(flash())

app.use(helmet())

//Helmet's Content Security policy will not let us load scripts from other sites
//We need to specify the allowed urls to let these scripts load
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://cdn.jsdelivr.net",
    "https://stackpath.bootstrapcdn.com",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            childSrc : ["blob:"],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/drek0cqwy/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// Configure Passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next)=>{
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    res.locals.currentUser = req.user
    next()
})

app.get('/', (req, res)=>{
    res.render('home')
})

app.use('/campgrounds', campRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)
app.use('/', userRoutes)


app.all('*', (req, res, next)=>{
    next(new ExpressError('Page Not Found', 404))
})

app.use(function(err, req, res, next){
    const {statusCode = 500, message = 'Oops! Something went wrong'} = err
    res.status(statusCode).render('error' , {err})
});

const port = process.env.PORT || 3000

app.listen(port, ()=>{
    console.log('Server Listening')
    console.log(`http://localhost:${port}`)
})
