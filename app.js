const express = require('express');
const handler = require('./handler.js').handler;

const server = express()
    .all('*', handler)
    .listen(3000, () =>
        console.log(`Make HTTP requests to localhost:${server.address().port}/{yourRoute}/{yourResource}`));