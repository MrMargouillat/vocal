let connection = require("../../config/db")
let validat = require("email-validator");
let bcrypt = require('bcryptjs')


class Account {
    create(mail, pass, pseudo) {
        return new Promise((resolve, reject) => {
            connection.query('INSERT INTO users SET ?', {
                    "mail": mail,
                    "password": pass,
                    "pseudo": pseudo,
                },
                (err, result) => {
                    if (err) reject(err)
                    resolve(result)
                });
        })
    }

    createVerifying(mail, pass, pseudo) {
        return new Promise((resolve, reject) => {
            let promise = Promise.all([
                    this.checkFilled(mail, pass, pseudo),
                    // true if check passed
                    this.ckeckLength(pass, pseudo),
                    // true if check passed
                    this.isPseudoUsed(pseudo),
                    // false if pseudo unused
                    this.isMailValid(mail),
                    // true if mail is in good fmat and unused
                ])
                .then((result) => {
                    // Security passwd and Injection dans la db
                    this.create(mail, bcrypt.hashSync(pass, 10), pseudo)
                    resolve()
                })
                .catch((err) => {
                    reject(err)
                })
        })
    }

    checkFilled(mail, pass, pseudo) {
        return new Promise((resolve, reject) => {
            if (pass !== "" && pseudo !== "" && mail !== "") {
                resolve(true)
                    // true if check passed
            } else {
                reject({
                    type: "err",
                    message: "Un champ requis n'est pas complété",
                    code: 1
                })
            }
        })
    }

    login(id, pass) {
        return new Promise((resolve, reject) => {
            this.checkFilled(id, id, pass)
                .then((result) => {
                    connection.query("SELECT * FROM users WHERE mail = ? OR pseudo = ?", [id, id], (err, result) => {
                        if (err) reject({
                            type: "err",
                            message: "Une erreur avec la db est survenue",
                            code: 1,
                            add: err,
                        })

                        if (result.length === 1) {
                            bcrypt.compare(pass, result[0].password, (err, res) => {
                                if (res === true) {
                                    resolve({
                                        "type": "result",
                                        "id": result[0].user_id,
                                        'pseudo': result[0].pseudo,
                                        "mail": result[0].mail,
                                    })
                                } else {
                                    reject({
                                        type: "err",
                                        message: "Erreur dans le mot de passe",
                                        code: 1
                                    })
                                }

                            });
                        } else {
                            reject({
                                type: "err",
                                message: "Aucun compte n'existe avec cet identifiant. Inscrivez-vous",
                                code: 1
                            })
                        }

                    })
                })
                .catch((err) => {
                    reject({
                        type: "err",
                        message: "Un champ requis n'est pas complété",
                        code: 1
                    })
                })
        })
    }

    ckeckLength(pass, pseudo) {
        return new Promise((resolve, reject) => {
            if (pass.length >= 7) {
                if (pseudo.length > 3) {
                    resolve(true)
                        // true if check passed
                } else {
                    reject({
                        type: "err",
                        message: "Pseudo trop court ( plus de trois caractères )",
                        code: 3
                    })
                }
            } else {
                reject({
                    type: "err",
                    message: "Mot de passe trop court",
                    code: 2
                })
            }
        })
    }

    isMailValid(mail) {
        return new Promise((resolve, reject) => {
            validat.validate_async(mail, (err, isValidEmail) => {
                // TODO : use async and put istead of isMailUsed
                //isValidEmail true if email valid
                if (isValidEmail) {
                    // Security passwd and Injection dans la db
                    this.isMailUsed(mail).then((result) => {
                        if (result === false) {
                            resolve(true)
                        } else {
                            reject({
                                type: "err",
                                message: "Mail déjà utlilisé",
                                code: 5
                            })
                        }
                    })

                } else {
                    reject({
                        type: "err",
                        message: "Fmat du mail invalide",
                        code: 2
                    })
                }

            })
        })
    }

    delete(id) {
        return new Promise((resolve, reject) => {
            connection.query("DELETE FROM users WHERE user_id = ? ", [id], (err, result) => {
                if (err) reject(err)
                resolve(result)
            })
        })
    }

    getById(id) {
        // select in the db
        return new Promise((resolve, reject) => {
            connection.query("SELECT * FROM users WHERE user_id = ? ", [id], (err, result) => {
                if (err) reject(err)
                resolve(result)
            })
        })
    }

    getByIdSync(id, cb) {
        // select in the db
        connection.query(" SELECT * FROM users WHERE user_id = ? ", [id], (err, result) => {
            if (err) throw err
            cb(result)
        })

    }

    getByPseudo(pseudo) {
        // select in the db
        return new Promise((resolve, reject) => {
            connection.query("SELECT * FROM users WHERE pseudo = ? ", [pseudo], (err, result) => {
                if (err) throw err
                if (result.length < 1) {
                    reject(result[0])
                } else {
                    resolve(result[0])
                }

            })
        })
    }



    isPseudoUsed(pseudo) {
        return new Promise((resolve, reject) => {
            connection.query(" SELECT * FROM users WHERE pseudo = ? ", [pseudo], (err, result) => {
                if (err) reject(err)
                if (result.length === 0) {
                    resolve(false)
                } else {
                    resolve(true)
                }
            })
        })

    }

    isMailUsed(mail) {
        return new Promise((resolve, reject) => {
            connection.query(" SELECT * FROM users WHERE mail = ? ", [mail], (err, result) => {
                if (err) reject(err)
                if (result.length === 0) {
                    resolve(false)
                } else {
                    resolve(true)
                }
            })
        })

    }

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

    areFriends(id_1, id_2) {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM `friendship` WHERE user_id_1 = ? AND user_id_2 = ? OR user_id_1 = ? AND user_id_2 = ?', [id_1, id_2, id_2, id_1], (err, result) => {
                if (err) throw err
                resolve(result)
            });
        })
    }

    isFriendRequestedBy(from, to) {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM `friendship_request` WHERE asked_by = ? AND asked_to = ? ', [from, to], (err, result) => {
                if (err) throw err
                if (result.length > 1) {
                    resolve(true)
                } else {
                    resolve(false)
                }
            })
        })
    }

}

module.exports = new Account()