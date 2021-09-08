const
    PAUSE = 500,
    AXES_COLOUR = "#666",
    TEXT_COLOUR = "#444",
    ALERT_BLUE = "#cff4fc",
    BACKGROUND = "#fafafa",
    POP_SD_COLOUR = "#EEF3E2",
    SAM_SD_COLOUR = "#FCF6CF",
    DATUM_DISPLAY_TIME = 200,
    SQUARE_FILL = 'rgba(255,0,0,0.25)',
    SQUARE_HIGHLIGHT_FILL = 'rgba(0,0,255,0.25)',
    SQUARE_DISPLAY_TIME = 300,
    DEVIATION_DISPLAY_TIME = 200,
    DEVIATION_STROKE = 'rgb(51,51,51)',
    DEVIATION_HIGHLIGHT_STROKE = '#104E8B',
    WIDTH = 720,
    LEFT_PAD = 70,
    RIGHT_PAD = 70,
    TOP_PAD = 60,
    TICK_LENGTH = 5,
    Y_MAX = 100,
    LABEL_Y_OFFSET = 12,
    LABEL_X_OFFSET = 12,
    DATUM_RADIUS = 5,
    Y_TICKS = 5,
    Y_AXIS_HEIGHT = 360,
    X_AXIS_LENGTH = WIDTH - LEFT_PAD - RIGHT_PAD,
    Y_SCALE = Y_AXIS_HEIGHT / Y_MAX;

let canvas, params, xInterval, mean, squares = [];
let graphVisible = false;
let deviationsVisible = false;
let squaresVisible = false;

function getStats() {
    let sumSquares = 0;
    let total = 0;

    params.data.forEach(item => total += item);
    squares.forEach(sqr => sumSquares += sqr);

    return {
        N: params.data.length,
        squares,
        sumSquares,
        total,
        mean,
        populationVar: sumSquares / params.data.length,
        sampleVar: sumSquares / (params.data.length - 1),
        populationSD: Math.sqrt(sumSquares / params.data.length),
        sampleSD: Math.sqrt(sumSquares / (params.data.length - 1))
    };
}

function drawTicks() {
    let i, temp;

    temp = TOP_PAD + Y_AXIS_HEIGHT + TICK_LENGTH;
    for (i = 1; i <= params.data.length; i++) {
        canvas.drawLine({
            layer: true,
            strokeStyle: AXES_COLOUR,
            strokeWidth: 2,
            x1: LEFT_PAD + i * xInterval,
            y1: TOP_PAD + Y_AXIS_HEIGHT,
            x2: LEFT_PAD + i * xInterval,
            y2: temp
        });
    }
    temp = Y_AXIS_HEIGHT / Y_TICKS;
    for (i = 0; i < Y_TICKS; i++) {
        canvas.drawLine({
            layer: true,
            strokeStyle: AXES_COLOUR,
            strokeWidth: 2,
            x1: LEFT_PAD,
            y1: i * temp + TOP_PAD,
            x2: LEFT_PAD - TICK_LENGTH,
            y2: i * temp + TOP_PAD
        });
    }
}

function drawAxes() {
    canvas.drawLine({
        layer: true,
        strokeStyle: AXES_COLOUR,
        strokeWidth: 2,
        x1: LEFT_PAD,
        y1: TOP_PAD,
        x2: LEFT_PAD,
        y2: Y_AXIS_HEIGHT + TOP_PAD,
        x3: WIDTH - RIGHT_PAD,
        y3: Y_AXIS_HEIGHT + TOP_PAD
    });
}

