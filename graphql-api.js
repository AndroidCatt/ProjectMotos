// GraphQL API System - Sistema GraphQL v10.0
// API GraphQL completa con queries, mutations, subscriptions

class GraphQLAPI {
    constructor() {
        this.schema = this.defineSchema();
        this.resolvers = this.defineResolvers();
        this.subscriptions = new Map();
        this.subscriptionId = 0;

        console.log('[GraphQL] API inicializada');
    }

    // ============================================
    // SCHEMA DEFINITION
    // ============================================

    defineSchema() {
        return `
            type Query {
                # Productos
                products(filter: ProductFilter, pagination: Pagination): ProductConnection!
                product(id: ID!): Product
                searchProducts(query: String!): [Product!]!

                # Usuarios
                me: User
                user(id: ID!): User
                users(pagination: Pagination): UserConnection!

                # Pedidos
                orders(pagination: Pagination): OrderConnection!
                order(id: ID!): Order

                # Reviews
                reviews(productId: ID!): [Review!]!

                # Analytics
                analytics(period: Int): AnalyticsData!
            }

            type Mutation {
                # Auth
                register(input: RegisterInput!): AuthPayload!
                login(input: LoginInput!): AuthPayload!
                logout: Boolean!

                # Productos
                createProduct(input: ProductInput!): Product!
                updateProduct(id: ID!, input: ProductInput!): Product!
                deleteProduct(id: ID!): Boolean!

                # Pedidos
                createOrder(input: OrderInput!): Order!
                updateOrderStatus(id: ID!, status: OrderStatus!): Order!

                # Reviews
                createReview(input: ReviewInput!): Review!
                deleteReview(id: ID!): Boolean!

                # Carrito
                addToCart(productId: ID!, quantity: Int!): Cart!
                removeFromCart(productId: ID!): Cart!
                clearCart: Boolean!
            }

            type Subscription {
                # Pedidos
                orderUpdated(userId: ID!): Order!

                # Chat
                messageReceived(room: String!): Message!

                # Notificaciones
                notificationReceived(userId: ID!): Notification!

                # Analytics
                statsUpdated: AnalyticsData!
            }

            # Types
            type Product {
                id: ID!
                name: String!
                description: String!
                price: Float!
                originalPrice: Float
                discount: Int
                brand: String!
                category: String!
                image: String!
                stock: Int!
                rating: Float
                reviewCount: Int
                tags: [String!]
                createdAt: String!
                updatedAt: String!
            }

            type User {
                id: ID!
                username: String!
                email: String!
                fullName: String
                phone: String
                role: UserRole!
                avatar: String
                createdAt: String!
                orders: [Order!]
                reviews: [Review!]
            }

            type Order {
                id: ID!
                userId: ID!
                user: User
                items: [OrderItem!]!
                subtotal: Float!
                shipping: Float!
                discount: Float!
                total: Float!
                status: OrderStatus!
                paymentMethod: String!
                shippingMethod: String!
                shippingAddress: Address!
                tracking: TrackingInfo
                createdAt: String!
                updatedAt: String!
            }

            type OrderItem {
                productId: ID!
                product: Product
                quantity: Int!
                price: Float!
                subtotal: Float!
            }

            type Review {
                id: ID!
                userId: ID!
                user: User
                productId: ID!
                product: Product
                rating: Int!
                title: String!
                comment: String!
                helpful: Int!
                createdAt: String!
            }

            type Cart {
                userId: ID!
                items: [CartItem!]!
                subtotal: Float!
                itemCount: Int!
            }

            type CartItem {
                productId: ID!
                product: Product!
                quantity: Int!
                price: Float!
                subtotal: Float!
            }

            type Address {
                street: String!
                city: String!
                state: String!
                zipCode: String!
                country: String!
            }

            type TrackingInfo {
                status: String!
                steps: [TrackingStep!]!
                estimatedDelivery: String
            }

            type TrackingStep {
                status: String!
                description: String!
                timestamp: String!
                location: String
            }

            type Message {
                id: ID!
                userId: ID!
                username: String!
                text: String!
                room: String!
                timestamp: String!
            }

            type Notification {
                id: ID!
                userId: ID!
                type: String!
                title: String!
                message: String!
                read: Boolean!
                timestamp: String!
            }

            type AnalyticsData {
                uniqueUsers: Int!
                sessions: Int!
                pageViews: Int!
                bounceRate: Float!
                avgSessionDuration: Float!
                topProducts: [ProductStats!]!
                topCategories: [CategoryStats!]!
            }

            type ProductStats {
                productId: ID!
                name: String!
                views: Int!
                sales: Int!
                revenue: Float!
            }

            type CategoryStats {
                category: String!
                productCount: Int!
                sales: Int!
                revenue: Float!
            }

            type AuthPayload {
                token: String!
                user: User!
            }

            type ProductConnection {
                edges: [ProductEdge!]!
                pageInfo: PageInfo!
                totalCount: Int!
            }

            type ProductEdge {
                node: Product!
                cursor: String!
            }

            type UserConnection {
                edges: [UserEdge!]!
                pageInfo: PageInfo!
                totalCount: Int!
            }

            type UserEdge {
                node: User!
                cursor: String!
            }

            type OrderConnection {
                edges: [OrderEdge!]!
                pageInfo: PageInfo!
                totalCount: Int!
            }

            type OrderEdge {
                node: Order!
                cursor: String!
            }

            type PageInfo {
                hasNextPage: Boolean!
                hasPreviousPage: Boolean!
                startCursor: String
                endCursor: String
            }

            # Inputs
            input ProductFilter {
                category: String
                brand: String
                minPrice: Float
                maxPrice: Float
                inStock: Boolean
                search: String
            }

            input Pagination {
                first: Int
                after: String
                last: Int
                before: String
            }

            input RegisterInput {
                username: String!
                email: String!
                password: String!
                fullName: String
                phone: String
            }

            input LoginInput {
                username: String!
                password: String!
            }

            input ProductInput {
                name: String!
                description: String!
                price: Float!
                brand: String!
                category: String!
                image: String!
                stock: Int!
                tags: [String!]
            }

            input OrderInput {
                items: [OrderItemInput!]!
                paymentMethod: String!
                shippingMethod: String!
                shippingAddress: AddressInput!
            }

            input OrderItemInput {
                productId: ID!
                quantity: Int!
            }

            input AddressInput {
                street: String!
                city: String!
                state: String!
                zipCode: String!
                country: String!
            }

            input ReviewInput {
                productId: ID!
                rating: Int!
                title: String!
                comment: String!
            }

            # Enums
            enum UserRole {
                USER
                ADMIN
                MODERATOR
            }

            enum OrderStatus {
                PENDING
                PROCESSING
                SHIPPED
                DELIVERED
                CANCELLED
            }
        `;
    }

