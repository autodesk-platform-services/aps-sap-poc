async function getAccessToken(callback) {
    const resp = await fetch('/token');
    if (resp.ok) {
        const auth = await resp.json();
        callback(auth.access_token, auth.expires_in);
    } else {
        alert('Could not retrieve viewer access token. See console for more details.');
        console.error(await resp.text());
    }
}

export async function initViewer(container) {
    return new Promise(function (resolve, reject) {
        Autodesk.Viewing.Initializer({ getAccessToken }, function () {
            const viewer = new Autodesk.Viewing.GuiViewer3D(container);
            viewer.start();
            resolve(viewer);
        });
    });
}

export function resetSettings(viewer) {
    viewer.setQualityLevel(/* ambient shadows */ false, /* antialiasing */ true);
    viewer.setGroundShadow(true);
    viewer.setGroundReflection(false);
    viewer.setGhosting(true);
    viewer.setEnvMapBackground(false);
    viewer.setLightPreset(0); // If this line is removed, the light preset 9 below won't be activated... 🪄???
    viewer.setLightPreset(9);
}

export async function loadModel(viewer, urn) {
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
