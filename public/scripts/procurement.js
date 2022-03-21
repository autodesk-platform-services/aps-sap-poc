export function initProcurementTab(mainViewer) {
    const $tbody = $('#suppliers > tbody');
    const $pagination = $('#procurement-suppliers .pagination');
    let suppliers = {
        list: [],
        pageSize: 8,
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
                        <a href="#" class="part-link" data-part-number="${partNumber}" data-supplier-id="${supplierId}">${componentName}</a>
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

    $pagination.on('click', function (ev) {
        if (ev.target.innerText.match(/^\d+$/)) {
            const page = parseInt(ev.target.innerText);
            suppliers.currPage = page - 1;
            updateSuppliersTable();
            updateSuppliersPagination();
        }
    });

    mainViewer.addEventListener(Autodesk.Viewing.ISOLATE_EVENT, function (ev) {
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

    $('#suppliers').on('click', function (ev) {
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
            const $link = $(ev.target);
            updateStockAvailability($link.data('supplier-id'), $link.data('part-number'));
        }
    });

    let deliveryOptions = null;

    async function updateStockAvailability(supplierId, partNumber) {
        const clientLocation = {
            lat: $('#inputLat').val(),
            lon: $('#inputLon').val()
        };
        const $tbody = $('#stock-levels > tbody');
        $tbody.empty();
        const resp = await fetch(`/api/procurement/suppliers/availability?part=${partNumber}`);
        const stockOptions = await resp.json();
        if (!deliveryOptions) {
            const resp = await fetch(`/api/procurement/delivery/options`);
            deliveryOptions = await resp.json();
        }
        for (const { Warehouse_ID, Warehouse_Name, latitude, longitude, Stock_Level } of stockOptions) {
            const warehouseLocation = {
                lat: parseFloat(latitude),
                lon: parseFloat(longitude)
            }
            const $row = $(`
                <tr data-warehouse-id="${Warehouse_ID}" data-lat="${latitude}" data-lon="${longitude}">
                    <th scope="row">
                        <a href="#">${Warehouse_Name}</a>
                    </th>
                    <td>${Stock_Level}</td>
                    <td class="lat-lon-distance">${computeLatLongDistance(clientLocation, warehouseLocation).toFixed(2)}km</td>
                    <td>
                        <select>
                            <option value="-" selected>None</option>
                            ${deliveryOptions.map(option => {
                                const value = parseFloat(option['GHG Conversion Factor 2021']);
                                const units = option['GHG'];
                                return `<option value="${value.toFixed(2)} ${units}">${option['Conversion_Factor_Key']}</option>`;
                            })}
                        </select>
                    </td>
                    <td class="carbon-footprint">-</td>
                </tr>
            `);
            $tbody.append($row);
            $tbody.find('select').on('change', function () {
                const tokens = this.value.split(' ');
                const value = parseFloat(tokens[0]);
                const units = tokens[1];
                const $row = $(this).closest('tr');
                const distance = parseFloat($row.find('.lat-lon-distance').text().replace('km', ''));
                $row.find('td.carbon-footprint').text(`${(value * distance).toFixed(2)} ${units}`);
            });
        }
    }

    function onInputLatLonChange() {
        const clientLocation = {
            lat: $('#inputLat').val(),
            lon: $('#inputLon').val()
        };
        $('#stock-levels > tbody').children().each(function () {
            const $row = $(this);
            const warehouseLocation = {
                lat: parseFloat($row.data('lat')),
                lon: parseFloat($row.data('lon'))
            }
            const distance = computeLatLongDistance(clientLocation, warehouseLocation).toFixed(2);
            $row.find('td.lat-lon-distance').text(distance + 'km');

            // Update carbon footprint
            const carbonFootprintCoef = $row.find('select').val();
            if (carbonFootprintCoef !== '-') {
                debugger;
                const tokens = carbonFootprintCoef.split(' ');
                const value = parseFloat(tokens[0]);
                const units = tokens[1];
                $row.find('td.carbon-footprint').text(`${(value * distance).toFixed(2)} ${units}`);
            }
        });
    }

    $('#inputLat').on('change', onInputLatLonChange);
    $('#inputLon').on('change', onInputLatLonChange);

    function computeLatLongDistance(loc1, loc2) {
        const R = 6371;
        const φ1 = loc1.lat * Math.PI / 180;
        const φ2 = loc2.lat * Math.PI / 180;
        const Δφ = (loc2.lat - loc1.lat) * Math.PI / 180;
        const Δλ = (loc2.lon - loc1.lon) * Math.PI / 180;
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // in km
    }

    updateSuppliers(true);
}