    // ============================================
    // RESOLVERS
    // ============================================

    defineResolvers() {
        return {
            Query: {
                products: (parent, args) => this.getProducts(args),
                product: (parent, args) => this.getProduct(args.id),
                searchProducts: (parent, args) => this.searchProducts(args.query),
                me: () => this.getCurrentUser(),
                user: (parent, args) => this.getUser(args.id),
                users: (parent, args) => this.getUsers(args),
                orders: (parent, args) => this.getOrders(args),
                order: (parent, args) => this.getOrder(args.id),
                reviews: (parent, args) => this.getReviews(args.productId),
                analytics: (parent, args) => this.getAnalytics(args.period)
            },

            Mutation: {
                register: (parent, args) => this.register(args.input),
                login: (parent, args) => this.login(args.input),
                logout: () => this.logout(),
                createProduct: (parent, args) => this.createProduct(args.input),
                updateProduct: (parent, args) => this.updateProduct(args.id, args.input),
                deleteProduct: (parent, args) => this.deleteProduct(args.id),
                createOrder: (parent, args) => this.createOrder(args.input),
                updateOrderStatus: (parent, args) => this.updateOrderStatus(args.id, args.status),
                createReview: (parent, args) => this.createReview(args.input),
                deleteReview: (parent, args) => this.deleteReview(args.id),
                addToCart: (parent, args) => this.addToCart(args.productId, args.quantity),
                removeFromCart: (parent, args) => this.removeFromCart(args.productId),
                clearCart: () => this.clearCart()
            },

            Subscription: {
                orderUpdated: (userId) => this.subscribeToOrderUpdates(userId),
                messageReceived: (room) => this.subscribeToMessages(room),
                notificationReceived: (userId) => this.subscribeToNotifications(userId),
                statsUpdated: () => this.subscribeToStats()
            },

            // Field resolvers
            Product: {
                rating: (parent) => this.getProductRating(parent.id),
                reviewCount: (parent) => this.getProductReviewCount(parent.id)
            },

            User: {
                orders: (parent) => this.getUserOrders(parent.id),
                reviews: (parent) => this.getUserReviews(parent.id)
            },

            Order: {
                user: (parent) => this.getUser(parent.userId),
                items: (parent) => this.getOrderItems(parent.id)
            },

            OrderItem: {
                product: (parent) => this.getProduct(parent.productId),
                subtotal: (parent) => parent.quantity * parent.price
            },

            Review: {
                user: (parent) => this.getUser(parent.userId),
                product: (parent) => this.getProduct(parent.productId)
            }
        };
    }