function drawLabels() {
    var
        i, temp;

    temp = TOP_PAD + Y_AXIS_HEIGHT + LABEL_Y_OFFSET;
    for (i = 1; i <= params.data.length; i++) {
        canvas.drawText({
            layer: true,
            fillStyle: TEXT_COLOUR,
            strokeStyle: TEXT_COLOUR,
            strokeWidth: 0,
            x: LEFT_PAD + i * xInterval,
            y: temp,
            fontSize: '10pt',
            fontFamily: 'Verdana, sans-serif',
            text: params.data[i - 1].xLabel
        });
    }
    canvas.drawText({
        layer: true,
        fillStyle: TEXT_COLOUR,
        strokeStyle: TEXT_COLOUR,
        strokeWidth: 0,
        x: LEFT_PAD + X_AXIS_LENGTH / 2,
        y: TOP_PAD + Y_AXIS_HEIGHT + 3 * LABEL_Y_OFFSET,
        fontSize: '11pt',
        fontFamily: 'Verdana, sans-serif',
        text: params.xAxisLabel
    });
    temp = Y_AXIS_HEIGHT / Y_TICKS;
    for (i = 0; i < Y_TICKS; i++) {
        canvas.drawText({
            layer: true,
            fillStyle: TEXT_COLOUR,
            strokeStyle: TEXT_COLOUR,
            strokeWidth: 0,
            fontSize: '10pt',
            x: LEFT_PAD - TICK_LENGTH - LABEL_X_OFFSET,
            y: i * temp + TOP_PAD,
            text: Y_MAX - (i * (Y_MAX / Y_TICKS))
        });
    }
    canvas.drawText({
        layer: true,
        fillStyle: TEXT_COLOUR,
        strokeStyle: TEXT_COLOUR,
        strokeWidth: 0,
        x: LEFT_PAD - 4 * LABEL_X_OFFSET,
        y: TOP_PAD + Y_AXIS_HEIGHT / 2,
        fontSize: '11pt',
        fontFamily: 'Verdana, sans-serif',
        text: params.yAxisLabel,
        rotate: 270
    });
    canvas.drawText({
        layer: true,
        fillStyle: TEXT_COLOUR,
        strokeStyle: TEXT_COLOUR,
        strokeWidth: 0,
        x: LEFT_PAD + X_AXIS_LENGTH / 2,
        y: TOP_PAD - 3 * LABEL_Y_OFFSET,
        fontSize: '14pt',
        fontFamily: 'Verdana, sans-serif',
        text: params.title
    });
}

function drawMean(callback) {
    var
        txt = 'Mean ' + mean.toFixed(1);

    canvas.addLayer({
        type: 'line',
        index: 0,
        strokeStyle: "rgb(0,66,137)",
        strokeWidth: 1,
        x1: LEFT_PAD,
        y1: TOP_PAD + Y_AXIS_HEIGHT - Y_SCALE * mean,
        x2: LEFT_PAD + X_AXIS_LENGTH,
        y2: TOP_PAD + Y_AXIS_HEIGHT - Y_SCALE * mean
    });
    canvas.addLayer({
        type: 'text',
        visible: true,
        fillStyle: '#251',
        strokeStyle: '#25a',
        strokeWidth: 0,
        x: LEFT_PAD + 32,
        y: TOP_PAD + Y_AXIS_HEIGHT - Y_SCALE * mean + 8,
        fontSize: '8pt',
        fontFamily: 'Verdana, sans-serif',
        text: txt
    });
    canvas.drawLayers();
    graphVisible = true;
    setTimeout(callback, PAUSE);
}

function plotData(callback) {
    let i, timer;

    function plotDatum() {
        canvas.drawArc({
            layer: true,
            name: params.data[i].xLabel + "td",
            data: params.data[i],
            strokeStyle: '#444',
            strokeWidth: 1,
            fillStyle: ALERT_BLUE,
            x: LEFT_PAD + (i + 1) * xInterval,
            y: TOP_PAD + Y_AXIS_HEIGHT - Y_SCALE * params.data[i].yVal,
            radius: DATUM_RADIUS,
            mouseover: function (layer) {
                canvas.setLayer('message', {
                    text: layer.data.xLabel + ": " + layer.data.yVal + "%",
                    visible: true
                });
                canvas.drawLayers();
                $("#" + layer.data.xLabel + "td").css({
                    "background-color": ALERT_BLUE,
                });
            },
            mouseout: function (layer) {
                canvas.setLayer('message', {
                    visible: false
                });
                canvas.drawLayers();
                $("#" + layer.data.xLabel + "td").css({
                    "background-color": "inherit",
                });
            }
        });
        if (++i >= params.data.length) {
            clearInterval(timer);
            setTimeout(() => drawMean(callback), PAUSE);
        }
    }

    i = 0;
    timer = setInterval(plotDatum, DATUM_DISPLAY_TIME);

    canvas.addLayer({
        layer: true,
        name: 'message',
        type: 'text',
        visible: false,
        fillStyle: '#251',
        strokeStyle: '#25a',
        strokeWidth: 0,
        x: LEFT_PAD + X_AXIS_LENGTH / 2,
        y: TOP_PAD,
        fontSize: '10pt',
        fontFamily: 'Verdana, sans-serif',
        text: ''
    });

}

