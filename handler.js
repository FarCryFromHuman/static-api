const fs = require('fs');
const jsonTryParse = require('json-try-parse');

const handleRequest = (req, res) => {
    let method = req.method.toLowerCase();
    let safePath = getActualPath(`static-json${req.path}`)
    if (!safePath.successful) {
        res.status(404).send(`Response for '${req.path}' is not present, and no fallbacks were available.`);
        return;
    }

    let json = getStaticData(safePath.path);
    if (!json.successful) {
        res.status(404).send(`Response file '${safePath.path}' is not valid JSON.`);
        return;
    }
    console.debug(json.body);

    if (!checkStaticData(json.body, method)) {
        res.status(404).send(`Response file '${safePath.path}' does not have a response for '${method}'.`);
        return;
    }

    res.status(json.body[method].statusCode).json(json.body[method].body);
}

const getActualPath = route => {
    let tokens = route.split('/');

    let path = tokens.slice(0, tokens.length - 1).reduce(getActualFolder, []);
    if (!path) return { successful: false, path: undefined };

    let file = getActualFile(path, tokens[tokens.length - 1]);
    if (!file) return { successful: false, path: undefined };

    return { successful: true, path: [...path, file].join('/') };
}

const getActualFolder = (path, token) =>
    !path || path.some(p => !p)
        ? undefined
        : fs.existsSync([...path, token].join('/'))
            ? [...path, token]
            : fs.existsSync([...path, '_'].join('/'))
                ? [...path, '_']
                : undefined;

const getActualFile = (path, file) =>
    fs.existsSync([...path, `${file}.json`].join('/'))
        ? file + '.json'
        : fs.existsSync([...path, '_.json'].join('/'))
            ? '_.json'
            : undefined;

const checkStaticData = (json, method) =>
    json.hasOwnProperty(method)
    && json[method].hasOwnProperty('statusCode')
    && json[method].hasOwnProperty('body');

const getStaticData = path => {
    let json = jsonTryParse(fs.readFileSync(path));
    return { successful: !!json, body: json };
}

exports.handler = handleRequest;