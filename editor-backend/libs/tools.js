module.exports.pick = (names, source) => {
    const ret = {}
    names.split(' ')
        .forEach(key => {
            if (source.hasOwnProperty(key))
                ret[key] = source[key]
        })
    return ret
}

