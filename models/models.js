const sequelize = require('../db')
const {DataTypes} = require('sequelize')

const User = sequelize.define('user', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    email: {type: DataTypes.STRING, unique: true},
    address: {type: DataTypes.STRING, allowNull: true},
    username: {type: DataTypes.STRING, unique: true, allowNull: true},
    password: {type: DataTypes.STRING, allowNull: false},
    role: {type: DataTypes.STRING, defaultValue: 'CUSTOMER', allowNull: false},
    name: {type: DataTypes.STRING, allowNull: false},
    isActivated: {type: DataTypes.BOOLEAN, defaultValue: false},
    activationLink: {type: DataTypes.STRING},
    telephone: {type: DataTypes.STRING, unique: true},
    vkId: {type: DataTypes.INTEGER, unique: true},
    lastVisitDate: {type: DataTypes.DATE}
})

const UserRefreshToken = sequelize.define('user_refresh_token', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    refreshToken: {type: DataTypes.STRING},
})

const Basket = sequelize.define('basket', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
}, {timestamps: false})

const BasketProduct = sequelize.define('basket_product', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    qty: {type: DataTypes.INTEGER, defaultValue: 1, allowNull: false},
    status: {type: DataTypes.STRING, allowNull: true},
})

const Order = sequelize.define('order', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    orderNumber: {type: DataTypes.STRING, unique: true, allowNull: false},
    accessLink: {type: DataTypes.STRING, unique: true, allowNull: false},
    orderAddress: {type: DataTypes.STRING, allowNull: true},
    customerEmail: {type: DataTypes.STRING, allowNull: true},
    customerName: {type: DataTypes.STRING, allowNull: false},
    customerTel: {type: DataTypes.STRING, allowNull: false},
    salesSum: {type: DataTypes.INTEGER},
    bonusPointsUsed: {type: DataTypes.FLOAT, allowNull: true},
    orderDiscount: {type: DataTypes.FLOAT, allowNull: true},
    discountedSalesSum: {type: DataTypes.INTEGER, allowNull: false},
    extraBonus: {type: DataTypes.FLOAT},
    accruedBonus: {type: DataTypes.FLOAT, allowNull: true},
    deliverySum: {type: DataTypes.INTEGER, allowNull: true},
    status: {type: DataTypes.STRING, allowNull: false, defaultValue: 'Создан'},
    comment: {type: DataTypes.STRING, allowNull: true, defaultValue: ''},
    read: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false}

})

const OrderItem = sequelize.define( 'order_item', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    price: {type: DataTypes.INTEGER, allowNull: false},
    discountedPrice: {type: DataTypes.FLOAT, allowNull: true},
    qty: {type: DataTypes.INTEGER, allowNull: false},
    sum: {type: DataTypes.INTEGER, allowNull: false},
    name: {type: DataTypes.STRING, allowNull: false}
}, {timestamps: false})

const BonusPoint = sequelize.define('bonus_point', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    currentQty: {type: DataTypes.FLOAT, defaultValue: 0, allowNull: false},
    frozenPoints: {type: DataTypes.FLOAT, defaultValue: 0, allowNull: true}
}, { timestamps: false })

const BonusPointsLog = sequelize.define('bonus_points_log', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    qtyChanges: {type: DataTypes.STRING, allowNull: false},
    description: {type: DataTypes.STRING, allowNull: false}
})

const Promotion = sequelize.define('promotion', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    description: {type: DataTypes.TEXT, allowNull: true},
    validSince: {type: DataTypes.DATEONLY, allowNull: false},
    validUntil: {type: DataTypes.DATEONLY, allowNull: false},
    img: {type: DataTypes.STRING, allowNull: false},
    link: {type: DataTypes.STRING, defaultValue: ''},
    index: {type: DataTypes.INTEGER, defaultValue: 0}
})

const Category = sequelize.define('category', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, allowNull: false},
    description: {type: DataTypes.STRING, allowNull: true},
    ordering: {type: DataTypes.INTEGER, defaultValue: 100},
    published: {type: DataTypes.BOOLEAN, defaultValue: false}
}, {timestamps: false})

const CategoryImages = sequelize.define('category_images', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    img: {type: DataTypes.STRING, allowNull: true}
}, {timestamps: false})

