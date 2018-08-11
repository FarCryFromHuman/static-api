const fs = require('fs');

const handleRequest = (req, res) => {
    let method = req.method.toLowerCase();
    let safePath = getActualPath(req.path.slice(1))
    if (!safePath) {
        res.status(404).send('Response for ' + req.path + ' is not present, and no fallbacks were available.');
        return;
    }

    let json = getStaticData(safePath);
    if (!checkStaticData(json, method)) {
        res.status(404).send('Response file ' + safePath + ' does not have a response for ' + method);
        return;
    }

    res.status(json[method].statusCode).json(json[method].body);
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
        : fs.existsSync([...path, token].join('/'))
            ? [...path, token]
            : fs.existsSync([...path, '_'].join('/'))
                ? [...path, '_']
                : undefined;

const getActualFile = (path, file) =>
    fs.existsSync([...path, file + '.json'].join('/'))
        ? file + '.json'
        : fs.existsSync([...path, '_.json'].join('/'))
            ? '_.json'
            : undefined;

const checkStaticData = (json, verb) =>
    json.hasOwnProperty(verb)
    && json[verb].hasOwnProperty('statusCode')
    && json[verb].hasOwnProperty('body');

const getStaticData = path =>
    JSON.parse(fs.readFileSync(path));

exports.handler = handleRequest;