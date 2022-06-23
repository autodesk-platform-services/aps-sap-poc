import App from './components/App.svelte';
import { DataClient } from './data.js';

const app = new App({
	target: document.body,
	props: {
		appConfigEndpoint: '/config',
		accessTokenEndpoint: '/token',
		dataClient: new DataClient()
	}
});

export default app;
