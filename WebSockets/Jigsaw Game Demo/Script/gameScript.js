function displayTraceText(text) {
    var msg = document.getElementById('msg');
    if (!text) {
        while (msg.hasChildNodes()) {
            msg.removeChild(msg.lastChild);
        }
    }
    else {
        var newDiv = document.createElement('div');
        newDiv.appendChild(document.createTextNode(text));
        msg.appendChild(newDiv);
        msg.scrollTop = msg.scrollHeight;
    }
}

function PlaySound(url) {
    document.all.sound.src = url;
}

function updatePlayerList(names, addOrUpdate) {
    switch (addOrUpdate) {
        case 0:
            populatePlayerList(names);
            break;
        case 1:
            addPlayersToPlayerList(names);
            break;
        case 2:
            removePlayerFromPlayerList(names);
            break;
    }
}

function populatePlayerList(playerNames) {
    if (playerNames[0] == '') {
        selectorMessageText.innerHTML = 'No player is available';

        $("#playerList li").remove();
        return;
    }

    $("#playerList li").remove();

    addPlayersToPlayerList(playerNames);
}

function addPlayersToPlayerList(playerNames) {
    for (var i = 0; i < playerNames.length; i++) {

        var listElement = document.createElement("li");
        listElement.setAttribute("id", "player-" + playerNames[i]);
        var player = document.createElement("a");
        player.setAttribute("href", "#");
        player.innerHTML = playerNames[i];
        $(player).click(function (event) {
            event.preventDefault();
            var selectedPlayer = this.innerHTML;
            sendMessage('SelectPlayer:' + selectedPlayer);
        });

        listElement.appendChild(player);
        $("#playerList").append(listElement);

        selectorMessageText.innerHTML = '';
    }
}

function removePlayerFromPlayerList(playerNames) {
    for (var index in playerNames) {
        $("#player-" + playerNames[index]).remove();
    }

    if (0 == $("li").length) {
        selectorMessageText.innerHTML = 'No player is available';
    }
}

function showLoggedOutState(errorMessage) {
    loginDiv.style.display = 'block';

    gameDiv.style.display = 'none';
    playerDiv.style.display = 'none';
    
    resetData();
    logError.innerHTML = errorMessage;
}

function showLoggedInState(errorMessage) {
    loginDiv.style.display = 'none';
    playerDiv.style.display = 'block';
    gameDiv.style.display = 'none';
    resetData();

    if ('' != errorMessage) {
        selectorMessageText.innerHTML = errorMessage;
    }
}

function showGameStartState() {
    playerDiv.style.display = 'none';
    gameDiv.style.display = 'block';
    resetData();
}

function resetData() {
    awayPlayer = '';
    gameFinished = false;
    gameMessageText.innerHTML = '';
    logError.innerHTML = '';
    selectorMessageText.innerHTML = '';
    
    displayTraceText(null);
    

    $('td').each(function (index) {
        $(this).data('assignedTile', '');
    });

    hScore = 0, aScore = 0;
    socketCounter = 0;
    globalLeft = globalTop = initLeft = initTop = null;
    matchedCell = currentCell = null;

    initTiles();
}

function restartGame() {
    showLoggedInState('');
    sendMessage('GetPlayersList');
}

function KeyCheck() {
    var keyID = event.keyCode;
    if (keyID == WIN_KEY) {
        winGame();
    }
}

function winGame() {
    placeMatchingTiles();
    hScore = 16 - aScore;
    $('#homeScore').text(hScore);
    wait(LONG_DELAY_TIME);
    sendMessage('UpdateScore:' + hScore);
    displayTraceText(homeUpdateScoreText + hScore);
    setTimeout('checkIfGameOver()', WIN_DELAY_TIME)
}

