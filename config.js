module.exports = {
    fuseOptions: {
        isCaseSensitive: false,
        findAllMatches: true,
        useExtendedSearch: true,
        minMatchCharLength: 2,
        threshold: 0.35,
        distance: 300,
        ignoreLocation: true,
        ignoreFieldNorm: true,
        keys: [
            'search'
        ]
    },
    fuseLimit: 48,
};