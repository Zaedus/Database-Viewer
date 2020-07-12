const { ipcRenderer } = require('electron')
const path = require('path');

$("#fileupload").on("input", (e) => {
    console.log("Sending off file!");
    $(".dimmer").removeClass("disabled").addClass("active")
    setTimeout(() => {
        var response = ipcRenderer.sendSync("loadFromFile", $("#fileupload").prop("files")[0].path);
        if(response == "close") window.close();
        if(response == "not_found") return alert("Err: File not found.");
    }, 200);
});

(function() {
    var data = ipcRenderer.sendSync("files");
    data.forEach(v => {
        var parsed = path.parse(v.path);
        const item = document.createElement("div");
        item.className = "item";
        item.innerHTML += 
            `<i class="large file middle aligned icon"></i>
            <div class="content">
                <a class="header">${parsed.name}${parsed.ext}</a>
                <div class="description">
                    ${parsed.dir}/
                </div>
            </div>`

        $(item).click(e => {
            var response = ipcRenderer.sendSync("loadFromFile", v.path);
            if(response == "close") window.close();
            if(response == "not_found") return alert("Err: File not found.");
        })
        $("#files").append(item);
    })
})()
$("#clear").click(v => {
    if(confirm("Are you sure you want to clear your file history?")) {
        var response = ipcRenderer.sendSync("clearFiles");
        if(response == "success") $("#files").empty();
    }
})