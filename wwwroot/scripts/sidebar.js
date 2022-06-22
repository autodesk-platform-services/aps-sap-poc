// export function initProcurementTab(mainViewer) {
//     const $tbody = $('#suppliers > tbody');
//     const $pagination = $('#procurement-suppliers .pagination');
//     let suppliers = {
//         list: [],
//         pageSize: 8,
//         currPage: 0
//     };

//     async function updateSuppliers(reload, componentName) {
//         if (reload) {
//             const query = componentName ? '?part=' + encodeURI(componentName) : '';
//             const resp = await fetch('/api/procurement/suppliers' + query);
//             suppliers.list = await resp.json();
//             suppliers.currPage = 0;
//         }
//         updateSuppliersTable();
//         updateSuppliersPagination();
//     }

//     function updateSuppliersTable() {
//         const { list, currPage, pageSize } = suppliers;
//         $tbody.empty();
//         for (let i = currPage * pageSize; i < (currPage + 1) * pageSize && i < list.length; i++) {
//             const { partNumber, componentName, procurementTime, supplierId, supplierName, averageCost, stockQuantity } = list[i];
//             const $row = $(`
//                 <tr>
//                     <th scope="row">
//                         <a href="#" class="part-link" data-part-number="${partNumber}" data-supplier-id="${supplierId}">${componentName}</a>
//                     </th>
//                     <td>${supplierName}</td>
//                     <td>$${averageCost}</td>
//                     <td>${stockQuantity}</td>
//                     <td>${procurementTime}</td>
//                 </tr>
//             `);
//             $tbody.append($row);
//         }
//     }

//     function updateSuppliersPagination() {
//         const { list, currPage, pageSize } = suppliers;
//         const pageCount = Math.ceil(list.length / pageSize);
//         $pagination.empty();
//         for (let i = 0; i < pageCount; i++) {
//             const $li = $(`<li class="page-item ${i == currPage ? 'active' : ''}"><a class="page-link" href="#">${i + 1}</a></li>`);
//             $pagination.append($li);
//         }
//     }

//     $pagination.on('click', function (ev) {
//         if (ev.target.innerText.match(/^\d+$/)) {
//             const page = parseInt(ev.target.innerText);
//             suppliers.currPage = page - 1;
//             updateSuppliersTable();
//             updateSuppliersPagination();
//         }
//     });

//     mainViewer.addEventListener(Autodesk.Viewing.ISOLATE_EVENT, function (ev) {
//         const dbids = mainViewer.getIsolatedNodes();
//         if (dbids.length === 1) {
//             function onSuccess(result) {
//                 const componentNameProp = result.properties.find(prop => prop.displayName === 'Component Name');
//                 if (componentNameProp) {
//                     updateSuppliers(true, componentNameProp.displayValue);
//                 }
//             }
//             function onError(err) {
//                 console.warn('Could not retrieve object properties', err);
//             }
//             mainViewer.getProperties(dbids[0], onSuccess, onError);
//         } else {
//             updateSuppliers(true);
//         }
//     });

//     $('#suppliers').on('click', function (ev) {
//         if (ev.target.classList.contains('part-link')) {
//             const partNumber = ev.target.innerText;
//             function onSuccess(ids) {
//                 if (ids && ids.length > 0) {
//                     mainViewer.select(ids);
//                     mainViewer.fitToView(ids);
//                 }
//             }
//             function onError(err) {
//                 console.warn('Could not find part number', partNumber);
//             }
//             mainViewer.search(partNumber, onSuccess, onError, ['Part Number']);
//             const $link = $(ev.target);
//             updateStockAvailability($link.data('supplier-id'), $link.data('part-number'));
//         }
//     });

//     let deliveryOptions = null;

