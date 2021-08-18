const mysql = require('mysql')
const mainConf = require('./../libs/mainConf.js')

module.exports.formats = (clientId) => {
    return new Promise((resolve, reject) => {
        const con1 = mysql.createConnection(mainConf.vpsDb);
        con1.connect();
        con1.query('select * from users_settings where ID=?', [clientId], (err, rows) => {
            con1.end()
            if (err) reject(err)
            const con2 = mysql.createConnection({
                host: 'localhost',//TODO
                user: 'v_pieknydruk',//TODO
                password: rows[0].dbpass,
                database: rows[0].database
            })
            con2.connect()
            con2.query('select * from ps_products_formats', (err, rows) => {
                if (err) reject(err)
                resolve(rows)
            })
        })
    })
}