function placeMatchingTiles() {
    var tile, left, top;
    
    tile = document.getElementById('tiles0');
    left = findPosX(tile);
    top = findPosY(tile);

    smoothenMove('.tiles15', left, top, WIN_DELAY_TIME);
    sendMessage('SendJigSawCoordinates:' + 'tiles15' + ';' + left + ';' + top);
    sendMessage('AssignTile:' + tile.id + ';' + 'tiles15');
    displayTraceText(homeMoveTileText + left + ', ' + top);

    tile = document.getElementById('tiles1');
    left = findPosX(tile);
    top = findPosY(tile);

    smoothenMove('.tiles14', left, top, WIN_DELAY_TIME);
    sendMessage('SendJigSawCoordinates:' + 'tiles14' + ';' + left + ';' + top);
    sendMessage('AssignTile:' + tile.id + ';' + 'tiles14');
    displayTraceText(homeMoveTileText + left + ', ' + top);

    tile = document.getElementById('tiles2');
    left = findPosX(tile);
    top = findPosY(tile);

    smoothenMove('.tiles13', left, top, WIN_DELAY_TIME);
    sendMessage('SendJigSawCoordinates:' + 'tiles13' + ';' + left + ';' + top);
    sendMessage('AssignTile:' + tile.id + ';' + 'tiles13');
    displayTraceText(homeMoveTileText + left + ', ' + top);

    tile = document.getElementById('tiles3');
    left = findPosX(tile);
    top = findPosY(tile);

    smoothenMove('.tiles12', left, top, WIN_DELAY_TIME);
    sendMessage('SendJigSawCoordinates:' + 'tiles12' + ';' + left + ';' + top);
    sendMessage('AssignTile:' + tile.id + ';' + 'tiles12');
    displayTraceText(homeMoveTileText + left + ', ' + top);

    tile = document.getElementById('tiles4');
    left = findPosX(tile);
    top = findPosY(tile);

    smoothenMove('.tiles11', left, top, WIN_DELAY_TIME);
    sendMessage('SendJigSawCoordinates:' + 'tiles11' + ';' + left + ';' + top);
    sendMessage('AssignTile:' + tile.id + ';' + 'tiles11');
    displayTraceText(homeMoveTileText + left + ', ' + top);

    tile = document.getElementById('tiles5');
    left = findPosX(tile);
    top = findPosY(tile);

    smoothenMove('.tiles10', left, top, WIN_DELAY_TIME);
    sendMessage('SendJigSawCoordinates:' + 'tiles10' + ';' + left + ';' + top);
    sendMessage('AssignTile:' + tile.id + ';' + 'tiles10');
    displayTraceText(homeMoveTileText + left + ', ' + top);

    tile = document.getElementById('tiles6');
    left = findPosX(tile);
    top = findPosY(tile);

    smoothenMove('.tiles9', left, top, WIN_DELAY_TIME);
    sendMessage('SendJigSawCoordinates:' + 'tiles9' + ';' + left + ';' + top);
    sendMessage('AssignTile:' + tile.id + ';' + 'tiles9');
    displayTraceText(homeMoveTileText + left + ', ' + top);

    tile = document.getElementById('tiles7');
    left = findPosX(tile);
    top = findPosY(tile);

    smoothenMove('.tiles8', left, top, WIN_DELAY_TIME);
    sendMessage('SendJigSawCoordinates:' + 'tiles8' + ';' + left + ';' + top);
    sendMessage('AssignTile:' + tile.id + ';' + 'tiles8');
    displayTraceText(homeMoveTileText + left + ', ' + top);

    tile = document.getElementById('tiles8');
    left = findPosX(tile);
    top = findPosY(tile);

    smoothenMove('.tiles7', left, top, WIN_DELAY_TIME);
    sendMessage('SendJigSawCoordinates:' + 'tiles7' + ';' + left + ';' + top);
    sendMessage('AssignTile:' + tile.id + ';' + 'tiles7');
    displayTraceText(homeMoveTileText + left + ', ' + top);

    tile = document.getElementById('tiles9');
    left = findPosX(tile);
    top = findPosY(tile);

    smoothenMove('.tiles6', left, top, WIN_DELAY_TIME);
    sendMessage('SendJigSawCoordinates:' + 'tiles6' + ';' + left + ';' + top);
    sendMessage('AssignTile:' + tile.id + ';' + 'tiles6');
    displayTraceText(homeMoveTileText + left + ', ' + top);

    tile = document.getElementById('tiles10');
    left = findPosX(tile);
    top = findPosY(tile);

    smoothenMove('.tiles0', left, top, WIN_DELAY_TIME);
    sendMessage('SendJigSawCoordinates:' + 'tiles0' + ';' + left + ';' + top);
    sendMessage('AssignTile:' + tile.id + ';' + 'tiles0');
    displayTraceText(homeMoveTileText + left + ', ' + top);

    tile = document.getElementById('tiles11');
    left = findPosX(tile);
    top = findPosY(tile);

    smoothenMove('.tiles1', left, top, WIN_DELAY_TIME);
    sendMessage('SendJigSawCoordinates:' + 'tiles1' + ';' + left + ';' + top);
    sendMessage('AssignTile:' + tile.id + ';' + 'tiles1');
    displayTraceText(homeMoveTileText + left + ', ' + top);

    tile = document.getElementById('tiles12');
    left = findPosX(tile);
    top = findPosY(tile);

    smoothenMove('.tiles2', left, top, WIN_DELAY_TIME);
    sendMessage('SendJigSawCoordinates:' + 'tiles2' + ';' + left + ';' + top);
    sendMessage('AssignTile:' + tile.id + ';' + 'tiles2');
    displayTraceText(homeMoveTileText + left + ', ' + top);

    tile = document.getElementById('tiles13');
    left = findPosX(tile);
    top = findPosY(tile);

    smoothenMove('.tiles3', left, top, WIN_DELAY_TIME);
    sendMessage('SendJigSawCoordinates:' + 'tiles3' + ';' + left + ';' + top);
    sendMessage('AssignTile:' + tile.id + ';' + 'tiles3');
    displayTraceText(homeMoveTileText + left + ', ' + top);

    tile = document.getElementById('tiles14');
    left = findPosX(tile);
    top = findPosY(tile);

    smoothenMove('.tiles4', left, top, WIN_DELAY_TIME);
    sendMessage('SendJigSawCoordinates:' + 'tiles4' + ';' + left + ';' + top);
    sendMessage('AssignTile:' + tile.id + ';' + 'tiles4');
    displayTraceText(homeMoveTileText + left + ', ' + top);

    tile = document.getElementById('tiles15');
    left = findPosX(tile);
    top = findPosY(tile);

    smoothenMove('.tiles5', left, top, WIN_DELAY_TIME);
    sendMessage('SendJigSawCoordinates:' + 'tiles5' + ';' + left + ';' + top);
    sendMessage('AssignTile:' + tile.id + ';' + 'tiles5');
    displayTraceText(homeMoveTileText + left + ', ' + top);
}

