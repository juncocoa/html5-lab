var globalLeft, globalTop, initLeft, initTop, matchedCell, currentCell;
var socketCounter = 0;

$.extend($.fn, {
    getCss: function (key) {
        var v = parseInt(this.css(key));
        if (isNaN(v))
            return false;
        return v;
    }
});
$.fn.Drags = function (opts) {
    var ps = $.extend({
        zIndex: 20,
        opacity: .7,
        handler: null,
        onMove: function () { },
        onDrop: function () { }
    }, opts);
    var dragndrop = {
        drag: function (e) {
            var dragData = e.data.dragData;
            dragData.target.css({
                left: dragData.left + e.pageX - dragData.offLeft,
                top: dragData.top + e.pageY - dragData.offTop
            });

            socketCounter++;
            if (socketCounter % MSG_FREQUENCY == 0) {
                socketCounter = 0;
                sendMessage('SendJigSawCoordinates:' + dragData.target[0].className + ';' + dragData.target.getCss('left') + ';' + dragData.target.getCss('top'));
                displayTraceText(homeMoveTileText + dragData.target.getCss('left') + ', ' + dragData.target.getCss('top'));
            }

            tempX = dragData.target.getCss('left') + 64;
            tempY = dragData.target.getCss('top') + 48;
            checkIfInsideCell(dragData.target[0], tempX, tempY);
            dragData.handler.css({ cursor: 'move' });
            dragData.target.css({ cursor: 'move' });
            dragData.onMove(e);
        },
        drop: function (e) {
            var dragData = e.data.dragData;

            sendMessage('SendJigSawCoordinates:' + dragData.target[0].className + ';' + globalLeft + ';' + globalTop);
            displayTraceText(homeMoveTileText + globalLeft + ', ' + globalTop);

            wait(DELAY_TIME);

            if (matchedCell) {
                sendMessage('AssignTile:' + matchedCell.id + ';' + dragData.target[0].className);
                if (matchedCell.id) {
                    displayTraceText(homeAssignTileText + dragData.target[0].className + ' at ' + matchedCell.id);
                }
                else {
                    displayTraceText(homeAssignTileText + dragData.target[0].className + ' at assembly area');
                }
                $(matchedCell).data('assignedTile', dragData.target[0].className);
                $(matchedCell).css('background-color', '');
            }
            else {
                // Clear the blockades from the other client
                sendMessage('ResetTile:' + dragData.target[0].className);
            }

            dragData.target.css('left', globalLeft);
            dragData.target.css('top', globalTop);
            dragData.target.css(dragData.oldCss);
            dragData.handler.css('cursor', dragData.oldCss.cursor);
            dragData.target.css('border-color', '#C0C0C0');
            dragData.target.css('z-index', '0');
            if (isMatchRight(dragData.target[0], matchedCell)) {
                wait(LONG_DELAY_TIME);
                sendMessage('DisableTile:' + dragData.target[0].className);
                $(dragData.target[0].children[0]).attr('disabled', 'disabled');
                $(dragData.target[0]).css('cursor', 'auto');
                $(dragData.target[0].children[0]).css('cursor', 'auto');                
                wait(DELAY_TIME);
                sendMessage('UpdateScore:' + hScore);
                displayTraceText(homeUpdateScoreText + hScore);
                PlaySound('Sounds/right.wav');

                checkIfGameOver();
            }
            else {
                if ($(matchedCell).data('matchingTile')) {
                    PlaySound('Sounds/wrong.wav');
                }
            }
            dragData.onDrop(e);
            $().unbind('mousemove', dragndrop.drag)
                    .unbind('mouseup', dragndrop.drop);
        }
    }
    return this.each(function () {
        var me = this;
        var handler = null;
        if (typeof ps.handler == 'undefined' || ps.handler == null)
            handler = $(me);
        else
            handler = (typeof ps.handler == 'string' ? $(ps.handler, this) : ps.handle);
        handler.bind('mousedown', { e: me }, function (s) {
            var target = $(s.data.e);
            var oldCss = {};
            if (target.css('position') != 'absolute') {
                try {
                    target.position(oldCss);
                } catch (ex) { }
                target.css('position', 'absolute');
            }
            oldCss.cursor = 'move';
            oldCss.opacity = target.getCss('opacity') || 1;
            var dragData = {
                left: findPosX(target[0]),
                top: findPosY(target[0]),
                width: target.width() || target.getCss('width'),
                height: target.height() || target.getCss('height'),
                offLeft: s.pageX,
                offTop: s.pageY,
                oldCss: oldCss,
                onMove: ps.onMove,
                onDrop: ps.onDrop,
                handler: handler,
                target: target
            }
            globalLeft = initLeft = findPosX(this);
            globalTop = initTop = findPosY(this);

            sendMessage('SelectTile:' + target[0].className);
            displayTraceText(homeSelectTileText + target[0].className);

            target.css('opacity', ps.opacity);
            target.css('border-color', 'green');
            target.css('z-index', '200');
            target.css('cursor', 'move');
            $().bind('mousemove', { dragData: dragData }, dragndrop.drag)
                    .bind('mouseup', { dragData: dragData }, dragndrop.drop);
        });
    });
}
function findPosX(obj) {
    var curleft = 0;
    if (obj.offsetParent)
        while (1) {
            curleft += obj.offsetLeft;
            if (!obj.offsetParent)
                break;
            obj = obj.offsetParent;
        }
    else if (obj.x)
        curleft += obj.x;
    return curleft;
}

