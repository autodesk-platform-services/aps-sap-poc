<script>
    import { createEventDispatcher } from 'svelte';

    export let partNumber;
    export let dataClient;

    function computeLatLongDistance(loc1, loc2) {
        const R = 6371;
        const φ1 = loc1.Latitude * Math.PI / 180;
        const φ2 = loc2.Latitude * Math.PI / 180;
        const Δφ = (loc2.Latitude - loc1.Latitude) * Math.PI / 180;
        const Δλ = (loc2.Longitude - loc1.Longitude) * Math.PI / 180;
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // in km
    }

    let dispatch = createEventDispatcher();
    let entriesPromise = dataClient.getStockDetail(partNumber).then(entries => {
        for (const entry of entries) {
            entry.Order = 0;
            entry.DeliveryOption = undefined;
        }
        return entries;
    });
    let deliveryOptionsPromise = dataClient.getDeliveryOptions();
    let facilitiesPromise = dataClient.getFacilities();
    let destinationFacility;
    let totals = { count: 0, price: 0, co2: 0 };

    function updateTotals(entries) {
        const weight = 0.001;
        let count = 0;
        let price = 0;
        let co2 = 0;
        for (const entry of entries) {
            if (entry.Order > 0) {
                const distance = computeLatLongDistance(entry, destinationFacility);
                count += entry.Order;
                price += entry.Order * parseFloat(entry.DeliveryOption.Shipping_Price_per_ton_km) * weight * distance;
                co2 += entry.Order * parseFloat(entry.DeliveryOption.Carbon_Footprint_CO2_ton_km) * weight * distance;
            }
        }
        totals = { count, price, co2 };
    }
</script>

<div>
    <h>
        <a href="#" on:click={() => dispatch('close', {})}>Stock Overview</a> > {partNumber}
    </h>
    {#await entriesPromise}
	    <p class="info">Loading ...</p>
    {:then entries}
        <table>
            <thead>
                <tr>
                    <th scope="col" style="width: 30%;">Warehouse</th>
                    <th scope="col" style="width: 10%;">Count</th>
                    <th scope="col" style="width: 10%;">Capacity</th>
                    <th scope="col" style="width: 10%;">Distance</th>
                    <th scope="col" style="width: 10%;">Order</th>
                    <th scope="col" style="width: 30%;">Delivery</th>
                </tr>
            </thead>
            <tbody>
                {#each entries as entry}
                    <tr>
                        <td>{entry.Name}</td>
                        <td>{entry.Count}</td>
                        <td>{entry.Capacity}</td>
                        <td class="distance">{destinationFacility ? computeLatLongDistance(entry, destinationFacility).toFixed(2) + 'km' : '...'}</td>
                        <td class="order">
                            <input type="number" min="0" max="{entry.Count}" on:change={ev => updateTotals(entries)} bind:value={entry.Order}>
                        </td>
                        <td class="delivery">
                            {#await deliveryOptionsPromise}
                                ...
                            {:then deliveryOptions}
                                <select on:change={ev => { entry.DeliveryOption = deliveryOptions[ev.target.selectedIndex]; updateTotals(entries); }} bind:value={entry.DeliveryOption}>
                                    {#each deliveryOptions as option}
                                        <option value="{option}">{option.Delivery_Options}</option>
                                    {/each}
                                </select>
                            {/await}
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
        <h>Purchase</h>
        {#await facilitiesPromise}
            <p class="info">Loading ...</p>
        {:then facilities} 
            <label for="destination">Destination</label>
            <select id="destination" bind:value={destinationFacility} on:change={ev => updateTotals(entries)}>
                {#each facilities as facility}
                    <option value="{facility}">{facility.Name}</option>
                {/each}
            </select>
        {/await}
        <table class="totals">
            <tbody>
                <tr>
                    <td style="width: 50%;">Total Count</td>
                    <td style="width: 50%;">{totals.count}</td>
                </tr>
                <tr>
                    <td>Total Price</td>
                    <td>${totals.price.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Total CO2</td>
                    <td>{totals.co2.toFixed(2)} kg CO2</td>
                </tr>
            </tbody>
        </table>
    {:catch error}
	    <p class="error">{error.message}</p>
    {/await}
</div>

<style>
    h {
        display: block;
        font-size: 1.5em;
        font-weight: 700;
        margin: 1em 0;
    }

    h > a {
        color: white;
    }

    table {
        margin: 1em 0;
        width: 100%;
        table-layout: fixed;
    }

    table tr {
        height: 1.75em;
    }

    table th {
        text-align: left;
        background-color: #333;
    }

    table th, table td {
        padding: 0 0.5em;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
    }

    table input, table select {
        width: 100%;
    }

    .info {
        margin: 1em 0;
        color: lightgray;
    }

    .error {
        margin: 1em 0;
        color: red;
    }

    .totals {
        font-size: x-large;
        font-weight: 600;
    }
</style>
