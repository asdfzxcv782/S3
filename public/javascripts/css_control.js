function hasClass(element, className) {
    var reg = new RegExp('(\\s|^)'+className+'(\\s|$)', 'i');
    return element.className.match(reg);
}

function addClass(element, className) {
    if (!this.hasClass(element, className)){
        element.className += " "+className;
    }
}

function removeClass(element, className) {
    if (hasClass(element, className)) {
        var reg = new RegExp('(\\s|^)'+className+'(\\s|$)', 'i');
        element.className = element.className.replace(reg,' ');
    }
}