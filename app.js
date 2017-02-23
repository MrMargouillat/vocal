// Requires
let express = require("express")
let bodyParser = require('body-parser')
let fileUpload = require('express-fileupload')
let  cookieSession  = require('cookie-session')
let account = require("./models/account")

let app = express()

let PORT = process.env.port || 8080

app.set('view engine', 'ejs')

// Middleware 
app.use('/uploads', express.static('files/upload'))
app.use('/static', express.static('public'))

// parse application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({
    extended: false
}))

// parse application/json 
app.use(bodyParser.json())

// parse form/-data
app.use(fileUpload());

app.use(cookieSession({  
    name:   'session',
    keys:  ["key"],
}))

let needLogged = (req, res, next) => {
    if (req.session.user !== null || undefined) {
        next()
    } else {
        res.redirect("/login")
    }
}

let needNotLogged = (req, res, next) => {
    if (req.session.user === null || undefined) {
        next()
    } else {
        res.redirect("back")
    }
}

// let test = require("./middlewares/auth")

// let needLogged = test.needLogged
// let needNotLogged = test.needNotLogged

app.use((req, res, next) => {
    console.log(req.session.user)
        // handeling user to be useable in ejs
    if (req.session.user) {
        res.locals.user = req.session.user
    }
    next()
})

app.use((req, res, next) => {
    // Error handeling system
    if (req.session.error) {
        res.locals.error = req.session.error
        req.session.error = null
    }

    next()
})

app.use((req, res, next) => {
    // success handeling system
    if (req.session.user) {
        res.locals.success = req.session.success
        req.session.success = null
    }
    next()
})

// Routes
let indexRouter = require("./controllers/index")()
app.use("/", indexRouter)

let loginRouter = require("./controllers/login")(account)
app.use("/login", needNotLogged)
app.use("/login", loginRouter)

let signupRouter = require("./controllers/signup")(account)
app.use("/signup", needNotLogged)
app.use("/signup", loginRouter)

let userRouter = require("./controllers/user")(account)
app.use("/user", needLogged)
app.use("/user", userRouter)

let fileRouter = require("./controllers/file")()
app.use("/file", needLogged)
app.use("/file", fileRouter)

let friendRouter = require("./controllers/friend")(account)
app.use("/friend", needLogged)
app.use("/friend", friendRouter)

let logoutRouter = require("./controllers/logout")()
app.use("/logout", needLogged)
app.use("/logout", logoutRouter)


app.listen(PORT)