let express = require("express")

let routes = () => {
    let logoutRouter = express.Router()

    logoutRouter.route("/")
        .get((req, res) => {
            req.session.user = null
            res.redirect('/')
        })


    return logoutRouter
}

module.exports = routes