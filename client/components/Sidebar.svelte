<script>
	import StockOverview from './StockOverview.svelte';
	import StockDetail from './StockDetail.svelte';

	export let viewer;
	export let model;
	export let dataClient;

	let selectedPartNumber;

	function onPartSelected(ev) {
		selectedPartNumber = ev.detail.id;
		model.search(selectedPartNumber, function onSuccess(dbids) {
			viewer.isolate(dbids);
            viewer.fitToView(dbids);
		}, function onError() {}, ['Part Number']);
	}

	function onPartDeselected() {
		selectedPartNumber = null;
		viewer.isolate([]);
        viewer.fitToView([]);
	}
</script>

<div>
	{#if selectedPartNumber}
		<StockDetail partNumber={selectedPartNumber} {dataClient} on:close={onPartDeselected} />
	{:else}
		<StockOverview {dataClient} on:componentClicked={onPartSelected} />
	{/if}
</div>

<style>
</style>
