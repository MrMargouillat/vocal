const account = require("./models/account/account")

account.getByPseudo("mrmargouillat").then((res) => {
    console.log(res);
})