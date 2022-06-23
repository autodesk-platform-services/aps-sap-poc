export class DataClient {
    constructor() {
        this._facilitiesCache = null;
        this._deliveryOptionsCache = null;
        this._stockOverviewCache = null;
        this._articleDetailCache = new Map();
    }

    async getFacilities() {
        if (!this._facilitiesCache) {
            const resp = await fetch('/api/procurement/facilities');
            if (!resp.ok) {
                throw new Error(await resp.text());
            }
            this._facilitiesCache = await resp.json();
        }
        return this._facilitiesCache;
    }

    async getDeliveryOptions() {
        if (!this._deliveryOptionsCache) {
            const resp = await fetch('/api/procurement/delivery-options');
            if (!resp.ok) {
                throw new Error(await resp.text());
            }
            this._deliveryOptionsCache = await resp.json();
        }
        return this._deliveryOptionsCache;
    }

    async getStockOverview() {
        if (!this._stockOverviewCache) {
            const resp = await fetch('/api/procurement/stock');
            if (!resp.ok) {
                throw new Error(await resp.text());
            }
            this._stockOverviewCache = await resp.json();
        }
        return this._stockOverviewCache;
    }

    async getStockDetail(partNumber) {
        if (!this._articleDetailCache.has(partNumber)) {
            const resp = await fetch(`/api/procurement/stock/${encodeURIComponent(partNumber)}`);
            if (!resp.ok) {
                throw new Error(await resp.text());
            }
            this._articleDetailCache.set(partNumber, await resp.json());
        }
        return this._articleDetailCache.get(partNumber);
    }
}
