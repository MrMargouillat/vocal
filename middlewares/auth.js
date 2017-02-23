//TODO: better and cleaner way to do this

let middleWare = function() {
    let needLogged = (req, res, next) => {
        if (req.session.user !== undefined) {
            next()
        } else {
            res.redirect("/login")
        }
    }

    let needNotLogged = (req, res, next) => {
        if (req.session.user === undefined) {
            next()
        } else {
            res.redirect("back")
        }
    }
    return {
        needLogged: needLogged,
        needNotLogged: needNotLogged
    }
}


module.exports = middleWare