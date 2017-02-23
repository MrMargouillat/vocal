let express = require("express")

routes = (account) => {
    let loginRouter = express.Router()

    loginRouter.route('/')
        .get((req, res) => {
            res.render("pages/login")
        })
        .post((req, res) => {
            if (req.body.submit !== undefined) {
                account.login(req.body.login, req.body.pass).then((result) => {
                    // Set user session
                    req.session.user = result
                    res.redirect("back")
                }).catch((error) => {
                    req.session.error = error
                    res.redirect("back")
                })

            } else {
                redirect("back")
            }
        })
    return loginRouter
}

module.exports = routes