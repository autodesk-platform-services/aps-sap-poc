<script>
    import { onMount, createEventDispatcher } from 'svelte';

    export let urn = '';
    export let accessTokenEndpoint;

    let dispatch = createEventDispatcher();
    let container;
    let viewer;
    let mounted = false;

    async function getAccessToken(callback) {
        const resp = await fetch(accessTokenEndpoint);
        if (resp.ok) {
            const auth = await resp.json();
            callback(auth.access_token, auth.expires_in);
        } else {
            console.error('Could not retrieve access token', resp);
        }
    }

    async function findByProperty(model, propName, propValue) {
        return new Promise(function (resolve, reject) {
            model.search(propValue, resolve, reject, [propName]);
        });
    }

    export async function focus(partNumber) {
        if (viewer) {
            const dbids = partNumber ? await findByProperty(viewer.model, 'Part Number', partNumber) : [];
            viewer.isolate(dbids);
            viewer.fitToView(dbids);
        }
    }

    function initViewer(container) {
        return new Promise(function (resolve, reject) {
            Autodesk.Viewing.Initializer({ getAccessToken }, function () {
                const viewer = new Autodesk.Viewing.GuiViewer3D(container);
                viewer.start();
                resolve(viewer);
            });
        });
    }

    function loadModel(viewer, urn) {
        return new Promise(function (resolve, reject) {
            function onDocumentLoadSuccess(doc) {
                viewer.loadDocumentNode(doc, doc.getRoot().getDefaultGeometry())
                    .then(resolve)
                    .catch(reject);
            }
            function onDocumentLoadFailure(code, message, errors) {
                reject(message);
            }
            Autodesk.Viewing.Document.load('urn:' + urn, onDocumentLoadSuccess, onDocumentLoadFailure);
        });
    }

    function resetSettings(viewer) {
        viewer.setQualityLevel(/* ambient shadows */ false, /* antialiasing */ true);
        viewer.setGroundShadow(true);
        viewer.setGroundReflection(false);
        viewer.setGhosting(true);
        viewer.setEnvMapBackground(false);
        viewer.setLightPreset(9);
    }

    $: if (viewer && urn) {
        loadModel(viewer, urn).then(() => resetSettings(viewer));
    }

    onMount(async function () {
        mounted = true;
        if (window.hasOwnProperty('Autodesk')) {
            setup();
        }
    });

    async function onScriptLoaded() {
        if (mounted && !viewer) {
            setup();
        }
    }

    async function setup() {
        viewer = await initViewer(container);
        viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, function (ev) {
            const dbids = viewer.getSelection();
            dispatch('selectionChanged', { dbids });
        });
    }
</script>

<svelte:head>
	<link rel="stylesheet" href="https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/style.css">
	<script src="https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/viewer3D.js" on:load={onScriptLoaded}></script>
</svelte:head>

<div bind:this={container}>
</div>

<style>
</style>