import * as Utility from "./utility.mjs";

const BG_COLOR = "#fafafa";
const WARNING_COLOR = "#FFC0CB";

function doFirstPage() {
    const page = document.getElementById("first-page");
    const titleInput = page.querySelector(".plot-title-input");
    const addRowBtn = page.querySelector(".add-row");
    const deleteRowBtn = page.querySelector(".delete-row");
    const plotBtn = page.querySelector(".plot");
    const tableBody = page.querySelector("tbody");
    const plotDiv = document.getElementById("box-plot");
    const alertDiv = document.getElementById("warning-alert");

    function addRow() {
        const rowHTML = `
            <td class="dataset data-table" contenteditable="true"></td>
            <td class="minimum data-table" contenteditable="true"></td>
            <td class="lower data-table" contenteditable="true"></td>
            <td class="median data-table" contenteditable="true"></td>
            <td class="upper data-table" contenteditable="true"></td>
            <td class="maximum data-table" contenteditable="true"></td>
            <td class="outliers data-table" contenteditable="true"></td>`;

        const row = document.createElement("tr");
        row.innerHTML = rowHTML;
        tableBody.appendChild(row);
    }

    function deleteRow() {
        console.log(document.activeElement);
    }

    function plotBoxPlot(params) {
        Highcharts.chart('box-plot', {

            chart: {
                type: 'boxplot'
            },
            title: {
                text: params.title
            },
            legend: {
                enabled: false
            },
            xAxis: {
                categories: params.categories,
                title: {
                    text: params.xAxisLabel
                }
            },
            yAxis: {
                title: {
                    text: params.yAxisLabel
                }
            },
            series: [{
                name: params.yAxisLabel,
                data: params.data,
                color: Highcharts.getOptions().colors[0],
                tooltip: {
                    headerFormat: 'Item: <em>{point.key}</em><br/>'
                }
            }, {
                name: 'Outlier',
                color: Highcharts.getOptions().colors[0],
                type: 'scatter',
                data: params.outliers,
                marker: {
                    fillColor: 'white',
                    lineWidth: 1,
                    lineColor: Highcharts.getOptions().colors[0]
                },
                tooltip: {
                    pointFormat: 'Observation: {point.y}'
                }
            }]

        });
    }

    function plotBtnClick() {
        const params = {
            title: page.querySelector("input.plot-title-input").value.trim(),
            yAxisLabel: page.querySelector("input.y-title-input").value.trim(),
            xAxisLabel: page.querySelector("input.x-title-input").value.trim(),
            categories: [],
            data: []
        };

        function getOutliers() {
            const outlierCells = page.querySelectorAll("td.outliers");
            outlierCells.forEach(cell => console.log(cell.innerHTML));
        }

        function validateRowData(rowData, rowNum) {
            const result = {
                ok: true,
                errorMsg: ""
            };

            if (rowData[0] > rowData[1]) {
                result.ok = false;
                result.errorMsg = "<strong>Error in row " + rowNum + ":</strong> Minimum > Lower Quartile";
                return result;
            }
            if (rowData[1] > rowData[2]) {
                result.ok = false;
                result.errorMsg = "<strong>Error in row " + rowNum + ":</strong> Lower Quartile > Median";
                return result;
            }
            if (rowData[2] > rowData[3]) {
                result.ok = false;
                result.errorMsg = "<strong>Error in row " + rowNum + ":</strong> Median > Upper Quartile";
                return result;
            }
            if (rowData[3] > rowData[4]) {
                result.ok = false;
                result.errorMsg = "<strong>Error in row " + rowNum + ":</strong> Upper Quartile > Maximum";
                return result;
            }
            return result;
        }

        function validateRow(row, rowNum) {
            const tds = row.querySelectorAll("td");
            const rowResult = {
                ok: true,
                category: "",
                rowData: [],
                errorMsg: ""
            };
            let rowDataResult, value;

            tds.forEach(td => td.style.backgroundColor = BG_COLOR);
            rowResult.category = tds[0].innerText || "";
            for (let j = 1; j < 6; j++) {
                value = Number(tds[j].innerText);
                if (isNaN(value) || tds[j].innerText.trim() === "") {
                    rowResult.ok = false;
                    tds[j].style.backgroundColor = WARNING_COLOR;
                    tds[j].focus();
                    return rowResult;
                }
                rowResult.rowData.push(value);
            }

            rowDataResult = validateRowData(rowResult.rowData, rowNum);
            if (rowDataResult.ok) {
                rowResult.errorMsg = "";
            }
            else {
                rowResult.errorMsg = rowDataResult.errorMsg;
                rowResult.ok = false;
            }
            return rowResult;
        }

        function validateTable() {
            const rows = tableBody.querySelectorAll("tr");
            let rowResult;
            // needs to be a for loop cause forEach has no break equivalent
            for (let i = 0; i < rows.length; i++) {
                rowResult = validateRow(rows[i], (i + 1));
                console.log(rowResult);
                if (!rowResult.ok) {
                    if (rowResult.errorMsg) {
                        console.log(alertDiv);
                        alertDiv.innerHTML = rowResult.errorMsg;
                        alertDiv.classList.remove("d-none");
                    }
                    return false;
                }
                else{
                    params.categories.push(rowResult.category);
                    params.data.push(rowResult.rowData);
                }
            }

            return true;
        }

        alertDiv.classList.add("d-none");
        if(validateTable()){
            plotBoxPlot(params);
            plotDiv.classList.remove("d-none");
        }
        else{
            plotDiv.classList.add("d-none");
        }

        /* const results = validateTable();
        if(results.ok){
            params.categories = results.categories;
            params.data = results.overallData;
            Utility.fadeIn(plotDiv)
                .then(() => plotBoxPlot(params));
        }
        else{
            Utility.fadeOut(plotDiv);
        }
        getOutliers(); */
    }

    Utility.fadeIn(page)
        .then(() => {
            addRowBtn.addEventListener("click", addRow);
            deleteRowBtn.addEventListener("click", deleteRow);
            plotBtn.addEventListener("click", plotBtnClick);
            titleInput.focus();
        });
}

function run() {
    console.log("Running.");
    /* const browser = navigator.userAgent.trim().replace(/,/g, ';');
    $.post("count.php",{browser:  browser},function(response){ 
        console.log("Server response: " + response);
    }); */
    doFirstPage();
}

Utility.ready(run);