const interceptorError = require('../controladores/interceptorErrores');
const rutasApi = require('express');



rutasApi.request('/', interceptorError);

module.exports = rutasApi;