let express = require("express")

routes = (account) => {
    let signupRouter = express.Router()
    signupRouter.route('/')
        .get((req, res) => {
            res.render("pages/signup")
        })
        .post((req, res) => {
            if (req.body.submit !== undefined) {
                account.createVerifying(req.body.mail, req.body.password, req.body.pseudo).then(() => {
                    account.login(req.body.mail, req.body.password).then((result) => {
                        // Set user session
                        req.session.user = result
                        res.redirect("back")
                    }).catch((error) => {
                        req.session.error = error
                        res.redirect("back")
                    })
                }).catch((err) => {
                    req.session.error = error
                    res.redirect("back")
                })
            }
        })

    return signupRouter
}

module.exports = routes