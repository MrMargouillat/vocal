let express = require("express")
const AudioFile = require("../models/audiofile/audiofile")

let routes = (account) => {
    let userRouter = express.Router()
    userRouter.route('/')
        .get((req, res) => {
            res.redirect("/user/" + req.session.user.pseudo)
        })
    userRouter.route("/:pseudo")
        .get((req, res) => {
            account.getByPseudo(req.params.pseudo).then((result) => {
                let file = new AudioFile()
                file.getAllByUserId(result.user_id).then((result_) => {
                    res.render("pages/wall", {
                        users: result_,
                    })
                })
            }).catch((err) => {
                res.redirect('/')
            })
        })

    return userRouter
}

module.exports = routes