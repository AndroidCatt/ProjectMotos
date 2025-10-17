// Redis Cache System - Sistema de Caché tipo Redis v10.0
// Simulación de Redis con localStorage, TTL, LRU eviction

class RedisCache {
    constructor(config = {}) {
        this.maxSize = config.maxSize || 100; // Máximo número de claves
        this.defaultTTL = config.defaultTTL || 3600; // TTL por defecto (1 hora)
        this.storageKey = 'redis_cache';
        this.metaKey = 'redis_meta';

        this.cache = this.loadCache();
        this.meta = this.loadMeta();

        // Limpiar expirados cada 60 segundos
        this.cleanupInterval = setInterval(() => this.cleanup(), 60000);

        console.log('[Redis] Cache inicializado', {
            maxSize: this.maxSize,
            defaultTTL: this.defaultTTL,
            currentSize: Object.keys(this.cache).length
        });
    }

    // ============================================
    // OPERACIONES BÁSICAS (STRING)
    // ============================================

    set(key, value, ttl = this.defaultTTL) {
        // Verificar límite de tamaño
        if (Object.keys(this.cache).length >= this.maxSize && !this.cache[key]) {
            this.evictLRU();
        }

        const expiresAt = ttl > 0 ? Date.now() + (ttl * 1000) : null;

        this.cache[key] = {
            value: this.serialize(value),
            type: this.getType(value),
            expiresAt,
            accessCount: 0,
            lastAccess: Date.now()
        };

        this.meta[key] = {
            createdAt: Date.now(),
            accessCount: 0,
            size: this.calculateSize(value)
        };

        this.save();

        console.log(`[Redis] SET ${key} (TTL: ${ttl}s)`);
        return 'OK';
    }

    get(key) {
        if (!this.cache[key]) {
            return null;
        }

        // Verificar expiración
        if (this.isExpired(key)) {
            this.del(key);
            return null;
        }

        // Actualizar stats
        this.cache[key].accessCount++;
        this.cache[key].lastAccess = Date.now();
        this.meta[key].accessCount++;

        this.save();

        console.log(`[Redis] GET ${key}`);
        return this.deserialize(this.cache[key].value);
    }

    del(key) {
        if (!this.cache[key]) {
            return 0;
        }

        delete this.cache[key];
        delete this.meta[key];
        this.save();

        console.log(`[Redis] DEL ${key}`);
        return 1;
    }

    exists(key) {
        return this.cache[key] && !this.isExpired(key) ? 1 : 0;
    }

    expire(key, seconds) {
        if (!this.cache[key]) {
            return 0;
        }

        this.cache[key].expiresAt = Date.now() + (seconds * 1000);
        this.save();

        console.log(`[Redis] EXPIRE ${key} ${seconds}s`);
        return 1;
    }

    ttl(key) {
        if (!this.cache[key]) {
            return -2; // Key no existe
        }

        if (!this.cache[key].expiresAt) {
            return -1; // No tiene expiración
        }

        const remaining = Math.floor((this.cache[key].expiresAt - Date.now()) / 1000);
        return remaining > 0 ? remaining : -2;
    }

    // ============================================
    // OPERACIONES DE HASH
    // ============================================

    hset(key, field, value) {
        if (!this.cache[key] || this.cache[key].type !== 'hash') {
            this.cache[key] = {
                value: {},
                type: 'hash',
                expiresAt: null,
                accessCount: 0,
                lastAccess: Date.now()
            };
        }

        const hash = this.deserialize(this.cache[key].value);
        hash[field] = value;
        this.cache[key].value = this.serialize(hash);

        this.save();

        console.log(`[Redis] HSET ${key} ${field}`);
        return 1;
    }

    hget(key, field) {
        if (!this.cache[key] || this.cache[key].type !== 'hash') {
            return null;
        }

        if (this.isExpired(key)) {
            this.del(key);
            return null;
        }

        const hash = this.deserialize(this.cache[key].value);
        return hash[field] !== undefined ? hash[field] : null;
    }

    hgetall(key) {
        if (!this.cache[key] || this.cache[key].type !== 'hash') {
            return {};
        }

        if (this.isExpired(key)) {
            this.del(key);
            return {};
        }

        return this.deserialize(this.cache[key].value);
    }

    hdel(key, field) {
        if (!this.cache[key] || this.cache[key].type !== 'hash') {
            return 0;
        }

        const hash = this.deserialize(this.cache[key].value);
        if (hash[field] === undefined) {
            return 0;
        }

        delete hash[field];
        this.cache[key].value = this.serialize(hash);
        this.save();

        console.log(`[Redis] HDEL ${key} ${field}`);
        return 1;
    }