function plotDeviations(callback) {
    let
        i = 1,
        timer;

    function drawStem() {
        const offset = params.data[i - 1].yVal > mean ? DATUM_RADIUS : -1 * DATUM_RADIUS;
        canvas.drawLine({
            layer: true,
            name: params.data[i - 1].xLabel + "dev",
            groups: ['stems'],
            strokeStyle: 'rgb(51,51,51)',
            strokeDash: [2],
            strokeDashOffset: 0,
            strokeWidth: 4,
            x1: LEFT_PAD + i * xInterval,
            y1: TOP_PAD + Y_AXIS_HEIGHT + offset - Y_SCALE * params.data[i - 1].yVal,
            x2: LEFT_PAD + i * xInterval,
            y2: TOP_PAD + Y_AXIS_HEIGHT - Y_SCALE * mean,
            mouseover: function (layer) {
                document.getElementById(layer.name).dispatchEvent(new Event("mouseenter"));
            },
            mouseout: function (layer) {
                document.getElementById(layer.name).dispatchEvent(new Event("mouseleave"));
            }
        });
    }

    timer = window.setInterval(function () {
        drawStem();
        if (++i > params.data.length) {
            window.clearInterval(timer);
            deviationsVisible = true;
            callback();
        }
    }, DEVIATION_DISPLAY_TIME);
}

function plotSquares(callback) {

    let i = 1,
        timer;

    function drawSquare() {
        let
            x, y, delta, dev,
            yMean = TOP_PAD + Y_AXIS_HEIGHT - Y_SCALE * mean;

        if (params.data[i - 1].yVal - mean >= 0) {
            y = TOP_PAD + Y_AXIS_HEIGHT - Y_SCALE * params.data[i - 1].yVal;
        } else {
            y = yMean;
        }
        x = 3 + LEFT_PAD + i * xInterval;
        dev = params.data[i - 1].yVal - mean;
        delta = Math.abs(dev * Y_SCALE);
        canvas.drawRect({
            layer: true,
            name: params.data[i - 1].xLabel + "tsd",
            groups: ["squares"],
            fromCenter: false,
            fillStyle: SQUARE_FILL,
            x: x,
            y: y,
            height: delta,
            width: delta,
            mousemove: function (layer) {
                document.getElementById(layer.name).dispatchEvent(new Event("mouseenter"));
            },
            mouseover: function (layer) {
                document.getElementById(layer.name).dispatchEvent(new Event("mouseenter"));
            },
            mouseout: function (layer) {
                document.getElementById(layer.name).dispatchEvent(new Event("mouseleave"));
            }
        });
        canvas.drawLayers();
    }

    timer = setInterval(function () {
        drawSquare();
        if (++i > params.data.length) {
            clearInterval(timer);
            squaresVisible = true;
            callback();
        }
    }, SQUARE_DISPLAY_TIME);
}

function plotRanges({
    populationSD,
    populationLabel,
    sampleSD,
    sampleLabel
}) {
    var
        populationY = TOP_PAD + Y_AXIS_HEIGHT - Y_SCALE * (mean + populationSD),
        populationHeight = Y_SCALE * 2 * populationSD,
        sampleY = TOP_PAD + Y_AXIS_HEIGHT - Y_SCALE * (mean + sampleSD),
        sampleHeight = Y_SCALE * 2 * sampleSD,
        x = LEFT_PAD + 1,
        width = X_AXIS_LENGTH - 1;

    canvas.drawRect({
        layer: true,
        index: 0,
        fillStyle: POP_SD_COLOUR,
        x: x,
        y: populationY,
        width: width,
        height: populationHeight,
        groups: ["population"],
        visible: false,
        fromCenter: false
    });
    canvas.addLayer({
        type: 'text',
        groups: ["population"],
        fromCenter: false,
        visible: false,
        fillStyle: '#251',
        strokeStyle: '#25a',
        strokeWidth: 0,
        x: LEFT_PAD + 12,
        y: TOP_PAD + Y_AXIS_HEIGHT - Y_SCALE * (mean + populationSD) - 12,
        fontSize: '8pt',
        fontFamily: 'Verdana, sans-serif',
        text: populationLabel
    });

    canvas.drawRect({
        layer: true,
        index: 0,
        fillStyle: SAM_SD_COLOUR,
        x: x,
        y: sampleY,
        width: width,
        height: sampleHeight,
        groups: ["sample"],
        visible: false,
        fromCenter: false
    });
    canvas.addLayer({
        type: 'text',
        groups: ["sample"],
        fromCenter: false,
        visible: false,
        fillStyle: '#251',
        strokeStyle: '#25a',
        strokeWidth: 0,
        x: LEFT_PAD + 12,
        y: TOP_PAD + Y_AXIS_HEIGHT - Y_SCALE * (mean + sampleSD) - 12,
        fontSize: '8pt',
        fontFamily: 'Verdana, sans-serif',
        text: sampleLabel
    });
}

