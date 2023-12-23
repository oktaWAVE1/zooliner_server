const Fuse = require ("fuse.js");
const config = require("../config");

async function fuseSearch(products, query, limit) {
    for (let p of products){
        p.search = `${p.title} ${p.shortDescription} ${p.SKU}`
    }
    const fuse = new Fuse(products, config.fuseOptions)
    const result = fuse.search(query, {limit: limit || config.fuseLimit})

    return result
}

module.exports = {
    fuseSearch
}