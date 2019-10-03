/**
 * Cryptonote Node.JS Pool
 * https://github.com/dvandal/cryptonote-nodejs-pool
 *
 * Utilities functions
 **/

// Load required module
let crypto = require('crypto');

// Used for calling the address validator
var execSync = require('child_process').execSync;
var base58 = require('base58-native');

// Used for calling the address validator
var execSync = require('child_process').execSync;
var base58 = require('base58-native');

var dateFormat = require('dateformat');
exports.dateFormat = dateFormat;

let cnUtil = require('cryptoforknote-util');
exports.cnUtil = cnUtil;

/**
 * Generate random instance id
 **/
exports.instanceId = function() {
    return crypto.randomBytes(4);
}

/**
 * Run the provided address as well as the pool address throught the validator tool.
 * This allows you to check if the given address is valid and both addresses are on 
 * the same network.
*/
function runValidatorTool(address) {
    var sanitized_user = base58.encode(base58.decode(address));
    var sanitized_payout = base58.encode(base58.decode(config.poolServer.poolAddress));

    var command = config.poolServer.addressValidatorBin+' '+sanitized_user+' '+sanitized_payout;

    var output = execSync(command).toString()

    // you can remove the below regex if you are running at least ryo 0.2.0.1
    // 0.2.0 did not properly quote the key portion of the json and resulted
    // in invalid json parsing. 0.2.0.1 fixes this error.
    output = output.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')
    
    return JSON.parse(output);
}

// Validate miner address
exports.validateMinerAddress = function(address) {
    var info = runValidatorTool(address);

    // this checks to see if the provided address is valid and
    // is on the same network (testnet, mainnet, etc) as the pool
    // info[0] is the miner's address and info[1] is the pool address
    return info[0].valid && info[0].network == info[1].network;
}

// Return if value is an integrated address
exports.isIntegratedAddress = function(address) {
    var info = runValidatorTool(address);
    return info[0].is_integrated;
}

/**
 * Cleanup special characters (fix for non latin characters)
 **/
function cleanupSpecialChars(str) {
    str = str.replace(/[ÀÁÂÃÄÅ]/g,"A");
    str = str.replace(/[àáâãäå]/g,"a");
    str = str.replace(/[ÈÉÊË]/g,"E");
    str = str.replace(/[èéêë]/g,"e");
    str = str.replace(/[ÌÎÏ]/g,"I");
    str = str.replace(/[ìîï]/g,"i");
    str = str.replace(/[ÒÔÖ]/g,"O");
    str = str.replace(/[òôö]/g,"o");
    str = str.replace(/[ÙÛÜ]/g,"U");
    str = str.replace(/[ùûü]/g,"u");
    return str.replace(/[^A-Za-z0-9\-\_]/gi,'');
}
exports.cleanupSpecialChars = cleanupSpecialChars;

/**
 * Get readable hashrate
 **/
exports.getReadableHashRate = function(hashrate){
    let i = 0;
    let byteUnits = [' H', ' KH', ' MH', ' GH', ' TH', ' PH' ];
    while (hashrate > 1000){
        hashrate = hashrate / 1000;
        i++;
    }
    return hashrate.toFixed(2) + byteUnits[i] + '/sec';
}
 
/**
 * Get readable coins
 **/
exports.getReadableCoins = function(coins, digits, withoutSymbol){
    let coinDecimalPlaces = config.coinDecimalPlaces || config.coinUnits.toString().length - 1;
    let amount = (parseInt(coins || 0) / config.coinUnits).toFixed(digits || coinDecimalPlaces);
    return amount + (withoutSymbol ? '' : (' ' + config.symbol));
}

/**
 * Generate unique id
 **/
exports.uid = function(){
    let min = 100000000000000;
    let max = 999999999999999;
    let id = Math.floor(Math.random() * (max - min + 1)) + min;
    return id.toString();
};

/**
 * Ring buffer
 **/
exports.ringBuffer = function(maxSize){
    let data = [];
    let cursor = 0;
    let isFull = false;

    return {
        append: function(x){
            if (isFull){
                data[cursor] = x;
                cursor = (cursor + 1) % maxSize;
            }
            else{
                data.push(x);
                cursor++;
                if (data.length === maxSize){
                    cursor = 0;
                    isFull = true;
                }
            }
        },
        avg: function(plusOne){
            let sum = data.reduce(function(a, b){ return a + b }, plusOne || 0);
            return sum / ((isFull ? maxSize : cursor) + (plusOne ? 1 : 0));
        },
        size: function(){
            return isFull ? maxSize : cursor;
        },
        clear: function(){
            data = [];
            cursor = 0;
            isFull = false;
        }
    };
};
