export class DataClient {
    constructor() {
        this._facilitiesCache = null;
        this._deliveryOptionsCache = null;
        this._stockOverviewCache = null;
        this._articleDetailCache = new Map();
    }

    async _get(url) {
        const resp = await fetch(url);
        if (!resp.ok) {
            throw new Error(await resp.text());
        }
        return resp.json();
    }

    async getFacilities() {
        if (!this._facilitiesCache) {
            this._facilitiesCache = await this._get('/api/procurement/facilities');
        }
        return this._facilitiesCache;
    }

    async getDeliveryOptions() {
        if (!this._deliveryOptionsCache) {
            this._deliveryOptionsCache = await this._get('/api/procurement/delivery-options');
        }
        return this._deliveryOptionsCache;
    }

    async getStockOverview() {
        if (!this._stockOverviewCache) {
            this._stockOverviewCache = await this._get('/api/procurement/stock');
        }
        return this._stockOverviewCache;
    }

    async getStockDetail(partNumber) {
        if (!this._articleDetailCache.has(partNumber)) {
            this._articleDetailCache.set(partNumber, await this._get(`/api/procurement/stock/${encodeURIComponent(partNumber)}`));
        }
        return this._articleDetailCache.get(partNumber);
    }
}
