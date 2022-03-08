import { initProcurementTab } from './procurement.js';

const options = {
	env: 'AutodeskProduction',
	getAccessToken: function(callback) {
		fetch('/api/auth/token')
		    .then((response) => response.json())
		    .then((auth) => callback(auth.access_token, auth.expires_in));
	}
};

const config = fetch('/config.json').then(resp => resp.json());
let mainViewer = null;

Autodesk.Viewing.Initializer(options, async () => {
    mainViewer = new Autodesk.Viewing.Private.GuiViewer3D(document.getElementById('viewer'), { extensions: [] });
    mainViewer.start();
    const { FORGE_MODEL_URN } = await config;
    loadModel(FORGE_MODEL_URN);
});

function loadModel(urn) {
    return new Promise(function(resolve, reject) {
        function onDocumentLoadSuccess(doc) {
            const node = doc.getRoot().getDefaultGeometry();
            mainViewer.loadDocumentNode(doc, node)
                .then(function () {
                    initProcurementTab(mainViewer);
                    resetViewerSettings(mainViewer);
                    resolve();
                })
                .catch(function (err) {
                    reject('Could not load viewable: ' + err);
                });
        }
        function onDocumentLoadFailure(err) {
            reject('Could not load document: ' + err);
        }
        Autodesk.Viewing.Document.load('urn:' + urn, onDocumentLoadSuccess, onDocumentLoadFailure);
    });
}

function resetViewerSettings(viewer) {
    viewer.setQualityLevel(/* ambient shadows */ false, /* antialiasing */ true);
    viewer.setGroundShadow(true);
    viewer.setGroundReflection(false);
    viewer.setGhosting(true);
    viewer.setEnvMapBackground(true);
    viewer.setLightPreset(5);
    viewer.setSelectionColor(new THREE.Color(0xEBB30B));
}
