'use strict';

const Service = require('egg').Service;
const CryptoJS = require('crypto-js');

class CryptoService extends Service {
  sha256(text = '') {
    return CryptoJS.SHA256(text).toString();
  }

  md5(text) {
    return CryptoJS.MD5(text.toString()).toString().toUpperCase();
  }
}

module.exports = CryptoService;
