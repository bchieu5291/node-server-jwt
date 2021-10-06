function diacriticSensitiveRegex(string = '') {
    return string
        .replace(/a/g, '[a,á,à,ả,ã,ạ]')
        .replace(/e/g, '[e,è,é,ẻ,ẽ,ẹ]')
        .replace(/i/g, '[i,ì,í,ỉ,ĩ,ị]')
        .replace(/o/g, '[o,ò,ó,ỏ,õ,ọ]')
        .replace(/u/g, '[u,ù,ú,ủ,ũ,ụ]')
        .replace(/y/g, '[y,ỳ,ý,ỷ,ỹ,ỵ]')
}

module.exports = {
    diacriticSensitiveRegex,
}
