var crypto = require('crypto');

function strlen(str){
    return str.length;
}

function strpos(string, find){
    var pos = string.indexOf(find);
    return string.indexOf(find);
}

function md5(string, raw){
    var hash = crypto.createHash('md5');
    hash.update(string, 'binary');
    if(raw)
        return hash.digest('binary');
    else
        return hash.digest('hex');
}

function sixCharRandom()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 6; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function substr(string, start, count){
    return string.substring(start, start + count);
}

function ord(input){
    var r = input.charCodeAt(0);
    return r;
}

var itoa64 = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
var iteration_count_log2 = 8;

function crypt_private(password, setting){
    var output = '*0';
    if (substr(setting, 0, 2) == output)
        output = '*1';

    if (substr(setting, 0, 3) != '$P$')
        return output;

    var count_log2 = strpos(itoa64, setting[3]);
    if (count_log2 < 7 || count_log2 > 30)
        return output;

    var count = 1 << count_log2;

    var salt = substr(setting, 4, 8);
    if (strlen(salt) != 8)
        return output;

    var hash = md5(salt + "" + password, true);
    do {
        hash = md5(hash + "" +  password, true);
    } while (--count);

    output = substr(setting, 0, 12);
    output += encode64(hash, 16);
    return output;
}

function gensalt_private(input){
    var output = '$P$';
    output += itoa64[Math.min(iteration_count_log2 + 5, 30)];
    output += encode64(input, 6);
    return output;
}

function encode64(input, count)
{
    var output = '';
    var i = 0;
    do {
        var value = ord(input[i++]);
        output += itoa64[value & 0x3f];
        if (i < count)
            value |= ord(input[i]) << 8;

        output += itoa64[(value >> 6) & 0x3f];

        if (i++ >= count)
            break;

        if (i < count)
            value |= ord(input[i]) << 16;
        output += itoa64[(value >> 12) & 0x3f];
        if (i++ >= count)
            break;

        output += itoa64[(value >> 18) & 0x3f];
    } while (i < count);

    return output;
}

function EncryptCredentials(password){
    var salt = gensalt_private(sixCharRandom());
    var hash = crypt_private(password, salt);
    return hash;
}

function CheckPassword(password, stored_hash){
    var hash = crypt_private(password, stored_hash);
    return hash == stored_hash;
}

module.exports.EncryptCredentials = EncryptCredentials;
module.exports.CheckPassword = CheckPassword;
