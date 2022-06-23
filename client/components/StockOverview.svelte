<script>
    import { createEventDispatcher } from 'svelte';

    export let dataClient;

    let dispatch = createEventDispatcher();
    let entriesPromise = dataClient.getStockOverview();
</script>

<div>
    <h>Stock Overview</h>
    {#await entriesPromise}
	    <p class="info">Loading ...</p>
    {:then entries}
        <table>
            <thead>
                <tr>
                    <th scope="col">Part</th>
                    <th scope="col">Count</th>
                    <th scope="col">Locations</th>
                </tr>
            </thead>
            <tbody>
                {#each entries as entry}
                    <tr>
                        <td>
                            <a href="#" on:click={() => dispatch('componentClicked', { id: entry.Article_ID })}>{entry.Article_ID}</a>
                        </td>
                        <td>{entry.Count}</td>
                        <td>{entry.Facility_ID}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {:catch error}
	    <p class="error">{error.message}</p>
    {/await}
</div>

<style>
    h {
        font-size: 1.5em;
        font-weight: 700;
    }

    table {
        margin: 1em 0;
        width: 100%;
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
    }

    table a {
        color: white;
    }

    .info {
        margin: 1em 0;
        color: lightgray;
    }

    .error {
        margin: 1em 0;
        color: red;
    }
</style>