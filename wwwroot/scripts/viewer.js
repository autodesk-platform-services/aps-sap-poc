export function initViewer(container) {
    const options = {
        getAccessToken: async function(callback) {
            const resp = await fetch('/api/auth/token');
            if (resp.ok) {
                const auth = await resp.json();
                callback(auth.access_token, auth.expires_in);
            } else {
                console.error('Could not retrieve access token', resp);
            }
        }
    };
    return new Promise(function (resolve, reject) {
        Autodesk.Viewing.Initializer(options, function () {
            const viewer = new Autodesk.Viewing.Private.GuiViewer3D(container);
            resetViewerSettings(viewer);
            viewer.start();
            resolve(viewer);
        });
    });
}

export function loadModel(viewer, urn) {
    return new Promise(function(resolve, reject) {
        function onDocumentLoadSuccess(doc) {
            viewer.loadDocumentNode(doc, doc.getRoot().getDefaultGeometry()).then(model => {
                resetViewerSettings(viewer);
                resolve(model);
            });
        }
        function onDocumentLoadFailure(err) {
            reject('Could not load document: ' + err);
        }
        Autodesk.Viewing.Document.load('urn:' + urn, onDocumentLoadSuccess, onDocumentLoadFailure);
    });
}

export async function findByProperty(model, propName, propValue) {
    return new Promise(function (resolve, reject) {
        model.search(propValue, resolve, reject, [propName]);
    });
}

function resetViewerSettings(viewer) {
    viewer.setQualityLevel(/* ambient shadows */ false, /* antialiasing */ true);
    viewer.setGroundShadow(true);
    viewer.setGroundReflection(false);
    viewer.setGhosting(true);
    viewer.setEnvMapBackground(false);
    viewer.setLightPreset(5);
    // viewer.setSelectionColor(new THREE.Color(0xEBB30B));
}
