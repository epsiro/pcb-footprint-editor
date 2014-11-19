var hidden = true;
$("div#lib").hide();

function get_url_and_list_folders_from_lib() {

    var gedalib_url = "https://api.github.com/repos/Lindem-Data-Acquisition-AS/gedalib/git/refs/heads/dev"

    // FIXME Use $.when instead of nested ajax calls, and return the
    // footprints_url. Let list_folders_from_lib call this function.
    $.getJSON( gedalib_url, function( data ) {
        $.getJSON( data.object.url, function( data ) {
            $.getJSON( data.tree.url, function( data ) {
                $.each( data.tree, function( key, val ) {
                    if (val.path == "footprints") {
                        var footprints_url = val.url;
                        list_folders_from_lib(footprints_url);
                    }
                });
            });
        });
    });
}

function list_folders_from_lib(footprints_url) {

    if (hidden != true) {
        hidden = true;
        $("div#lib").hide();
        $("div#lib").css("width", "0%");
        $("div#graphical_editor").css("width", "50%");
        $("div#code").css("width", "50%");
    } else {
        hidden = false;
        $("div#lib").show();
        $("div#lib").css("width", "20%");
        $("div#graphical_editor").css("width", "40%");
        $("div#code").css("width", "40%");
    }

    $.getJSON( footprints_url, function( data ) {
        var items = [];
        $.each( data.tree, function( key, val ) {
            items.push( "<li role='presentation'><i class='fa-li fa fa-folder'></i><a role='menuitem' href='#' class='folder' data-url='" + val.url + "'>" + val.path + "</a></li>" );
        });

        $("ul#gedalib").html(items.join(""));
    });
}

function list_components_in_folder() {

    $("ul#gedalib li ul").remove();
    $("ul#gedalib li i").attr("class", "fa fa-li fa-folder");

    var component_list_url = $(this).data("url");

    var parentThis = this;

    $.getJSON( component_list_url, function( data ) {
        var items = [];

        $.each( data.tree, function( key, val ) {
            items.push( "<li><i class='fa-li fa fa-file-code-o'></i><a href='#' class='file' data-url='" + val.url + "'>" + val.path + "</a></li>" );
        });

        $( "<ul/>", {
            "class": "components fa-ul",
            html: items.join("")
        }).appendTo( $(parentThis).parent() );
    });

    $(this).parent().find("i").attr("class", "fa fa-li fa-folder-open");
}

function load_component_from_folder() {

    var component_url = $(this).data("url");

    $.getJSON( component_url, function( data ) {
        file_loaded = true;
        new_component();
        editor.setValue(atob(data.content));
    });
}