    hkeys(key) {
        if (!this.cache[key] || this.cache[key].type !== 'hash') {
            return [];
        }

        const hash = this.deserialize(this.cache[key].value);
        return Object.keys(hash);
    }

    hvals(key) {
        if (!this.cache[key] || this.cache[key].type !== 'hash') {
            return [];
        }

        const hash = this.deserialize(this.cache[key].value);
        return Object.values(hash);
    }

    // ============================================
    // OPERACIONES DE LISTA
    // ============================================

    lpush(key, ...values) {
        if (!this.cache[key] || this.cache[key].type !== 'list') {
            this.cache[key] = {
                value: [],
                type: 'list',
                expiresAt: null,
                accessCount: 0,
                lastAccess: Date.now()
            };
        }

        const list = this.deserialize(this.cache[key].value);
        list.unshift(...values);
        this.cache[key].value = this.serialize(list);

        this.save();

        console.log(`[Redis] LPUSH ${key} (${values.length} items)`);
        return list.length;
    }

    rpush(key, ...values) {
        if (!this.cache[key] || this.cache[key].type !== 'list') {
            this.cache[key] = {
                value: [],
                type: 'list',
                expiresAt: null,
                accessCount: 0,
                lastAccess: Date.now()
            };
        }

        const list = this.deserialize(this.cache[key].value);
        list.push(...values);
        this.cache[key].value = this.serialize(list);

        this.save();

        console.log(`[Redis] RPUSH ${key} (${values.length} items)`);
        return list.length;
    }

    lpop(key) {
        if (!this.cache[key] || this.cache[key].type !== 'list') {
            return null;
        }

        const list = this.deserialize(this.cache[key].value);
        if (list.length === 0) return null;

        const value = list.shift();
        this.cache[key].value = this.serialize(list);
        this.save();

        console.log(`[Redis] LPOP ${key}`);
        return value;
    }

    rpop(key) {
        if (!this.cache[key] || this.cache[key].type !== 'list') {
            return null;
        }

        const list = this.deserialize(this.cache[key].value);
        if (list.length === 0) return null;

        const value = list.pop();
        this.cache[key].value = this.serialize(list);
        this.save();

        console.log(`[Redis] RPOP ${key}`);
        return value;
    }

    lrange(key, start, stop) {
        if (!this.cache[key] || this.cache[key].type !== 'list') {
            return [];
        }

        const list = this.deserialize(this.cache[key].value);

        // Convertir índices negativos
        if (start < 0) start = list.length + start;
        if (stop < 0) stop = list.length + stop;

        return list.slice(start, stop + 1);
    }

    llen(key) {
        if (!this.cache[key] || this.cache[key].type !== 'list') {
            return 0;
        }

        const list = this.deserialize(this.cache[key].value);
        return list.length;
    }

    // ============================================
    // OPERACIONES DE SET
    // ============================================

    sadd(key, ...members) {
        if (!this.cache[key] || this.cache[key].type !== 'set') {
            this.cache[key] = {
                value: [],
                type: 'set',
                expiresAt: null,
                accessCount: 0,
                lastAccess: Date.now()
            };
        }

        const set = new Set(this.deserialize(this.cache[key].value));
        let added = 0;

        members.forEach(member => {
            if (!set.has(member)) {
                set.add(member);
                added++;
            }
        });

        this.cache[key].value = this.serialize(Array.from(set));
        this.save();

        console.log(`[Redis] SADD ${key} (${added} new members)`);
        return added;
    }

    srem(key, ...members) {
        if (!this.cache[key] || this.cache[key].type !== 'set') {
            return 0;
        }

        const set = new Set(this.deserialize(this.cache[key].value));
        let removed = 0;

        members.forEach(member => {
            if (set.has(member)) {
                set.delete(member);
                removed++;
            }
        });

        this.cache[key].value = this.serialize(Array.from(set));
        this.save();

        console.log(`[Redis] SREM ${key} (${removed} members)`);
        return removed;
    }

    smembers(key) {
        if (!this.cache[key] || this.cache[key].type !== 'set') {
            return [];
        }

        return this.deserialize(this.cache[key].value);
    }

    sismember(key, member) {
        if (!this.cache[key] || this.cache[key].type !== 'set') {
            return 0;
        }

        const set = new Set(this.deserialize(this.cache[key].value));
        return set.has(member) ? 1 : 0;
    }

    scard(key) {
        if (!this.cache[key] || this.cache[key].type !== 'set') {
            return 0;
        }

        return this.deserialize(this.cache[key].value).length;
    }

    // ============================================
    // OPERACIONES AVANZADAS
    // ============================================

