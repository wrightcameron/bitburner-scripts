/**
 * Convert list of CLI arguments to dictionary based on key=value arguements.
 * @param {List} args command line argument strings in list 
 * @returns args dictionary
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
 * Check argument dictionary for key, return its value.  If the key isn't found return backup
 * @param {*} argDict argument dictionary
 * @param {*} key dictionary key
 * @param {*} backup value incase key isn't found
 * @returns value of dictinary key
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
 * Check for argument dictionary for boolean key.  A boolean flag wouldn't have a value just true or false
 * @param {*} argDict argument dictionary
 * @param {*} key dictionary key
 * @param {*} backup value incase key isn't found
 * @returns boolean valye of dictionary key
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
