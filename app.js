import { existsSync, readFileSync } from 'fs';
import express from 'express';
var app = express();

const handleRequest = (req, res) => {
    let verb = req.method.toLowerCase();
    let safePath = getActualPath(req.path.slice(1))
    if (!safePath) {
        res.status(404).send('Response for ' + req.path + ' is not present, and no fallbacks were available.');
        return;
    }

    let json = getStaticData(safePath);
    if (!checkStaticData(json, verb)) {
        res.status(404).send('Response file ' + safePath + ' does not have a response for ' + verb);
        return;
    }

    res.status(json[verb].statusCode).json(json[verb].response);
}

const getActualPath = route => {
    let tokens = route.split('/');

    let path = tokens.slice(0, tokens.length - 1).reduce(getActualFolder, []);
    if (!path) return undefined;

    let file = getActualFile(path, tokens[tokens.length - 1]);
    if (!file) return undefined;

    return [...path, file].join('/');
}

const getActualFolder = (path, token) =>
    !path || path.some(p => !p)
        ? undefined
        : existsSync([...path, token].join('/'))
            ? [...path, token]
            : existsSync([...path, '_'].join('/'))
                ? [...path, '_']
                : undefined;

const getActualFile = (path, file) =>
    existsSync([...path, file + '.json'].join('/'))
        ? file + '.json'
        : existsSync([...path, '_.json'].join('/'))
            ? '_.json'
            : undefined;

const checkStaticData = (json, verb) =>
    json.hasOwnProperty(verb)
    && json[verb].hasOwnProperty('statusCode')
    && json[verb].hasOwnProperty('response');

const getStaticData = path =>
    JSON.parse(readFileSync(path));

app.all('*', handleRequest);
var server = app.listen(3000, () =>
    console.log("static-api running on port.", server.address().port)
);