    // ============================================
    // QUERY IMPLEMENTATIONS
    // ============================================

    getProducts({ filter = {}, pagination = {} }) {
        let products = this.loadProducts();

        // Aplicar filtros
        if (filter.category) {
            products = products.filter(p => p.category === filter.category);
        }
        if (filter.brand) {
            products = products.filter(p => p.brand === filter.brand);
        }
        if (filter.minPrice !== undefined) {
            products = products.filter(p => p.price >= filter.minPrice);
        }
        if (filter.maxPrice !== undefined) {
            products = products.filter(p => p.price <= filter.maxPrice);
        }
        if (filter.inStock) {
            products = products.filter(p => p.stock > 0);
        }
        if (filter.search) {
            const query = filter.search.toLowerCase();
            products = products.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query)
            );
        }

        // Aplicar paginación
        const { first = 10, after } = pagination;
        const startIndex = after ? parseInt(after) : 0;
        const paginatedProducts = products.slice(startIndex, startIndex + first);

        const edges = paginatedProducts.map((product, index) => ({
            node: product,
            cursor: (startIndex + index).toString()
        }));

        return {
            edges,
            pageInfo: {
                hasNextPage: startIndex + first < products.length,
                hasPreviousPage: startIndex > 0,
                startCursor: edges[0]?.cursor,
                endCursor: edges[edges.length - 1]?.cursor
            },
            totalCount: products.length
        };
    }

    getProduct(id) {
        const products = this.loadProducts();
        return products.find(p => p.id === id) || null;
    }

    searchProducts(query) {
        const products = this.loadProducts();
        const searchQuery = query.toLowerCase();

        return products.filter(p =>
            p.name.toLowerCase().includes(searchQuery) ||
            p.description.toLowerCase().includes(searchQuery) ||
            p.brand.toLowerCase().includes(searchQuery) ||
            p.category.toLowerCase().includes(searchQuery)
        );
    }

    getCurrentUser() {
        const user = window.authSystem?.getCurrentUser();
        return user || null;
    }

    getUser(id) {
        const users = this.loadUsers();
        return users.find(u => u.id === id) || null;
    }

    getUsers({ pagination = {} }) {
        const users = this.loadUsers();
        const { first = 10, after } = pagination;
        const startIndex = after ? parseInt(after) : 0;
        const paginatedUsers = users.slice(startIndex, startIndex + first);

        const edges = paginatedUsers.map((user, index) => ({
            node: user,
            cursor: (startIndex + index).toString()
        }));

        return {
            edges,
            pageInfo: {
                hasNextPage: startIndex + first < users.length,
                hasPreviousPage: startIndex > 0,
                startCursor: edges[0]?.cursor,
                endCursor: edges[edges.length - 1]?.cursor
            },
            totalCount: users.length
        };
    }

    getOrders({ pagination = {} }) {
        const userId = this.getCurrentUser()?.id;
        if (!userId) return { edges: [], pageInfo: {}, totalCount: 0 };

        const orders = this.loadOrders().filter(o => o.userId === userId);
        const { first = 10, after } = pagination;
        const startIndex = after ? parseInt(after) : 0;
        const paginatedOrders = orders.slice(startIndex, startIndex + first);

        const edges = paginatedOrders.map((order, index) => ({
            node: order,
            cursor: (startIndex + index).toString()
        }));

        return {
            edges,
            pageInfo: {
                hasNextPage: startIndex + first < orders.length,
                hasPreviousPage: startIndex > 0,
                startCursor: edges[0]?.cursor,
                endCursor: edges[edges.length - 1]?.cursor
            },
            totalCount: orders.length
        };
    }

    getOrder(id) {
        const orders = this.loadOrders();
        return orders.find(o => o.id === id) || null;
    }

    getReviews(productId) {
        const reviews = this.loadReviews();
        return reviews.filter(r => r.productId === productId);
    }

    getAnalytics(period = 30) {
        if (window.analytics) {
            return window.analytics.getDashboardMetrics(period);
        }

        return {
            uniqueUsers: 0,
            sessions: 0,
            pageViews: 0,
            bounceRate: 0,
            avgSessionDuration: 0,
            topProducts: [],
            topCategories: []
        };
    }

    // ============================================
    // MUTATION IMPLEMENTATIONS
    // ============================================

    async register(input) {
        if (window.authSystem) {
            const result = await window.authSystem.register(input.username, input.email, input.password);

            if (result.success) {
                return {
                    token: result.token || 'mock_token_' + Date.now(),
                    user: result.user
                };
            }
        }

        throw new Error('Error al registrar usuario');
    }

    async login(input) {
        if (window.authSystem) {
            const result = await window.authSystem.login(input.username, input.password);

            if (result.success) {
                return {
                    token: result.token || 'mock_token_' + Date.now(),
                    user: result.user
                };
            }
        }

        throw new Error('Credenciales inválidas');
    }

    logout() {
        if (window.authSystem) {
            window.authSystem.logout();
            return true;
        }
        return false;
    }

    createProduct(input) {
        const product = {
            id: 'prod_' + Date.now(),
            ...input,
            stock: input.stock || 0,
            rating: 0,
            reviewCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const products = this.loadProducts();
        products.push(product);
        this.saveProducts(products);

        return product;
    }

    updateProduct(id, input) {
        const products = this.loadProducts();
        const index = products.findIndex(p => p.id === id);

        if (index === -1) {
            throw new Error('Producto no encontrado');
        }

        products[index] = {
            ...products[index],
            ...input,
            updatedAt: new Date().toISOString()
        };

        this.saveProducts(products);
        return products[index];
    }

    deleteProduct(id) {
        const products = this.loadProducts();
        const filtered = products.filter(p => p.id !== id);

        if (products.length === filtered.length) {
            throw new Error('Producto no encontrado');
        }

        this.saveProducts(filtered);
        return true;
    }

    createOrder(input) {
        const userId = this.getCurrentUser()?.id;
        if (!userId) throw new Error('Usuario no autenticado');

        const order = {
            id: 'order_' + Date.now(),
            userId,
            items: input.items,
            subtotal: this.calculateSubtotal(input.items),
            shipping: 15000,
            discount: 0,
            total: 0,
            status: 'PENDING',
            paymentMethod: input.paymentMethod,
            shippingMethod: input.shippingMethod,
            shippingAddress: input.shippingAddress,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        order.total = order.subtotal + order.shipping - order.discount;

        const orders = this.loadOrders();
        orders.push(order);
        this.saveOrders(orders);

        // Trigger subscription
        this.publishOrderUpdate(order);

        return order;
    }

    updateOrderStatus(id, status) {
        const orders = this.loadOrders();
        const index = orders.findIndex(o => o.id === id);

        if (index === -1) {
            throw new Error('Pedido no encontrado');
        }

        orders[index].status = status;
        orders[index].updatedAt = new Date().toISOString();

        this.saveOrders(orders);

        // Trigger subscription
        this.publishOrderUpdate(orders[index]);

        return orders[index];
    }

    createReview(input) {
        const userId = this.getCurrentUser()?.id;
        if (!userId) throw new Error('Usuario no autenticado');

        const review = {
            id: 'review_' + Date.now(),
            userId,
            productId: input.productId,
            rating: input.rating,
            title: input.title,
            comment: input.comment,
            helpful: 0,
            createdAt: new Date().toISOString()
        };

        const reviews = this.loadReviews();
        reviews.push(review);
        this.saveReviews(reviews);

        return review;
    }

    deleteReview(id) {
        const reviews = this.loadReviews();
        const filtered = reviews.filter(r => r.id !== id);

        if (reviews.length === filtered.length) {
            throw new Error('Review no encontrada');
        }

        this.saveReviews(filtered);
        return true;
    }

    addToCart(productId, quantity) {
        const cart = this.loadCart();
        const existingItem = cart.items.find(item => item.productId === productId);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            const product = this.getProduct(productId);
            if (!product) throw new Error('Producto no encontrado');

            cart.items.push({
                productId,
                product,
                quantity,
                price: product.price
            });
        }

        this.saveCart(cart);
        return this.calculateCart(cart);
    }

    removeFromCart(productId) {
        const cart = this.loadCart();
        cart.items = cart.items.filter(item => item.productId !== productId);
        this.saveCart(cart);
        return this.calculateCart(cart);
    }

    clearCart() {
        this.saveCart({ items: [] });
        return true;
    }

    // ============================================
    // SUBSCRIPTIONS
    // ============================================

    subscribeToOrderUpdates(userId) {
        const id = this.subscriptionId++;
        return this.createSubscription(id, 'orderUpdated', userId);
    }

    subscribeToMessages(room) {
        const id = this.subscriptionId++;
        return this.createSubscription(id, 'messageReceived', room);
    }

    subscribeToNotifications(userId) {
        const id = this.subscriptionId++;
        return this.createSubscription(id, 'notificationReceived', userId);
    }

    subscribeToStats() {
        const id = this.subscriptionId++;
        return this.createSubscription(id, 'statsUpdated', null);
    }

    createSubscription(id, type, param) {
        const subscription = {
            id,
            type,
            param,
            callback: null
        };

        this.subscriptions.set(id, subscription);

        return {
            subscribe: (callback) => {
                subscription.callback = callback;
            },
            unsubscribe: () => {
                this.subscriptions.delete(id);
            }
        };
    }

    publishOrderUpdate(order) {
        this.subscriptions.forEach(sub => {
            if (sub.type === 'orderUpdated' && sub.param === order.userId && sub.callback) {
                sub.callback(order);
            }
        });
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    loadProducts() {
        return window.products || [];
    }

    saveProducts(products) {
        window.products = products;
        localStorage.setItem('products', JSON.stringify(products));
    }

    loadUsers() {
        const saved = localStorage.getItem('users');
        return saved ? JSON.parse(saved) : [];
    }

    loadOrders() {
        const saved = localStorage.getItem('orders');
        return saved ? JSON.parse(saved) : [];
    }

    saveOrders(orders) {
        localStorage.setItem('orders', JSON.stringify(orders));
    }

    loadReviews() {
        const saved = localStorage.getItem('reviews');
        return saved ? JSON.parse(saved) : [];
    }

    saveReviews(reviews) {
        localStorage.setItem('reviews', JSON.stringify(reviews));
    }

    loadCart() {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : { items: [] };
    }

    saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    calculateCart(cart) {
        const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

        return {
            userId: this.getCurrentUser()?.id,
            items: cart.items,
            subtotal,
            itemCount
        };
    }

    calculateSubtotal(items) {
        return items.reduce((sum, item) => {
            const product = this.getProduct(item.productId);
            return sum + (product ? product.price * item.quantity : 0);
        }, 0);
    }

    getProductRating(productId) {
        const reviews = this.getReviews(productId);
        if (reviews.length === 0) return 0;

        const sum = reviews.reduce((total, r) => total + r.rating, 0);
        return sum / reviews.length;
    }

    getProductReviewCount(productId) {
        return this.getReviews(productId).length;
    }

    getUserOrders(userId) {
        return this.loadOrders().filter(o => o.userId === userId);
    }

    getUserReviews(userId) {
        return this.loadReviews().filter(r => r.userId === userId);
    }

    getOrderItems(orderId) {
        const order = this.getOrder(orderId);
        return order ? order.items : [];
    }

    // ============================================
    // QUERY EXECUTION
    // ============================================

    async executeQuery(query, variables = {}) {
        try {
            // Parse query type
            const isQuery = query.trim().startsWith('query');
            const isMutation = query.trim().startsWith('mutation');
            const isSubscription = query.trim().startsWith('subscription');

            console.log('[GraphQL] Executing:', { isQuery, isMutation, isSubscription });

            // Simplified execution (en producción usar librería como graphql-js)
            // Por ahora retornamos mock data

            return {
                data: {},
                errors: []
            };
        } catch (error) {
            console.error('[GraphQL] Error:', error);
            return {
                data: null,
                errors: [{ message: error.message }]
            };
        }
    }
}

// Exportar globalmente
if (typeof window !== 'undefined') {
    window.GraphQLAPI = GraphQLAPI;
    window.graphqlAPI = new GraphQLAPI();
}
