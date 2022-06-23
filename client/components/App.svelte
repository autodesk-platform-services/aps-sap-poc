<script>
	import Header from './Header.svelte';
	import Viewer from './Viewer.svelte';
	import StockOverview from './StockOverview.svelte';
	import StockDetail from './StockDetail.svelte';

	export let appConfigEndpoint;
	export let accessTokenEndpoint;
	export let dataClient;

	async function getAppConfig() {
		const resp = await fetch(appConfigEndpoint);
		if (!resp.ok) {
			throw new Error(await resp.text());
		}
		const config = await resp.json();
		return config;
	}

	let viewer;
	let selectedPart;

	function onPartSelected(ev) {
		selectedPart = ev.detail.id;
		viewer.focus(selectedPart);
	}

	function onPartDeselected() {
		selectedPart = null;
		viewer.focus(selectedPart);
	}
</script>

<div>
	{#await getAppConfig()}
		<p class="info">Loading ...</p>
	{:then config}
		<div id="header">
			<Header />
		</div>
		<div id="viewer">
			<Viewer bind:this={viewer} urn={config.urn} {accessTokenEndpoint} on:selectionChanged={(ev) => console.log('Selected IDs: ' + ev.detail.dbids.join(','))} />
		</div>
		<div id="sidebar">
			{#if selectedPart}
				<StockDetail partNumber={selectedPart} {dataClient} on:close={onPartDeselected} />
			{:else}
				<StockOverview {dataClient} on:componentClicked={onPartSelected} />
			{/if}
		</div>
	{:catch error}
		<p class="error">{error.message}</p>
	{/await}
</div>

<style>
	#header, #viewer, #sidebar {
		position: absolute;
		box-sizing: border-box;
	}

	#header {
		top: 0;
		height: 3.5em;
		left: 0;
		right: 0;
	}

	#viewer {
		top: 3.5em;
		bottom: 0;
		left: 0;
		width: 60vw;
	}

	#sidebar {
		top: 3.5em;
		bottom: 0;
		right: 0;
		width: 40vw;
		overflow-y: scroll;
		padding: 0 1em;
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