function plotPopulationRange() {
    canvas.setLayerGroup("sample", {
        visible: false
    });
    canvas.setLayerGroup("population", {
        visible: true
    });
    canvas.drawLayers();
}

function plotSampleRange() {
    canvas.setLayerGroup("sample", {
        visible: true
    });
    canvas.setLayerGroup("population", {
        visible: false
    });
    canvas.drawLayers();
}

function hideSquares() {
    canvas.setLayerGroup("squares", {
        visible: false
    }).drawLayers();
}

function setupTable() {
    const head = params.page.querySelector("thead tr");
    const dataRow = params.page.querySelector("tbody tr.data");

    let th, td;
    th = document.createElement("th");
    th.innerHTML = "Participant";
    head.appendChild(th);
    th = document.createElement("th");
    th.innerHTML = "Score (%)";
    dataRow.appendChild(th);
    params.data.forEach(item => {
        th = document.createElement("th");
        td = document.createElement("td");
        th.innerHTML = item.xLabel;
        td.innerHTML = "&mdash;";
        td.id = `${item.xLabel}td`;
        td.addEventListener("mouseenter", evt => {
            if (!graphVisible) {
                return;
            }

            const name = evt.currentTarget.id;
            evt.currentTarget.style.backgroundColor = ALERT_BLUE;
            canvas.setLayer(canvas.getLayer(name), {
                fillStyle: "blue"
            });
            canvas.setLayer('message', {
                text: name.slice(0, -2) + ": " + evt.currentTarget.innerHTML + "%",
                visible: true
            });
            canvas.drawLayers();
        });
        td.addEventListener("mouseleave", evt => {
            if (!graphVisible) {
                return;
            }

            const name = evt.currentTarget.id;
            evt.currentTarget.style.backgroundColor = BACKGROUND;
            canvas.setLayer(canvas.getLayer(name), {
                fillStyle: ALERT_BLUE
            });
            canvas.setLayer("message", {
                text: "             ",
                visible: false
            });
            canvas.drawLayers();
        });
        head.appendChild(th);
        dataRow.appendChild(td);
    });
}

function showTableDeviations() {
    const tableBody = params.page.querySelector("tbody");
    const deviationsRow = document.createElement("tr");
    const th = document.createElement("th");

    th.innerHTML = "Deviation (%)";
    deviationsRow.appendChild(th);

    params.data.forEach(item => {
        const td = document.createElement("td");
        td.innerHTML = (item.yVal - mean).toFixed(1);
        td.id = `${item.xLabel}dev`;
        td.addEventListener("mouseenter", evt => {
            if (!deviationsVisible) {
                return;
            }
            const name = evt.currentTarget.id;
            evt.currentTarget.style.backgroundColor = ALERT_BLUE;
            canvas.setLayer(canvas.getLayer(name), {
                strokeStyle: DEVIATION_HIGHLIGHT_STROKE,
                strokeDash: 0,
                strokeWidth: 4
            });
            canvas.setLayer("message", {
                text: name.slice(0, -3) + " deviation: " + evt.currentTarget.innerHTML + "%",
                visible: true
            });
            canvas.drawLayers();
        });
        td.addEventListener("mouseleave", evt => {
            if (!deviationsVisible) {
                return;
            }
            const name = evt.currentTarget.id;
            evt.currentTarget.style.backgroundColor = BACKGROUND;
            canvas.setLayer(canvas.getLayer(name), {
                strokeStyle: DEVIATION_STROKE,
                strokeDash: [2],
                strokeWidth: 4
            });
            canvas.setLayer("message", {
                text: "                      ",
                visible: false
            });
            canvas.drawLayers();
        });
        deviationsRow.appendChild(td);
    });

    tableBody.appendChild(deviationsRow);
}