//     async function updateStockAvailability(supplierId, partNumber) {
//         const clientLocation = {
//             lat: $('#inputLat').val(),
//             lon: $('#inputLon').val()
//         };
//         const $tbody = $('#stock-levels > tbody');
//         $tbody.empty();
//         const resp = await fetch(`/api/procurement/suppliers/availability?part=${partNumber}`);
//         const stockOptions = await resp.json();
//         if (!deliveryOptions) {
//             const resp = await fetch(`/api/procurement/delivery/options`);
//             deliveryOptions = await resp.json();
//         }
//         for (const { Warehouse_ID, Warehouse_Name, latitude, longitude, Stock_Level } of stockOptions) {
//             const warehouseLocation = {
//                 lat: parseFloat(latitude),
//                 lon: parseFloat(longitude)
//             }
//             const $row = $(`
//                 <tr data-warehouse-id="${Warehouse_ID}" data-lat="${latitude}" data-lon="${longitude}">
//                     <th scope="row">
//                         <a href="#">${Warehouse_Name}</a>
//                     </th>
//                     <td>${Stock_Level}</td>
//                     <td class="lat-lon-distance">${computeLatLongDistance(clientLocation, warehouseLocation).toFixed(2)}km</td>
//                     <td>
//                         <select>
//                             <option value="-" selected>None</option>
//                             ${deliveryOptions.map(option => {
//                                 const value = parseFloat(option['GHG Conversion Factor 2021']);
//                                 const units = option['GHG'];
//                                 return `<option value="${value.toFixed(2)} ${units}">${option['Conversion_Factor_Key']}</option>`;
//                             })}
//                         </select>
//                     </td>
//                     <td class="carbon-footprint">-</td>
//                 </tr>
//             `);
//             $tbody.append($row);
//             $tbody.find('select').on('change', function () {
//                 const tokens = this.value.split(' ');
//                 const value = parseFloat(tokens[0]);
//                 const units = tokens[1];
//                 const $row = $(this).closest('tr');
//                 const distance = parseFloat($row.find('.lat-lon-distance').text().replace('km', ''));
//                 $row.find('td.carbon-footprint').text(`${(value * distance).toFixed(2)} ${units}`);
//             });
//         }
//     }

//     function onInputLatLonChange() {
//         const clientLocation = {
//             lat: $('#inputLat').val(),
//             lon: $('#inputLon').val()
//         };
//         $('#stock-levels > tbody').children().each(function () {
//             const $row = $(this);
//             const warehouseLocation = {
//                 lat: parseFloat($row.data('lat')),
//                 lon: parseFloat($row.data('lon'))
//             }
//             const distance = computeLatLongDistance(clientLocation, warehouseLocation).toFixed(2);
//             $row.find('td.lat-lon-distance').text(distance + 'km');

//             // Update carbon footprint
//             const carbonFootprintCoef = $row.find('select').val();
//             if (carbonFootprintCoef !== '-') {
//                 debugger;
//                 const tokens = carbonFootprintCoef.split(' ');
//                 const value = parseFloat(tokens[0]);
//                 const units = tokens[1];
//                 $row.find('td.carbon-footprint').text(`${(value * distance).toFixed(2)} ${units}`);
//             }
//         });
//     }

//     $('#inputLat').on('change', onInputLatLonChange);
//     $('#inputLon').on('change', onInputLatLonChange);

//     function computeLatLongDistance(loc1, loc2) {
//         const R = 6371;
//         const φ1 = loc1.lat * Math.PI / 180;
//         const φ2 = loc2.lat * Math.PI / 180;
//         const Δφ = (loc2.lat - loc1.lat) * Math.PI / 180;
//         const Δλ = (loc2.lon - loc1.lon) * Math.PI / 180;
//         const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
//             Math.cos(φ1) * Math.cos(φ2) *
//             Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
//         const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//         return R * c; // in km
//     }

//     updateSuppliers(true);
// }

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

let facilitiesCache = null;
async function getFacilities() {
    if (!facilitiesCache) {
        const resp = await fetch('/api/procurement/facilities');
        if (!resp.ok) {
            throw new Error(await resp.text());
        }
        facilitiesCache = await resp.json();
    }
    return facilitiesCache;
}

let stockOverviewCache = null;
async function getStockOverview() {
    if (!stockOverviewCache) {
        const resp = await fetch('/api/procurement/stock');
        if (!resp.ok) {
            throw new Error(await resp.text());
        }
        stockOverviewCache = await resp.json();
    }
    return stockOverviewCache;
}

