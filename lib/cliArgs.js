/**
 * Convert list of CLI arguments to dictionary w
 * @param {*} args 
 * @returns 
 */
export function cliArgDict(args) {
    let argDict = {};
    for(let arg of args) {
        let pair = arg.split('=')
        argDict[pair[0]] = pair[1]
    }
    return argDict;
}

/**
 * 
 * @param {*} argDict 
 * @param {*} key 
 * @param {*} backup 
 * @returns 
 */
export function checkForArg(argDict, key, backup){
    let value;
    if(key in argDict){
        value = argDict[key]
    } else {
        value = backup;
    }
    return value
}

/**
 * 
 * @param {*} argDict 
 * @param {*} key 
 * @param {*} backup 
 * @returns 
 */
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
