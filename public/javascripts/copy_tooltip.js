function copy_clipboard(motivatebox) {
    
    this.motivatebox = motivatebox;

    this.tooltip = document.createElement('div');

    this.tooltip.style.cssText =
        'position:absolute; background:black; color:white; padding:4px;z-index:10000;' + 'border-radius:2px; font-size:12px;box-shadow:3px 3px 3px rgba(0,0,0,.4);' + 'opacity:0;transition:opacity 0.3s';
    this.tooltip.innerHTML = 'Copied!';

    document.body.appendChild(this.tooltip);

}

copy_clipboard.prototype.addEL = function () {

    this.motivatebox.addEventListener('mouseup', function (e) {
        var e = e || event // equalize event object between modern and older IE browsers
        var target = e.target || e.srcElement // get target element mouse is over

        this.selectElementText(target); // 全選文字

        var copysuccess = this.copySelectionText(); //複製文字

        if (copysuccess) {
            this.showtooltip(e);
        }

    }.bind(this), false);
}

copy_clipboard.prototype.showtooltip = function (e) {
    var evt = e || event;
    clearTimeout(this.hidetooltiptimer);
    this.tooltip.style.left = evt.pageX - 10 + 'px';
    this.tooltip.style.top = evt.pageY + 15 + 'px';
    this.tooltip.style.opacity = 1;
    this.hidetooltiptimer = setTimeout(function () {
        this.tooltip.style.opacity = 0
    }.bind(this), 500);
}

copy_clipboard.prototype.selectElementText = function (el) {
    var range = document.createRange() // create new range object
    range.selectNodeContents(el) // set range to encompass desired element text
    var selection = window.getSelection() // get Selection object from currently user selected text
    selection.removeAllRanges() // unselect any user selected text (if any)
    selection.addRange(range) // add range to Selection object to select it
}

copy_clipboard.prototype.copySelectionText = function () {
    this.copysuccess // var to check whether execCommand successfully executed
    try {
        this.copysuccess = document.execCommand("copy") // run command to copy selected text to clipboard
    } catch (e) {
        this.copysuccess = false
    }
    return this.copysuccess
}