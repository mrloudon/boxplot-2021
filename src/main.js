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

    function getOutliers() {
        const outlierCells = page.querySelectorAll("td.outliers");
        outlierCells.forEach(cell => console.log(cell.innerHTML));
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

        function validateTable(){
            let tds, rowData, value;
            const rows = tableBody.querySelectorAll("tr");
            const results = {
                categories: [], 
                overallData: [],
                ok: false
            };
            rows.forEach(row => {
                rowData = [];
                tds = row.querySelectorAll("td");
                tds.forEach(td => td.style.backgroundColor = BG_COLOR);
                results.categories.push(tds[0].innerText || "");
                for(let i = 1; i < 6; i++){
                    value = Number(tds[i].innerText);
                    if(isNaN(value) || tds[i].innerText.trim() === ""){
                        tds[i].style.backgroundColor = WARNING_COLOR;
                        tds[i].focus();
                        return;
                    }
                    rowData.push(Number(tds[i].innerText))
                }
                results.overallData.push(rowData);
                results.ok = true;
            });
            
            return results;
        }

        const results = validateTable();
        if(results.ok){
            params.categories = results.categories;
            params.data = results.overallData;
            Utility.fadeIn(plotDiv)
                .then(() => plotBoxPlot(params));
        }
        else{
            Utility.fadeOut(plotDiv);
        }
        getOutliers();
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