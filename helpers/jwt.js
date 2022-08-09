const expressJwt = require('express-jwt').expressjwt;
require('dotenv').config();
const SECRET = process.env.SECRET;
const API_URL = process.env.API_URL;

function authJwt(){

    return expressJwt({
        secret: SECRET,
        algorithms: ['HS256'],
        isRevoked: isRevoked
    }).unless({
        path: [ `${API_URL}/users/login`,
                `${API_URL}/users/register`,
                { url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS'] },
                { url: /\/api\/v1\/categories(.*)/, methods: ['GET', 'OPTIONS'] },
                { url: /\/public(.*)/, methods: ['GET', 'OPTIONS'] }
            ]
    })

}

async function isRevoked(req, token){

    if(!token.payload.isAdmin) {
       return true;
    }
    
}

module.exports = authJwt;