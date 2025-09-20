const sequelize = require('../db_remote')
const {DataTypes} = require('sequelize')


const ProductRemote = sequelize.define('productsRemote', {
    Код: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    Артикул: {type: DataTypes.STRING},
    Наименование: {type: DataTypes.STRING},
    "Наименование (крат опис)": {type: DataTypes.STRING},
    производитель: {type: DataTypes.INTEGER},
    id_родительского: {type: DataTypes.STRING},
    Цена: {type: DataTypes.FLOAT},
    sku_родительского: {type: DataTypes.STRING},
    "Ключи для поиска": {type: DataTypes.STRING},
    "Полное описание": {type: DataTypes.STRING},
    Вес: {type: DataTypes.INTEGER},
    Комментарий: {type: DataTypes.STRING},
    "На удаление": {type: DataTypes.BOOLEAN},
    // "Наценка": {type: DataTypes.FLOAT},
    Published: {type: DataTypes.INTEGER},
    product_in_stock: {type: DataTypes.INTEGER},
    product_in_stock_OM: {type: DataTypes.INTEGER},
    Порядок: {type: DataTypes.INTEGER},
    // "Закуп последний": {type: DataTypes.FLOAT},
    "Базовая цена": {type: DataTypes.FLOAT},
    "Единица измерения": {type: DataTypes.STRING},
    // "Средний закуп": {type: DataTypes.FLOAT},
    Акция: {type: DataTypes.BOOLEAN},
    "Развесной пакет": {type: DataTypes.BOOLEAN},
    "Нет штрихкода": {type: DataTypes.BOOLEAN},
    КассаНазвание: {type: DataTypes.STRING},
    PreviousPrice: {type: DataTypes.FLOAT},
    ABC: {type: DataTypes.STRING},
    updatedAt: {type: DataTypes.DATE, allowNull: false, default: Date.now()}
}, {
    timestamps: false,
    freezeTableName: true,
    tableName: `Товары`,
    charset: 'utf8',
    collate: 'utf8_unicode_ci'
        }
)

const OrderRemote = sequelize.define('ordersRemote', {
    Счетчик: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    Дата: {type: DataTypes.INTEGER, default: Date.now()},
    Описание: {type: DataTypes.STRING},
    Выполнено: {type: DataTypes.BOOLEAN}
}, {
        timestamps: false,
        freezeTableName: true,
        tableName: `ЗаказыОбщая`,
        charset: 'utf8',
        collate: 'utf8_unicode_ci'
    }
)

const CategoryRemote = sequelize.define('categoriesRemote', {
        id_категории: {type: DataTypes.INTEGER},
        "название категории": {type: DataTypes.STRING, primaryKey: true}
    }, {
        timestamps: false,
        freezeTableName: true,
        tableName: `Категории`,
        charset: 'utf8',
        collate: 'utf8_unicode_ci'
    }
)

const CategoryProductRemote = sequelize.define('categoriesOfProductsRemote', {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        код_товара: {type: DataTypes.INTEGER},
        название_категории: {type: DataTypes.STRING},
        Порядок: {type: DataTypes.INTEGER}
    }, {
        timestamps: false,
        freezeTableName: true,
        tableName: `Категории товаров`,
        charset: 'utf8',
        collate: 'utf8_unicode_ci'
    }
)

const CustomersRemote = sequelize.define('customersRemote', {
        Код: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        Имя: {type: DataTypes.STRING},
        Телефон: {type: DataTypes.STRING},
        Адрес: {type: DataTypes.STRING},
        Комментарий: {type: DataTypes.STRING}
    }, {
        timestamps: false,
        freezeTableName: true,
        tableName: `Клиенты`,
        charset: 'utf8',
        collate: 'utf8_unicode_ci'
    }
)

const ManufacturersRemote = sequelize.define('manufacturersRemote', {
        id_производителя: {type: DataTypes.INTEGER},
        "Название производителя": {type: DataTypes.STRING, primaryKey: true},
    }, {
        timestamps: false,
        freezeTableName: true,
        tableName: `Производители`,
        charset: 'utf8',
        collate: 'utf8_unicode_ci'
    }
)

