file_loaded = false;

function save_text_as_file() {

    var text_to_write = editor.getValue();
    var text_file_as_blob = new Blob([text_to_write], {type:'text/plain'});
    var file_name = "component.fp";

    var download_link = document.createElement("a");
    download_link.download = file_name;
    download_link.innerHTML = "Download File";

    if (window.webkitURL != null) {

        // Chrome allows the link to be clicked
        // without actually adding it to the DOM.
        download_link.href = window.webkitURL.createObjectURL(text_file_as_blob);

    } else {

        // Firefox requires the link to be added to the DOM
        // before it can be clicked.
        download_link.href = window.URL.createObjectURL(text_file_as_blob);
        download_link.onclick = destroy_clicked_element;
        download_link.style.display = "none";
        document.body.appendChild(download_link);
    }

    download_link.click();
}

function destroy_clicked_element(event) {
    document.body.removeChild(event.target);
}

function load_file_as_text() {

    file_loaded = true;

    var file_to_load = document.getElementById("file_to_load").files[0];

    var file_reader = new FileReader();
    file_reader.onload = function(event) {
        editor.setValue(event.target.result);
    };

    file_reader.readAsText(file_to_load, "UTF-8");
}