function findPosY(obj) {
    var curtop = 0;
    if (obj.offsetParent)
        while (1) {
            curtop += obj.offsetTop;
            if (!obj.offsetParent)
                break;
            obj = obj.offsetParent;
        }
    else if (obj.y)
        curtop += obj.y;
    return curtop;
}

function checkIfInsideCell(obj, left, top) {
    var foundMatch = false;
    $('td').each(function (index) {
        if ((left >= findPosX(this)) && (left < findPosX(this) + 128)) {
            if ((top >= findPosY(this)) && (top < findPosY(this) + 96)) {
                $(this).css('background-color', '#0c0');
                foundMatch = true;
                matchedCell = this;
            }
            else {
                $(this).css('background-color', '');
            }
        }
        else {
            $(this).css('background-color', '');
        }
    });

    if (!foundMatch) {
        globalLeft = initLeft;
        globalTop = initTop;
        matchedCell = null;
    }
    else {
        ClearBinding(obj.className);
        var assignedTile = $(matchedCell).data('assignedTile');
        if (!assignedTile || assignedTile == obj.className) {
            globalLeft = findPosX(matchedCell);
            globalTop = findPosY(matchedCell);
        }
        else {
            globalLeft = initLeft;
            globalTop = initTop;
            matchedCell = currentCell;
        }
    }
}

function isMatchRight(obj, matchedCell) {
    if (obj && matchedCell) {
        if ($(obj.children[0]).css('background-image') == $(matchedCell).data('matchingTile')) {
            hScore = hScore + 1;
            $('#homeScore').text(hScore);
            return true;
        }
    }
    return false;
}

function ClearBinding(val) {
    $('td').each(function (index) {
        var assignedTile = $(this).data('assignedTile');
        if (assignedTile == val) {
            currentCell = this;
            $(this).data('assignedTile', '');
         }
    });
}

function checkIfGameOver() {
    if (parseInt(hScore) + parseInt(aScore) == 16) {
        wait(DELAY_TIME);
        sendMessage('GameComplete');
    }
}

function wait(msecs) {
    var start = new Date().getTime();
    var cur = start
    while (cur - start < msecs) {
        cur = new Date().getTime();
    }
}

function smoothenMove(obj, newLeft, newTop, time) {
    $(obj).animate({
        left: newLeft,
        top: newTop
    }, time, function () {
    });
}