const SellsRemote = sequelize.define('sellsRemote', {
        Счетчик: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        "№ реализации": {type: DataTypes.INTEGER},
        "Код магазина": {type: DataTypes.STRING},
        Дата: {type: DataTypes.DATE},
        "Код товара": {type: DataTypes.INTEGER},
        Наименование: {type: DataTypes.STRING},
        Количество: {type: DataTypes.INTEGER},
        Цена: {type: DataTypes.FLOAT},
        "ЕдИзм": {type: DataTypes.STRING},
        Сумма: {type: DataTypes.FLOAT},
        Скидка: {type: DataTypes.FLOAT},
        "Сумма скидки": {type: DataTypes.FLOAT},
    }, {
        timestamps: false,
        freezeTableName: true,
        tableName: `Реализации`,
        charset: 'utf8',
        collate: 'utf8_unicode_ci'
    }
)

const SellsCounterRemote = sequelize.define('sellsCounterRemote', {
        Счетчик: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        "Код магазина": {type: DataTypes.STRING},
        Проведение: {type: DataTypes.BOOLEAN},
        Безнал: {type: DataTypes.BOOLEAN},
        onlineOrderNumber: {type: DataTypes.BIGINT},
        userId: {type: DataTypes.INTEGER},
        deliveryId: {type: DataTypes.INTEGER},
        customDeliveryName: {type: DataTypes.STRING},
        discount: {type: DataTypes.FLOAT, default: 0},
        discountDescription: {type: DataTypes.STRING},
        siteOrderId: {type: DataTypes.BIGINT},
        siteUserId: {type: DataTypes.INTEGER},
        bonusPointsUsed: {type: DataTypes.FLOAT, default: 0},
        refund: {type: DataTypes.BOOLEAN, default: false, allowNull: false},
        life_pos_id: {type: DataTypes.BIGINT, allowNull: true}

    }, {
        timestamps: false,
        freezeTableName: true,
        tableName: `Счетчик реализаций`,
        charset: 'utf8',
        collate: 'utf8_unicode_ci'
    }
)

const DeliveryRemote = sequelize.define('deliveryRemote', {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        name: {type: DataTypes.STRING},
        freeSum: {type: DataTypes.INTEGER},
        cost: {type: DataTypes.INTEGER},

    }, {
        timestamps: false,
        freezeTableName: true,
        tableName: `Delivery`,
        charset: 'utf8',
        collate: 'utf8_unicode_ci'
    }
)


ProductRemote.hasMany(CategoryProductRemote, {foreignKey: 'код_товара', foreignKeyConstraint: true})
CategoryProductRemote.belongsTo(ProductRemote, {foreignKey: 'код_товара'})

CategoryRemote.hasMany(CategoryProductRemote, {foreignKey: "название_категории", sourceKey: "название категории"})
CategoryProductRemote.belongsTo(CategoryRemote, {foreignKey: "название_категории"})

SellsCounterRemote.hasMany(SellsRemote, {foreignKey: '№ реализации'})
SellsRemote.belongsTo(SellsCounterRemote, {foreignKey: 'Счетчик'})

ProductRemote.hasMany(ProductRemote, {as: "children", foreignKey: 'id_родительского', foreignKeyConstraint: true})
ProductRemote.belongsTo(ProductRemote, {as: "parent", foreignKey: 'id_родительского', foreignKeyConstraint: true})

SellsCounterRemote.belongsTo(DeliveryRemote, {foreignKey: "deliveryId"})
DeliveryRemote.hasMany(SellsCounterRemote, {foreignKey: "deliveryId"})

SellsCounterRemote.belongsTo(CustomersRemote, {foreignKey: "userId"})
CustomersRemote.hasMany(SellsCounterRemote, {foreignKey: "userId"})

module.exports = {
    ProductRemote,
    OrderRemote,
    CategoryRemote,
    CategoryProductRemote,
    CustomersRemote,
    ManufacturersRemote,
    SellsRemote,
    SellsCounterRemote,
    DeliveryRemote,
}