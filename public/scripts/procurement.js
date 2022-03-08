export function initProcurementTab(mainViewer) {
    const $tbody = $('#suppliers > tbody');
    const $pagination = $('#procurement .pagination');
    let suppliers = {
        list: [],
        pageSize: 15,
        currPage: 0
    };

    async function updateSuppliers(reload, componentName) {
        if (reload) {
            const query = componentName ? '?part=' + encodeURI(componentName) : '';
            const resp = await fetch('/api/procurement/suppliers' + query);
            suppliers.list = await resp.json();
            suppliers.currPage = 0;
        }
        updateSuppliersTable();
        updateSuppliersPagination();
    }

    function updateSuppliersTable() {
        const { list, currPage, pageSize } = suppliers;
        $tbody.empty();
        for (let i = currPage * pageSize; i < (currPage + 1) * pageSize && i < list.length; i++) {
            const { partNumber, componentName, procurementTime, supplierId, supplierName, averageCost, stockQuantity } = list[i];
            const $row = $(`
                <tr>
                    <th scope="row">
                        <a href="#" class="part-link">${componentName}</a>
                    </th>
                    <td>${supplierName}</td>
                    <td>$${averageCost}</td>
                    <td>${stockQuantity}</td>
                    <td>${procurementTime}</td>
                </tr>
            `);
            $tbody.append($row);
        }
    }

    function updateSuppliersPagination() {
        const { list, currPage, pageSize } = suppliers;
        const pageCount = Math.ceil(list.length / pageSize);
        $pagination.empty();
        for (let i = 0; i < pageCount; i++) {
            const $li = $(`<li class="page-item ${i == currPage ? 'active' : ''}"><a class="page-link" href="#">${i + 1}</a></li>`);
            $pagination.append($li);
        }
    }

    $pagination.on('click', function(ev) {
        if (ev.target.innerText.match(/^\d+$/)) {
            const page = parseInt(ev.target.innerText);
            suppliers.currPage = page - 1;
            updateSuppliersTable();
            updateSuppliersPagination();
        }
    });

    mainViewer.addEventListener(Autodesk.Viewing.ISOLATE_EVENT, function(ev) {
        const dbids = mainViewer.getIsolatedNodes();
        if (dbids.length === 1) {
            function onSuccess(result) {
                const componentNameProp = result.properties.find(prop => prop.displayName === 'Component Name');
                if (componentNameProp) {
                    updateSuppliers(true, componentNameProp.displayValue);
                }
            }
            function onError(err) {
                console.warn('Could not retrieve object properties', err);
            }
            mainViewer.getProperties(dbids[0], onSuccess, onError);
        } else {
            updateSuppliers(true);
        }
    });

    $('#suppliers').on('click', function(ev) {
        if (ev.target.classList.contains('part-link')) {
            const partNumber = ev.target.innerText;
            function onSuccess(ids) {
                if (ids && ids.length > 0) {
                    mainViewer.select(ids);
                    mainViewer.fitToView(ids);
                }
            }
            function onError(err) {
                console.warn('Could not find part number', partNumber);
            }
            mainViewer.search(partNumber, onSuccess, onError, ['Part Number']);
        }
    });

    updateSuppliers(true);
}