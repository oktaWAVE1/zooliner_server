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
    orderStatuses: {
        canceled: "Отменен",
        created: "Создан",
        customer_approved: "Подтвержден",
        approved: "В работе",
        done: "Выполнен"
    }
};