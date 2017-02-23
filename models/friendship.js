let connection = require("../config/db")

class Friendship {
    askFriend(from, to) {
        // Demander en ami
        // From est l id de la personne ayant envoyé la demande d'ami
        return new Promise((resolve, reject) => {
            if (from !== to) {
                let query = connection.query('INSERT INTO `friendship_request` SET ?', {
                        "asked_by": from,
                        "asked_to": to,
                        "date_request": new Date()
                    },
                    (err, result) => {
                        if (err) reject(err)
                        resolve(result)
                    });
            } else {
                reject("Erreur: la requète ne peut être faite a l'utilisateur lui même")
            }
        })
    }

    deleteFriend(from, to, cb) {
        // From est l'id de la personne ayant envoyé la demande d'ami
        return new Promise((resolve, reject) => {
            if (from !== to) {
                let query = connection.query('DELETE * FROM `friendship` WHERE user_id_1 = ? AND user_id_2 = ? OR user_id_1  AND user_id_2', [from, to, to, from],
                    (err, result) => {
                        if (err) reject(err)
                        resolve(result)
                    });
            } else {
                reject("Erreur: la requète ne peut être faite à l'utilisateur lui même")
            }
        })
    }

    responceFriendRequest(from, to, answer) {
        // From est l id de la personne ayant envoyé la demande d'ami
        if (answer === "accept") {
            // vérifier si nécessaire de check si une requete est lancée
            connection.query('INSERT INTO `friendship` SET ?', {
                    "user_id_1": from,
                    "user_id_2": to,
                    "date_add": new Date()
                },
                (err, result) => {
                    if (err) throw err
                });
        }
        // Inserer dans la db la relation
        this.deleteRequest(from, to, (result) => {})
    }
    deleteFirendRequest(from, to, cb) {
        return new Promise((resolve, reject) => {
            // From est l id de la personne ayant envoyé la demande d'ami
            // Supprime la demande en ami
            connection.query('DELETE * FROM `friendship_request` WHERE asked_by = ? AND asked_to = ?', [from, to], (err, result) => {
                if (err) reject(err)
                resolve(result)
            });
        })
    }


    getFriends(id) {
        // TODO select all 
    }

    isFriend(id_1, id_2) {

    }


}

module.exports = Friendship