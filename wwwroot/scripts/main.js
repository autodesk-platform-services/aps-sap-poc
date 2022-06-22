import { initViewer, loadModel, findByProperty } from './viewer.js';
import { renderStockOverview, renderArticleDetail } from './sidebar.js';

window.addEventListener('DOMContentLoaded', async function () {
    const resp = await fetch('/config.json');
    if (!resp.ok) {
        document.getElementById('viewer').innerHTML = `
            <div class="alert alert-danger" role="alert">
                Could not retrieve app configuration. See console for more details.
            </div>
        `;
        console.error(resp);
        return;
    }
    const config = await resp.json();
    const viewer = await initViewer(document.getElementById('viewer'));
    loadModel(viewer, config.FORGE_MODEL_URN);

    async function onPartSelected(partNumber, skipViewerUpdate) {
        renderArticleDetail(document.getElementById('sidebar'), partNumber, onPartDeselected);
        const dbids = await findByProperty(viewer.model, 'Part Number', partNumber);
        if (!skipViewerUpdate) {
            viewer.isolate(dbids);
            viewer.fitToView(dbids);   
        }
    }
    async function onPartDeselected(skipViewerUpdate) {
        renderStockOverview(document.getElementById('sidebar'), onPartSelected);
        if (!skipViewerUpdate) {
            viewer.isolate([]);
            viewer.fitToView([]);
        }
    }
    viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, async function () {
        let dbids = viewer.getSelection();
        if (dbids.length === 1) {
            const tree = viewer.model.getInstanceTree();
            let dbid = tree.getNodeParentId(dbids[0]);
            while (dbid) {
                dbids.push(dbid);
                dbid = tree.getNodeParentId(dbid);
            }
            const props = await viewer.model.getPropertySetAsync(dbids, { propFilter: ['Part Number'] });
            const partNumbers = props.map['File Properties/Part Number'];
            if (partNumbers.length > 0) {
                onPartSelected(partNumbers[0].displayValue, true);
            }
        } else if (dbids.length === 0) {
            onPartDeselected(true);
        }
    });
    renderStockOverview(document.getElementById('sidebar'), onPartSelected);
});
