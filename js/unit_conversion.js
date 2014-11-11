function nm_to_view(number) {
    return number/10000
}

function view_to_nm(number) {
    return number*10000
}

function nm_to_mm(number) {
    return number/1000000
}

function mm_to_nm(number) {
    return number*1000000
}

function nm_to_mil(number) {
    return number/25400
}

function mil_to_nm(number) {
    return number*25400
}

function parse_length(s) {

    var pos_mm = s.indexOf("mm");
    if (pos_mm > -1) {
        return mm_to_nm(s.slice(0, pos_mm).trim());

    }

    var pos_mil = s.indexOf("mil");
    if (pos_mil > -1) {
        return mil_to_nm(s.slice(0, pos_mil).trim());
    }
}

