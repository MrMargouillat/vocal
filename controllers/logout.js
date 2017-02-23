let express = require("express")

routes = () => {
    let logoutRouter = express.Router()

    logoutRouter.route("/")
        .get((req, res) => {
            console.log("object");
            req.session.user = null
            res.redirect('/')
        })


    return logoutRouter
}

module.exports = routes