const Product = sequelize.define('product', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    SKU: {type: DataTypes.STRING, unique: true, allowNull: false},
    title: {type: DataTypes.STRING, allowNull: false},
    shortDescription: {type: DataTypes.STRING, allowNull: true},
    description: {type: DataTypes.TEXT, allowNull: true, defaultValue: ''},
    weight: {type: DataTypes.INTEGER, allowNull: true},
    price: {type: DataTypes.FLOAT, defaultValue: null, allowNull: true},
    discountedPrice: {type: DataTypes.INTEGER, defaultValue: null, allowNull: true},
    metaTitle: {type: DataTypes.STRING, allowNull: true, defaultValue: ''},
    metaDescription: {type: DataTypes.STRING, allowNull: true, defaultValue: ''},
    indexNumber: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 9999},
    searchKeys: {type: DataTypes.TEXT, allowNull: true},
    pack: {type: DataTypes.INTEGER, defaultValue: 1},
    special: {type: DataTypes.BOOLEAN, defaultValue: false},
    published: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false},
    inStock: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true},
    hidden: {type: DataTypes.BOOLEAN, defaultValue: false},
    specialBonus: {type: DataTypes.FLOAT, defaultValue: 0}
}, {timestamps: false})

const ProductImages = sequelize.define('product_images', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    img: {type: DataTypes.STRING, allowNull: true},
    master: {type: DataTypes.BOOLEAN, defaultValue: false}
}, {timestamps: false})

const Brand = sequelize.define('brand', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, allowNull: false, unique: true},
    img: {type: DataTypes.STRING, allowNull: true},
    published: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false}
}, {timestamps: false})

const ProductAttributeCategory = sequelize.define('product_attribute_category', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, allowNull: false},
    published: {type: DataTypes.BOOLEAN, defaultValue: true}
}, {timestamps: false})

const ProductAttribute = sequelize.define('product_attribute', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    value: {type: DataTypes.STRING, allowNull: false},
}, {timestamps: false})

const PaymentMethod = sequelize.define('payment_method', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, unique: true}
}, {timestamps: false})

const DeliveryMethod = sequelize.define('delivery_method', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, unique: true},
    price: {type: DataTypes.INTEGER, allowNull: false},
    freeSum: {type: DataTypes.INTEGER, allowNull: true},
    minSum: {type: DataTypes.INTEGER, allowNull: true}
}, {timestamps: false})

const Product_Category = sequelize.define('Product_Category', {
    productId: {type: DataTypes.INTEGER},
    categoryId: {type: DataTypes.INTEGER},
}, {
    timestamps: false,
    freezeTableName: true,
    tableName: `Product_Category`,
})

const Product_ProductAttribute = sequelize.define('Product_ProductAttribute', {
    productId: {type: DataTypes.INTEGER},
    productAttributeId: {type: DataTypes.INTEGER}
},{
    timestamps: false,
    freezeTableName: true,
    tableName: 'Product_ProductAttribute'
})

User.hasOne(BonusPoint)
BonusPoint.belongsTo(User)

Category.hasMany(CategoryImages)
CategoryImages.belongsTo(Category)

User.hasOne(UserRefreshToken)
UserRefreshToken.belongsTo(User)

BonusPoint.hasMany(BonusPointsLog)
BonusPointsLog.belongsTo(BonusPoint)

User.hasOne(Basket)
Basket.belongsTo(User)

User.hasMany(Order)
Order.belongsTo(User)

Basket.hasMany(BasketProduct)
BasketProduct.belongsTo(Basket)

Product.hasMany(BasketProduct)
BasketProduct.belongsTo(Product)

Brand.hasMany(Product)
Product.belongsTo(Brand)

Product.hasMany(ProductImages)
ProductImages.belongsTo(Product)

ProductAttribute.belongsTo(ProductAttributeCategory)
ProductAttributeCategory.hasMany(ProductAttribute)

ProductAttribute.belongsToMany(Product, {through: 'Product_ProductAttribute', as: 'product'})
Product.belongsToMany(ProductAttribute, {through: 'Product_ProductAttribute', as: 'productAttribute'})

PaymentMethod.hasMany(Order)
Order.belongsTo(PaymentMethod)

DeliveryMethod.hasMany(Order)
Order.belongsTo(DeliveryMethod)

Order.hasMany(OrderItem)
OrderItem.belongsTo(Order)

Product.hasOne(OrderItem)
OrderItem.belongsTo(Product)

Order.hasOne(BonusPointsLog)
BonusPointsLog.belongsTo(Order)

Product.hasMany(Product, {as: "children", foreignKey: "productId"})
Product.belongsTo(Product, {as: "parent", foreignKey: "productId"})

Category.hasMany(Category, {as: "children", foreignKey: "categoryId"})
Category.belongsTo(Category, {as: "parent", foreignKey: "categoryId"})

Category.belongsToMany(Product, {through: 'Product_Category', as: 'product'})
Product.belongsToMany(Category, {through: 'Product_Category', as: 'category'})

module.exports = {
    Promotion,
    User,
    UserRefreshToken,
    Basket,
    BasketProduct,
    Order,
    OrderItem,
    BonusPoint,
    BonusPointsLog,
    Category,
    CategoryImages,
    Product,
    ProductImages,
    Brand,
    ProductAttributeCategory,
    ProductAttribute,
    PaymentMethod,
    DeliveryMethod,
    Product_Category,
    Product_ProductAttribute
}