let articleDetailCache = new Map();
async function getArticleDetail(partNumber) {
    if (!articleDetailCache.has(partNumber)) {
        const resp = await fetch(`/api/procurement/stock/${encodeURIComponent(partNumber)}`);
        if (!resp.ok) {
            throw new Error(await resp.text());
        }
        articleDetailCache.set(partNumber, await resp.json());
    }
    return articleDetailCache.get(partNumber);
}

let deliveryOptionsCache = null;
async function getDeliveryOptions() {
    if (!deliveryOptionsCache) {
        const resp = await fetch('/api/procurement/delivery-options');
        if (!resp.ok) {
            throw new Error(await resp.text());
        }
        deliveryOptionsCache = await resp.json();
    }
    return deliveryOptionsCache;
}

export async function renderStockOverview(container, onPartSelected) {
    container.innerHTML = `
        <h>Stock Overview</h>
        <div id="stock-overview" style="max-height: 90%; overflow-y: scroll;">
            <div class="alert alert-secondary" role="alert">
                Loading...
            </div>
        </div>
    `;
    const body = document.getElementById('stock-overview');
    try {
        const stock = await getStockOverview();
        body.innerHTML = `
            <table class="table table-hover table-dark mt-3">
                <thead>
                    <tr>
                        <th scope="col">Part</th>
                        <th scope="col">Count</th>
                        <th scope="col">Locations</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </table>
        `;
        document.querySelector('#stock-overview > table > tbody').innerHTML = stock.map(entry => {
            return `
                <tr>
                    <th scope="row">
                        <a href="#" data-part="${entry.Article_ID}">${entry.Article_ID}</a>
                    </th>
                    <td>${entry.Count}</td>
                    <td>${entry.Facility_ID}</td>
                </tr>
            `;
        }).join('\n');
        document.getElementById('stock-overview').addEventListener('click', function (ev) {
            if (ev.target.hasAttribute('data-part') && onPartSelected) {
                onPartSelected(ev.target.getAttribute('data-part'));
            }
        });
    } catch (err) {
        body.innerHTML = `
            <div class="alert alert-danger" role="alert">
                Could not retrieve stock data. See console for more details.
            </div>
        `;
        console.error(err);
    }
}

