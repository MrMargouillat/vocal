let connection = require("../../config/db")
let paths = require("../../config/paths")
const account = require("../account/account")
let fs = require("fs")
let randomstring = require("randomstring")


class AudioFile {
    constructor(file = undefined) {
        this.file = file;
        this.PATH = paths.uploads
        this.extention = paths.audioExtention

    }

    getAll() {
        return new Promise((resolve, reject) => {
            connection.query(" SELECT * FROM uploads ORDER BY upload_date DESC", (err, result) => {
                if (err) throw err
                let result_traited = []
                let request = []

                for (var i = 0; i < result.length; i++) {
                    request.push(account.getById(result[i].user_id))
                }
                // And append each function in the array to the promise chain
                let promise = Promise.all(request).then((res) => {
                    for (var i = 0; i < res.length; i++) {
                        result_traited[result_traited.length] = {
                            message: result[i],
                            user: res[i][0]
                        }
                    }
                    resolve(result_traited)
                })
            })
        })
    }

    getAllByUserId(id) {
        return new Promise((resolve, reject) => {
            connection.query(" SELECT * FROM uploads WHERE user_id = ? ORDER BY upload_date DESC", [id], (err, result) => {
                if (err) throw err
                let result_traited = []
                let request = []

                for (var i = 0; i < result.length; i++) {
                    request.push(account.getById(result[i].user_id))
                }

                // And append each function in the array to the promise chain
                let promise = Promise.all(request).then((res) => {
                    for (var i = 0; i < res.length; i++) {
                        result_traited[result_traited.length] = {
                            message: result[i],
                            user: res[i][0]
                        }
                    }
                    resolve(result_traited)
                })
            })
        })
    }



    deleteById(id, cb) {
        // delete in the db
        connection.query(" SELECT * FROM uploads WHERE id = ? ", [id], (err, result) => {
            if (err) throw err
            if (result.length === 1) {
                let name = result[0].file_name
                    // delete the file
                this.deleteByName(name, cb)
            } else if (result.length === 0) {
                console.log("Aucun ficher avec cet id n'existe dans la base de donnée")
            } else {
                throw "Une erreur de nomanclature est dans la db"
            }
        })
    }

    deleteByName(name, cb) {
        // delete in the db
        connection.query("DELETE FROM uploads WHERE file_name = ?", [name], (err, result) => {
            if (err) throw err
                // delete the file
            this.deleteFile(name, cb)
        })
    }


    deleteFile(name, cb) {
        fs.unlink(paths.uploads + name + paths.audioExtention, (err) => {
            if (err) throw err
            console.log("Fichier supprimé avec succès")
            cb()
        })
    }

    inputFile(file) {
        this.file = this.file || file;
    }

    isAudio(file = null) {
        this.inputFile(file)
        if (this.file.mimetype === "audio/mp3") {
            return true
        } else {
            return false
        }
    }

    save(name, file = null) {
        return new Promise((resolve, reject) => {
            this.inputFile(file)
            this.file.mv(this.PATH + name + this.extention, (err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve()
                    console.log('File uploaded!');
                }
            })
        })

    }

    saveWithDb(id, title) {
        let name = randomstring.generate(11)
        return new Promise((resolve, reject) => {
            this.save(name).then(() => {
                let query = connection.query('INSERT INTO uploads SET ?', {
                        "user_id": id,
                        "file_name": name,
                        "title": title,
                        "upload_date": new Date()
                    },
                    (err, result) => {
                        if (err) reject(err)
                        resolve(result)
                    });
            }).catch(err => {
                reject(err)
            })
        })

    }

}

module.exports = AudioFile