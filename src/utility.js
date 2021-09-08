/* exported Utility */

const Utility = {

    getBtnClick(btn, enableDisable = true) {
        if (enableDisable) {
            btn.disabled = false;
        }
        return new Promise(function (resolve) {
            function onClick() {
                console.log("Click!");
                btn.removeEventListener("click", onClick);
                if (enableDisable) {
                    btn.disabled = true;
                }
                resolve();
            }
            btn.addEventListener("click", onClick);
        });
    },

    async postCsv(csv, endpoint) {
        const formData = new FormData();
        formData.append("csv", csv);
        const response = await fetch(endpoint, {
            body: formData,
            method: "post"
        });
        const responseText = await response.text();
        return responseText;
    },

    fadeOut(el) {
        el.style.opacity = 1;

        return new Promise(function (resolve) {
            (function fade() {
                if ((el.style.opacity -= .1) < 0) {
                    el.style.display = "none";
                    resolve();
                } else {
                    requestAnimationFrame(fade);
                }
            })();
        });
    },

    fadeIn(el, display = "block") {
        el.style.opacity = 0;
        el.style.display = display;

        return new Promise(function (resolve) {
            (function fade() {
                var val = parseFloat(el.style.opacity);
                if (!((val += .1) > 1)) {
                    el.style.opacity = val;
                    requestAnimationFrame(fade);
                }
                else {
                    resolve();
                }
            })();
        });
    },

    ready(callback) {
        if (document.readyState !== "loading") {
            callback();
        }
        else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    }
};
