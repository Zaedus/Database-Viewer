const { ipcRenderer } = require("electron");

/**
 * @param {jQuery<HTMLElement>} elms
 * @param {string[]} options
 */
const addOptions = (elms, options) => {
    elms.each((i, elm) => {
        elm.innerHTML = "";
        for (let a = 0; a < options.length; a++) {
            elm.innerHTML += `<div class="item" data-value="${options[a]}">${options[a]}</div>`;
        }
    });
    //$('div.dropdown').dropdown();
};

const getFilters = () => {
    var final = {};
    var keys = $("#filter").find("div#filterinput").dropdown("get value");
    var values = [];
    $("#filter")
        .find("div#filtervalue")
        .each((i, elm) => {
            if (elm.classList.contains("dropdown")) {
                values.push($(elm).dropdown("get value"));
            } else if (elm.classList.contains("input")) {
                values.push(elm.getElementsByTagName("input")[0].value);
            }
        });
    if (typeof keys == "string") keys = [keys];
    for (let a = 0; a < keys.length; a++) {
        final[keys[a]] = values[a];
    }
    return final;
};
/**
 * @returns {string[]}
 */
const getValues = () =>
    $("#values")
        .dropdown("get value")
        .split(",")
        .filter((v) => v);
/**
 *
 * @param {Object[]} data
 * @param {string[]} values
 */
