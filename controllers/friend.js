let express = require("express")

routes = (account) => {
    let friendRouter = express.Router()
    friendRouter.route("/new/:id2")
        .get((req, res) => {
            if (req.session.user.id) {
                let promise = Promise.all([
                    account.isFriendRequestedBy(req.session.user.id, req.params.id2),
                    account.isFriendRequestedBy(req.params.id2, req.session.user.id),
                ]).then((result) => {
                    if (result[1] === true || result[1] === true) {
                        account.askFriend(req.session.user.id, req.params.id2).then(() => {
                            console.log("Good");
                        })
                    }
                })
            }
            res.redirect("back")
        })
    return friendRouter
}

module.exports = routes