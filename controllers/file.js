let express = require("express")
const AudioFile = require("../models/audiofile")
const randomstring = require("randomstring")
routes = () => {
    let fileRouter = express.Router()
    fileRouter.route('/upload')
        .post((req, res) => {
            // check if file send
            if (res.locals.user) {
                if (req.files !== undefined) {
                    // check if audio exist
                    if (req.files.audio !== undefined) {
                        // local file
                        let file = new AudioFile(req.files.audio)
                            // check file type
                        if (file.isAudio) {
                            //move and rename 
                            // save file name in db with id of client
                            file.saveWithDb(randomstring.generate(11), req.session.user.id, req.body.title, (result) => {
                                req.session.success = {
                                    type: "result",
                                    message: "Fichier enregistré dans la db avec succès."
                                }
                            })

                        } else {
                            // else delete and display error
                            req.session.error = {
                                type: "error",
                                message: "Format mimetype du fichier invalide"
                            }
                            req.files = undefined;
                            file = undefined;
                        }
                    }
                } else {
                    // else delete and display error
                    req.session.error = {
                        type: "error",
                        message: "Aucun fichier sélectionné"
                    }
                }
            } else {
                req.session.error = {
                    type: "error",
                    message: "Veuillez vous connecter."
                }
            }
            // redirect
            res.redirect("back")
        })

    fileRouter.route("/delete/:id")
        .get((req, res) => {
            let query = new AudioFile;
            query.deleteById(req.params.id, () => {})
            res.send()
        })
    return fileRouter
}

module.exports = routes