export async function renderArticleDetail(container, partNumber, onClosed) {
    const partWeight = 0.001;

    function updateDistances(table, destination) {
        table.querySelectorAll('tbody > tr').forEach(function (row) {
            const th = row.querySelector('th');
            const location = {
                lat: parseFloat(th.getAttribute('data-lat')),
                lon: parseFloat(th.getAttribute('data-lon'))
            };
            row.querySelector('.distance').innerText = computeLatLongDistance(location, destination).toFixed(2) + 'km';
        });
    }

    async function updateTotals(table, partWeight) {
        const deliveryOptions = await getDeliveryOptions();
        let totalCount = 0;
        let totalPrice = 0;
        let totalCO2 = 0;
        table.querySelectorAll('tbody > tr').forEach(function (row) {
            const count = parseInt(row.querySelector('td.order > input').value);
            const distance = parseFloat(row.querySelector('td.distance').innerText);
            if (count > 0 && distance > 0) {
                const deliveryOptionID = row.querySelector('td.delivery > select').value;
                const deliveryOption = deliveryOptions.find(option => option.Delivery_Option_ID === deliveryOptionID);
                const price = deliveryOption.Shipping_Price_per_ton_km * (count * partWeight) * distance;
                const co2 = deliveryOption.Carbon_Footprint_CO2_ton_km * (count * partWeight) * distance;
                totalCount += count;
                totalPrice += price;
                totalCO2 += co2;
            }
        });
        document.getElementById('totals').innerHTML = `
            <div class="card text-bg-secondary m-3" style="flex: 1;">
                <div class="card-header">Count</div>
                <div class="card-body">
                    <h5 class="card-title">${totalCount}</h5>
                </div>
            </div>
            <div class="card text-bg-secondary m-3" style="flex: 1;">
                <div class="card-header">Price</div>
                <div class="card-body">
                    <h5 class="card-title">$${totalPrice.toFixed(2)}</h5>
                </div>
            </div>
            <div class="card text-bg-secondary m-3" style="flex: 1;">
                <div class="card-header">CO2 Footprint</div>    
                <div class="card-body">
                    <h5 class="card-title">${totalCO2.toFixed(2)} kg CO2</h5>
                </div>
            </div>
        `;
    }

    container.innerHTML = `
        <div style="text-align: right">
            <button id="close-button" type="button" class="btn-close btn-close-white" aria-label="Close"></button>
        </div>
        <h>Article Detail: ${partNumber}</h>
        <div id="article-detail" style="max-height: 50%; overflow-y: scroll;" class="mb-4">
            <div class="alert alert-secondary" role="alert">
                Loading...
            </div>
        </div>
        <h>Purchase</h>
        <div id="purchase">
            <div class="mb-3">
                <label for="purchase-destination" class="form-label">Destination</label>
                <select id="purchase-destination" class="form-select"></select>
            </div>
            <div id="totals" style="display: flex; justify-content: space-evenly;">
            </div>
            <div class="d-grid gap-2">
                <button class="btn btn-primary" type="button">Purchase</button>
            </div>
        </div>
    `;
    document.getElementById('close-button').addEventListener('click', function (ev) {
        if (onClosed) {
            onClosed();
        }
    });
    const body = document.getElementById('article-detail');
    try {
        const [detail, facilities, deliveryOptions] = await Promise.all([
            getArticleDetail(partNumber),
            getFacilities(),
            getDeliveryOptions()
        ]);
        body.innerHTML = `
            <table class="table table-hover table-dark mt-3">
                <thead>
                    <tr>
                        <th scope="col">Warehouse</th>
                        <th scope="col">Count</th>
                        <th scope="col">Capacity</th>
                        <!-- <th scope="col">Proc. Time</th> -->
                        <th scope="col">Distance</th>
                        <!-- <th scope="col">Last Update</th> -->
                        <th scope="col">Order</th>
                        <th scope="col">Delivery</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </table>
        `;
        document.querySelector('#article-detail > table > tbody').innerHTML = detail.map(entry => {
            return `
                <tr>
                    <th scope="row" data-lat="${entry.Latitude}" data-lon="${entry.Longitude}">${entry.Name}</th>
                    <td>${entry.Count}</td>
                    <td>${entry.Capacity}</td>
                    <!-- <td>${entry.Procurement_Time}</td> -->
                    <td class="distance">...</td>
                    <!-- <td>${entry.Last_Update}</td> -->
                    <td class="order">
                        <input class="form-control" type="number" min="0" max="${entry.Count}" value="0">
                    </td>
                    <td class="delivery">
                        <select class="form-select">
                            ${deliveryOptions.map(option => `<option value="${option.Delivery_Option_ID}">${option.Delivery_Options}</option>`).join('\n')}
                        </select>
                    </td>
                </tr>
            `;
        }).join('\n');
        const destinationsDropdown = document.getElementById('purchase-destination');
        destinationsDropdown.innerHTML = facilities.map(facility => `<option value="${facility.Latitude};${facility.Longitude}">${facility.Name}</option>`).join('\n');
        destinationsDropdown.onchange = () => {
            const tokens = destinationsDropdown.value.split(';');
            updateDistances(document.querySelector('#article-detail > table'), { lat: parseFloat(tokens[0]), lon: parseFloat(tokens[1]) });
            updateTotals(document.querySelector('#article-detail > table'), partWeight);
        };
        destinationsDropdown.onchange();
        document.querySelectorAll('#article-detail td.order > input, #article-detail td.delivery > select').forEach(function (el) {
            el.onchange = () => updateTotals(document.querySelector('#article-detail > table'), partWeight);
        });
    } catch (err) {
        body.innerHTML = `
            <div class="alert alert-danger" role="alert">
                Could not retrieve article data. See console for more details.
            </div>
        `;
        console.error(err);
    }
}