    keys(pattern = '*') {
        const regex = this.patternToRegex(pattern);
        return Object.keys(this.cache).filter(key => {
            return !this.isExpired(key) && regex.test(key);
        });
    }

    flushdb() {
        const count = Object.keys(this.cache).length;
        this.cache = {};
        this.meta = {};
        this.save();

        console.log(`[Redis] FLUSHDB (${count} keys deleted)`);
        return 'OK';
    }

    dbsize() {
        return Object.keys(this.cache).filter(key => !this.isExpired(key)).length;
    }

    info() {
        const keys = Object.keys(this.cache);
        const expired = keys.filter(key => this.isExpired(key)).length;
        const totalSize = Object.values(this.meta).reduce((sum, m) => sum + (m.size || 0), 0);

        return {
            version: '10.0 (simulated)',
            keys: keys.length - expired,
            expired,
            maxSize: this.maxSize,
            totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
            hitRate: this.calculateHitRate()
        };
    }

    // ============================================
    // CACHE INVALIDATION PATTERNS
    // ============================================

    invalidatePattern(pattern) {
        const keys = this.keys(pattern);
        let deleted = 0;

        keys.forEach(key => {
            this.del(key);
            deleted++;
        });

        console.log(`[Redis] Invalidated ${deleted} keys matching ${pattern}`);
        return deleted;
    }

    // Cache-aside pattern
    async cacheAside(key, fetchFunction, ttl = this.defaultTTL) {
        // Intentar obtener de cache
        const cached = this.get(key);
        if (cached !== null) {
            console.log(`[Redis] Cache HIT: ${key}`);
            return cached;
        }

        console.log(`[Redis] Cache MISS: ${key}`);

        // Fetch from source
        const data = await fetchFunction();

        // Guardar en cache
        this.set(key, data, ttl);

        return data;
    }

    // Write-through pattern
    async writeThrough(key, value, writeFunction, ttl = this.defaultTTL) {
        // Escribir en ambos lugares
        await writeFunction(value);
        this.set(key, value, ttl);

        console.log(`[Redis] Write-through: ${key}`);
        return value;
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    loadCache() {
        const saved = localStorage.getItem(this.storageKey);
        return saved ? JSON.parse(saved) : {};
    }

    loadMeta() {
        const saved = localStorage.getItem(this.metaKey);
        return saved ? JSON.parse(saved) : {};
    }

    save() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.cache));
        localStorage.setItem(this.metaKey, JSON.stringify(this.meta));
    }

    serialize(value) {
        if (typeof value === 'object') {
            return JSON.stringify(value);
        }
        return String(value);
    }

    deserialize(value) {
        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    }

    getType(value) {
        if (Array.isArray(value)) return 'list';
        if (value instanceof Set) return 'set';
        if (typeof value === 'object') return 'hash';
        return 'string';
    }

    calculateSize(value) {
        return new Blob([JSON.stringify(value)]).size;
    }

    isExpired(key) {
        if (!this.cache[key]) return true;
        if (!this.cache[key].expiresAt) return false;
        return Date.now() > this.cache[key].expiresAt;
    }

    cleanup() {
        let cleaned = 0;

        Object.keys(this.cache).forEach(key => {
            if (this.isExpired(key)) {
                this.del(key);
                cleaned++;
            }
        });

        if (cleaned > 0) {
            console.log(`[Redis] Cleanup: ${cleaned} expired keys removed`);
        }
    }

    evictLRU() {
        // Encontrar la clave menos recientemente usada
        let lruKey = null;
        let oldestAccess = Date.now();

        Object.keys(this.cache).forEach(key => {
            if (this.cache[key].lastAccess < oldestAccess) {
                oldestAccess = this.cache[key].lastAccess;
                lruKey = key;
            }
        });

        if (lruKey) {
            console.log(`[Redis] LRU eviction: ${lruKey}`);
            this.del(lruKey);
        }
    }

    calculateHitRate() {
        const totalAccess = Object.values(this.meta).reduce((sum, m) => sum + (m.accessCount || 0), 0);
        if (totalAccess === 0) return '0%';

        const hits = Object.values(this.cache).reduce((sum, c) => sum + (c.accessCount || 0), 0);
        return `${((hits / totalAccess) * 100).toFixed(2)}%`;
    }

    patternToRegex(pattern) {
        const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
        const regex = escaped.replace(/\*/g, '.*').replace(/\?/g, '.');
        return new RegExp(`^${regex}$`);
    }

    destroy() {
        clearInterval(this.cleanupInterval);
    }
}

// Exportar globalmente
if (typeof window !== 'undefined') {
    window.RedisCache = RedisCache;
    window.redisCache = new RedisCache({
        maxSize: 100,
        defaultTTL: 3600
    });
}
