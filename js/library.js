function list_folders_from_lib() {

    $(".popup").toggle();

    var gebalib_url = "https://api.github.com/repos/Lindem-Data-Acquisition-AS/gedalib/git/trees/4a7f27695351fa8a9d97f7b2edc189b4340885d0";

    $.getJSON( gebalib_url, function( data ) {
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
