export class MemoryCache {
  constructor() {
    this.cache = {};
  }
  async get(key) {
    return this.cache[key];
  }

  async put(key, value) {
    this.cache[key] = value;
  }

  async delete(key) {
    delete this.cache[key];
  }
}

export class ExternalCache {
  constructor(cache) {
    this.cache = cache || new MemoryCache();
  }
  async get(key) {
    return await this.cache.get(key);
  }

  async put(key, value) {
    await this.cache.put(key, value);
  }

  async delete(key) {
    await this.cache.delete(key);
  }
}