function showTableSquares() {
    const tableBody = params.page.querySelector("tbody");
    const squaresRow = document.createElement("tr");
    const th = document.createElement("th");
    squares = [];

    th.innerHTML = "Squared Deviation";
    squaresRow.appendChild(th);

    params.data.forEach(item => {
        const td = document.createElement("td");
        const square = (item.yVal - mean) ** 2;
        squares.push(square);
        td.innerHTML = square.toFixed(1);
        td.id = `${item.xLabel}tsd`;
        td.addEventListener("mouseenter", evt => {
            if (!squaresVisible) {
                return;
            }
            const name = evt.currentTarget.id;
            evt.currentTarget.style.backgroundColor = ALERT_BLUE;
            canvas.setLayer(canvas.getLayer(name), {
                fillStyle: SQUARE_HIGHLIGHT_FILL
            });
            canvas.setLayer("message", {
                text: name.slice(0, -3) + " squared deviation: " + evt.currentTarget.innerHTML,
                visible: true
            });
            canvas.drawLayers();
        });
        td.addEventListener("mouseleave", evt => {
            if (!squaresVisible) {
                return;
            }
            const name = evt.currentTarget.id;
            evt.currentTarget.style.backgroundColor = BACKGROUND;
            canvas.setLayer(canvas.getLayer(name), {
                fillStyle: SQUARE_FILL
            });
            canvas.setLayer("message", {
                text: "                             ",
                visible: false
            });
            canvas.drawLayers();
        });
        squaresRow.appendChild(td);
    });

    tableBody.appendChild(squaresRow);
}

function showTableData() {
    const tds = params.page.querySelectorAll("tbody tr.data td");
    let i;

    if (tds.length === params.data.length) {
        for (i = 0; i < tds.length; i++) {
            tds[i].innerHTML = params.data[i].yVal;
        }
    }
}

function getMeanCalculationHTML() {
    let html, sumHtml = "",
        total = 0;
    html = "<h5>Calculating the Mean</h5>";
    params.data.forEach(item => {
        sumHtml += `${item.yVal} + `;
        total += item.yVal;
    });
    sumHtml = sumHtml.slice(0, -2);
    html += `<p><span class="math-ex">&sum; x = ${sumHtml} = ${total}</span></p>
            <p><span class="math-ex">x&#772; = &sum; x &#x2215; N = ${total} &#x2215; ${params.data.length} = ${(total / params.data.length).toFixed(1)}</span></p>
            <p>(Remember: <span class="math-ex">&sum; x</span> means "the <em>sum</em> of all the <span class="math-ex">x</span> data" 
                and <span class="math-ex">x&#772;</span> means "the <em>mean</em> of all the <span class="math-ex">x</span> data")</p>`;
    html += `<p class="mean invisible">The mean is <strong>${(total / params.data.length).toFixed(1)}</strong>.</p>`;
    return html;
}

function showMeanCalculationResult() {
    params.page.querySelector("caption").innerHTML = `Mean = <strong>${mean}</strong>`;
    params.page.querySelector("p.mean.invisible").classList.remove("invisible");
}

function sumSquares(callback) {
    const alert = params.page.querySelector("div.first-alert");
    let eqn, head, i = 0,
        sum = 0;

    eqn = "";
    head = `<h5>Sum of the Squared Deviations from the Mean</h5><p><span class="math-ex">&sum; ( x &minus; x&#772; )</span>&#xb2; =</p>`;

    function appendSquare() {
        const square = squares[i];
        const elem = document.getElementById(params.data[i].xLabel + "tsd");

        elem.dispatchEvent(new Event("mouseenter"));
        setTimeout(() => {
            elem.dispatchEvent(new Event("mouseleave"));
        }, PAUSE * 0.8);

        sum += square;
        if (++i === squares.length) {
            eqn += `${square.toFixed(1)} &equals; ${sum.toFixed(1)}`;
            params.page.querySelector("caption").innerHTML = `Mean = <strong>${mean.toFixed(1)}</strong><br>Sum of the squared deviations from the mean = <strong>${sum.toFixed(1)}</strong>`;
            alert.innerHTML = `${head}<p>${eqn}</p>`;
            callback();
        } else {
            eqn += `${square.toFixed(1)} &plus; `
            alert.innerHTML = `${head}<p>${eqn}</p>`;
            setTimeout(appendSquare, PAUSE);
        }
    }

    setTimeout(appendSquare, PAUSE);
}

function init(paramaters) {
    let sum = 0,
        i;
    params = paramaters;
    canvas = $(params.canvasID);
    xInterval = Math.floor(X_AXIS_LENGTH / (params.data.length + 1));
    for (i = 0; i < params.data.length; i++) {
        sum += params.data[i].yVal;
    }
    mean = params.data.length > 0 ? (sum / params.data.length) : 0;
    drawAxes();
    drawTicks();
    drawLabels();
    setupTable();
}

export {
    init,
    getStats,
    showTableData,
    showTableDeviations,
    showTableSquares,
    getMeanCalculationHTML,
    showMeanCalculationResult,
    plotData,
    plotDeviations,
    plotSquares,
    sumSquares,
    hideSquares,
    plotRanges,
    plotSampleRange,
    plotPopulationRange
};