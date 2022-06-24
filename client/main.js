import Sidebar from './components/Sidebar.svelte';
import { initViewer, resetSettings, loadModel } from './viewer.js';
import { DataClient } from './data.js';

try {
	const resp = await fetch('/config');
	if (!resp.ok) {
		throw new Error(await resp.text());
	}
	const config = await resp.json();
	const viewer = await initViewer(document.getElementById('viewer'));
	const model = await loadModel(viewer, config.urn);
	await resetSettings(viewer);
	new Sidebar({
		target: document.getElementById('sidebar'),
		props: {
			viewer,
			model,
			dataClient: new DataClient()
		}
	});
} catch (err) {
	alert('Could not initialize application. See console for more details.');
	console.error(err);
}