function initTiles() {
    $('.tiles0').css('left', 660);
    $('.tiles0').css('top', 153);
    $('.tiles0').css('cursor', 'move');
    $('.tiles0').children().removeAttr('disabled');
    $('.tiles0').children().css('cursor', 'move');

    $('.tiles1').css('left', 796);
    $('.tiles1').css('top', 153);
    $('.tiles1').css('cursor', 'move');
    $('.tiles1').children().removeAttr('disabled');
    $('.tiles1').children().css('cursor', 'move');

    $('.tiles2').css('left', 931);
    $('.tiles2').css('top', 153);
    $('.tiles2').css('cursor', 'move');
    $('.tiles2').children().removeAttr('disabled');
    $('.tiles2').children().css('cursor', 'move');

    $('.tiles3').css('left', 1066);
    $('.tiles3').css('top', 153);
    $('.tiles3').css('cursor', 'move');
    $('.tiles3').children().removeAttr('disabled');
    $('.tiles3').children().css('cursor', 'move');

    $('.tiles4').css('left', 660);
    $('.tiles4').css('top', 256);
    $('.tiles4').css('cursor', 'move');
    $('.tiles4').children().removeAttr('disabled');
    $('.tiles4').children().css('cursor', 'move');

    $('.tiles5').css('left', 796);
    $('.tiles5').css('top', 256);
    $('.tiles5').css('cursor', 'move');
    $('.tiles5').children().removeAttr('disabled');
    $('.tiles5').children().css('cursor', 'move');

    $('.tiles6').css('left', 931);
    $('.tiles6').css('top', 256);
    $('.tiles6').css('cursor', 'move');
    $('.tiles6').children().removeAttr('disabled');
    $('.tiles6').children().css('cursor', 'move');

    $('.tiles7').css('left', 1066);
    $('.tiles7').css('top', 256);
    $('.tiles7').css('cursor', 'move');
    $('.tiles7').children().removeAttr('disabled');
    $('.tiles7').children().css('cursor', 'move');

    $('.tiles8').css('left', 660);
    $('.tiles8').css('top', 359);
    $('.tiles8').css('cursor', 'move');
    $('.tiles8').children().removeAttr('disabled');
    $('.tiles8').children().css('cursor', 'move');

    $('.tiles9').css('left', 796);
    $('.tiles9').css('top', 359);
    $('.tiles9').css('cursor', 'move');
    $('.tiles9').children().removeAttr('disabled');
    $('.tiles9').children().css('cursor', 'move');

    $('.tiles10').css('left', 931);
    $('.tiles10').css('top', 359);
    $('.tiles10').css('cursor', 'move');
    $('.tiles10').children().removeAttr('disabled');
    $('.tiles10').children().css('cursor', 'move');

    $('.tiles11').css('left', 1066);
    $('.tiles11').css('top', 359);
    $('.tiles11').css('cursor', 'move');
    $('.tiles11').children().removeAttr('disabled');
    $('.tiles11').children().css('cursor', 'move');

    $('.tiles12').css('left', 660);
    $('.tiles12').css('top', 462);
    $('.tiles12').css('cursor', 'move');
    $('.tiles12').children().removeAttr('disabled');
    $('.tiles12').children().css('cursor', 'move');

    $('.tiles13').css('left', 796);
    $('.tiles13').css('top', 462);
    $('.tiles13').css('cursor', 'move');
    $('.tiles13').children().removeAttr('disabled');
    $('.tiles13').children().css('cursor', 'move');

    $('.tiles14').css('left', 931);
    $('.tiles14').css('top', 462);
    $('.tiles14').css('cursor', 'move');
    $('.tiles14').children().removeAttr('disabled');
    $('.tiles14').children().css('cursor', 'move');

    $('.tiles15').css('left', 1066);
    $('.tiles15').css('top', 462);
    $('.tiles15').css('cursor', 'move');
    $('.tiles15').children().removeAttr('disabled');
    $('.tiles15').children().css('cursor', 'move');
}