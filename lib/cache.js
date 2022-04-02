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
