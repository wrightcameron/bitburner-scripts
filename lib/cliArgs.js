export function cliArgDict(args) {
    let argDict = {};
    for(let arg of args) {
        let pair = arg.split('=')
        argDict[pair[0]] = pair[1]
    }
    return argDict;
}

export function checkForArg(argDict, key, backup){
    let value;
    if(key in argDict){
        value = argDict[key]
    } else {
        value = backup;
    }
    return value
}

export function checkForBooleanArg(argDict, key, backup){
    let value;
    if(key in argDict){
        //TODO Need some way to check if value is false
        value = true
    } else {
        value = backup;
    }
    return value
}