const parseCount = (data, values) => {
    var final = [];
    for (let val of values) {
        var tmp = {};
        for (let row of data) {
            if (!tmp[row[val]]) tmp[row[val]] = 0;
            tmp[row[val]]++;
        }
        final.push(tmp);
    }
    return final.length > 0 ? final : { undefined: data };
};
var types = {};
ipcRenderer.on(
    "data",
    /** @param {Object[]} data */ (e, data) => {
        for (let row of data) {
            for (let entries of Object.entries(row)) {
                let key = entries[0];
                let value = entries[1] == null ? "Unknown" : entries[1];
                if (!types[key]) types[key] = [];
                if (types[key].indexOf(value) == -1) types[key].push(value);
            }
        }
        $("div.dimmer").removeClass("active").addClass("disabled");
        $("#newfilter").click(() => {
            if ($(".filtergrid").length == 0) $("div.container#filter").empty();
            $("div.container#filter").append(`
            <div class="ui grid filtergrid">
                <div class="eight wide column">
                    <div class="ui selection dropdown fluid search" id='filterinput'>
                        <input type="hidden" name="filter" />
                        <i class="dropdown icon"></i>
                        <div class="default text">Filter</div>
                        <div class="menu"></div>
                    </div>
                </div>
                <div class="six wide column">
                    <div class="ui selection dropdown fluid search" id='filtervalue'>
                        <input type="hidden" name="value" />
                        <i class="dropdown icon"></i>
                        <div class="default text">Value</div>
                        <div class="menu"></div>
                    </div>
                </div>
                <div class="two wide column">
                    <button class="ui button fluid" id="remove">
                        <div class="visible content">
                            <i class="minus icon"></i>
                        </div>
                    </button>
                </div>
            </div>`);
            $("button.button#remove").click((event) => {
                event.delegateTarget.parentNode.parentElement.remove();
            });
            $("div.dropdown#filterinput")
                .dropdown("destroy")
                .dropdown({
                    onChange: (_, val, elm) => {
                        if (types[val].length >= 100) {
                            var input = elm
                                .parents(".filtergrid")
                                .children(".six")
                                .children("#filtervalue");
                            input.empty();
                            input.removeClass();
                            input.addClass("ui input fluid");
                            input.append(
                                `<input type="text" placeholder="Value">`
                            );
                        } else {
                            var dropdown = elm
                                .parents(".filtergrid")
                                .children(".six")
                                .children("#filtervalue");
                            dropdown.empty();
                            dropdown.removeClass();
                            dropdown.addClass(
                                "ui selection dropdown fluid search"
                            );
                            dropdown.append(`
								<input type="hidden" name="value" />
								<i class="dropdown icon"></i>
								<div class="default text">Value</div>
								<div class="menu"></div>
                        	`);
                            addOptions(dropdown.children(".menu"), types[val]);
                            dropdown.dropdown("destroy").dropdown("clear");
                        }
                    },
                });
            addOptions(
                $("div.dropdown#filterinput .menu"),
                Object.keys(data[0])
            );
        });

        $("#create").click((event) => {
            event.delegateTarget.classList.add("loading");
            setTimeout(() => {
                const filters = Object.entries(getFilters());
                const values = getValues();
                var tmp = data.filter((v, i) => {
                    for (let filter of filters) {
                        if (
                            v[filter[0]] !=
                            (filter[1] == "Unknown" ? null : filter[1])
                        )
                            return false;
                    }
                    return true;
                });

                var parsed = parseCount(tmp, values);
                var container = $("#datacontainer");
                container.empty();
                if (values.length == 0) {
                    var table = document.createElement("table");
                    table.classList.add(
                        "ui",
                        "table",
                        "stripped",
                        "celled",
                        "sortable"
                    );
                    table.innerHTML += `<tr><td><b>Total</b></td><td><b>${parsed.undefined.length}</b></td></tr>`;
                    container.append(table);
                }

                for (let i = 0; i < values.length; i++) {
                    var table = document.createElement("table");
                    table.classList.add(
                        "ui",
                        "table",
                        "stripped",
                        "celled",
                        "sortable"
                    );
                    table.innerHTML += `<thead>
                        <tr>
                            <th style="width: 50%;">${values[i]}</th>
							<th style="width: 50%;" class="sorted ascending">#</th>
                        </tr>
                    </thead>`;
                    var total = 0;
                    var tmpparsed = Object.entries(parsed[i]).sort(
                        (a, b) => b[1] - a[1]
                    );

                    for (let entry of tmpparsed) {
                        if (entry[0] == "undefined") {
                            total += entry[1] == "null" ? 0 : Number(entry[1]);
                            continue;
                        }
                        table.innerHTML += `
						<tr>
							<td>${entry[0] == "null" ? "Unknown" : entry[0]}</td>
							<td>${entry[1] == "null" ? 0 : entry[1]}</td>
						</tr>`;
                        total += entry[1] == "null" ? 0 : Number(entry[1]);
                    }
                    table.innerHTML += `<tr><td><b>Total</b></td><td><b>${total}</b></td></tr>`;
                    table.innerHTML += `<tr><td><button class="ui button" id="copytable"><i class="icon outline file"></i> Copy</button</td><td></td></tr>`;
                    container.append(table);
                    $("#copytable").on("click", (handler) => {
                        handler.delegateTarget.classList.add("loading");
                        var data = $(table)
                            .find("td")
                            .toArray()
                            .map((v) => v.innerText);
                        data.splice(data.length - 4, 3);
                        console.log(data.length);
                        var copystr = "";
                        for (let a = 0; a < data.length; a += 2) {
                            console.log(data[a], data[a + 1]);
                            copystr += (data[a] + ",").repeat(
                                Number(data[a + 1])
                            );
                        }
                        console.log(copystr);
                        copyTextToClipboard(copystr);
                        handler.delegateTarget.classList.remove("loading");
                    });
                }
                event.delegateTarget.classList.remove("loading");
            }, 200);
        });

        addOptions($("#values .menu"), Object.keys(data[0]));
        $("#values").dropdown();
    }
);

function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        var successful = document.execCommand("copy");
        var msg = successful ? "successful" : "unsuccessful";
        console.log("Fallback: Copying text command was " + msg);
    } catch (err) {
        console.error("Fallback: Oops, unable to copy", err);
    }

    document.body.removeChild(textArea);
}
function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return;
    }
    navigator.clipboard.writeText(text).then(
        function () {
            console.log("Async: Copying to clipboard was successful!");
        },
        function (err) {
            console.error("Async: Could not copy text: ", err);
        }
    );
}
