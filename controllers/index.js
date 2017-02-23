let express = require("express")
const AudioFile = require("../models/audiofile")

let routes = () => {
    let indexRouter = express.Router()
    indexRouter.route('/')
        .get((req, res) => {
            if (req.session.user) {
                let file = new AudioFile
                file.getAll().then((result) => {
                    res.render("pages/wall", {
                        users: result,
                    })
                })
            } else {
                res.render("pages/index")
            }
        })
    return indexRouter
}

module.exports = routes