$(document).ready(function(){
    // console.log('test');
    // var msgRef = firebase.database().ref('/messages/');

    // $('#btn').on('click', function(){
    //     var msg = $("#input").val()
    //     console.log(msg);
    //     msgRef.push({
    //         message: msg
    //     })
    // })
})

var playerA = null;
var playerB = null;

var playerAName = "";
var playerBName = "";

var yourPlayerName = "";

var playerAChoice = "";
var playerBChoice = "";

var turn = 1;

// Get a reference to the database service
var database = firebase.database();

database.ref("/players").on("value", function(snapshot) {
	if (snapshot.child("playerA").exists()) {
		playerA = snapshot.val().playerA;
		let tmp_playerAName = snapshot.val().name;
		playerAName = tmp_playerAName;
		$("#playerAStats").html("勝: " + playerA.win + " 敗: " + playerA.loss + "和: " + playerA.tie);

        $("#playerA").html('玩家A 正在線上')

	} else {
        playerA = null;
		playerAName = "";
        if(playerA == null && yourPlayerName != ''){
            $("#playerA").html(`<span>正在等待玩家</span>`);
        }
		database.ref("/result/").remove();
	}

    if (snapshot.child("playerB").exists()) {
		playerB = snapshot.val().playerB;
		let tmp_playerAName = snapshot.val().name;
		playerAName = tmp_playerAName;
		$("#playerBStats").html("勝: " + playerB.win + " 敗: " + playerB.loss + " 和: " + playerB.tie);
        $("#playerB").html('玩家B 正在線上')
	} else {
        playerB = null;
		playerAName = "";
        if(playerB == null && yourPlayerName != ''){
            $("#playerB").html(`<span>正在等待玩家</span>`);
        }
		database.ref("/outcome/").remove();
	}


    if (!playerA && !playerB) {
		database.ref("/chat/").remove();
		// database.ref("/turn/").remove();
		database.ref("/result/").remove();
		$("#chatRoom").empty();
	}

    if(playerB != null && playerA != null){
        if(yourPlayerName == 'playerA') {
            $('#playerAPanel [data-choice]').attr('disabled',false)
            $('#playerBPanel [data-choice]').hide()
        }else{
            $('#playerBPanel [data-choice]').attr('disabled',false)
            $('#playerAPanel [data-choice]').hide()
        }
    }
});

database.ref("/players/").on("child_removed", function(snapshot) {
    var disconnet_player = snapshot.val().name;
    if(disconnet_player !== null && disconnet_player !== undefined){
        var msg = `${disconnet_player} 已離開`;
        var chatKey = database.ref().child("/chat").push().key;
        database.ref("/chat/" + chatKey).set(msg);
    }
});

database.ref("/chat/").on("child_added", function(snapshot) {
	var chatMsg = snapshot.val();
	var chatEntry = $("<div>").html(chatMsg);
	$("#chatRoom").append(chatEntry);
})
$('body').on('click','.playerChoose' ,function(event){
    yourPlayerName = $(this).data('choose')
	event.preventDefault();
    if(playerA === null && yourPlayerName === 'playerA'){
        playerA = {
            name: yourPlayerName,
            win: 0,
            loss: 0,
            tie: 0,
            choice: ""
        };
        database.ref('/players/playerA').set(playerA);
		database.ref("/players/playerA").onDisconnect().remove();
        $(this).hid
        $('.playerChoose').attr('disabled',true)
    }else if(playerB === null && yourPlayerName === 'playerB' ) {
        playerB = {
            name: yourPlayerName,
            win: 0,
            loss: 0,
            tie: 0,
            choice: ""
        };
        database.ref().child("/players/playerB").set(playerB);
        database.ref("/players/playerB").onDisconnect().remove();
        $(this).hide()
        $('.playerChoose').attr('disabled',true)
    }
    var msg = yourPlayerName + "已加入";
	var chatKey = database.ref().child("/chat/").push().key;
	database.ref("/chat/" + chatKey).set(msg);
})

// 聊天室
$("#chat-send").on("click", function(event) {
	event.preventDefault();
	if ( (yourPlayerName !== "") && ($("#chat-input").val().trim() !== "") ) {
		var msg = yourPlayerName + ": " + $("#chat-input").val().trim();
		$("#chat-input").val("");
		var chatKey = database.ref().child("/chat/").push().key;
        console.log(database.ref().child("/chat/").push());
		database.ref("/chat/" + chatKey).set(msg);
	}
});
$('#chat-input').on("keydown",function(event){
    if(event.code == 'Enter' || event.keyCode == 13){
        $("#chat-send").trigger('click');
    }
})

$("body").on("click", "#playerAPanel [data-choice]", function(event) {
    $('[data-choice]').removeClass('active').addClass('disabled')
    $(this).removeClass('disabled').addClass('active')
	event.preventDefault();
	if (playerA && playerB && (yourPlayerName === playerA.name)) {
        var choice = $(this).data('choice');
        playerA.choice = choice
		database.ref().child("/players/playerA/choice").set(choice);
    }

});

$("body").on("click", "#playerBPanel [data-choice]", function(event) {
    $('[data-choice]').removeClass('active').addClass('disabled')
    $(this).removeClass('disabled').addClass('active')
    event.preventDefault();
    if (playerA && playerB && (yourPlayerName === playerB.name)) {
        var choice = $(this).data('choice');
        playerB.choice = choice
        database.ref().child("/players/playerB/choice").set(choice);
        console.log('playerB.choice '+playerB.choice);
    }
});
database.ref("/players/playerA/choice").on("value", function(snapshot) {
    database.ref().child("/result/").set("");
    if(snapshot.val()!= '' && snapshot.val() !=null){
        $('#player_a_choose').show()
        $('#player_A_choose').text('已選擇')
        playerAChoice = snapshot.val()
        playerA.choice = snapshot.val()
        if (playerAChoice && playerBChoice) {
            console.log('A result');
            result()
        }
    }
})
database.ref("/players/playerB/choice").on("value", function(snapshot) {
	database.ref().child("/result/").set("");
    if(snapshot.val()!= '' && snapshot.val() !=null){
        playerBChoice = snapshot.val()
        playerB.choice = snapshot.val()

        $('#player_b_choose').show()
        $('#player_B_choose').text('已選擇')
        if (playerAChoice && playerBChoice) {
            result()
        }
    }
})
function result () {
    if (playerA.choice === "rock") {
		if (playerB.choice === "rock") {
			database.ref().child("/result/").set("和局");
			database.ref().child("/players/playerA/tie").set(playerA.tie + 1);
			database.ref().child("/players/playerB/tie").set(playerB.tie + 1);
		} else if (playerB.choice === "paper") {
			database.ref().child("/result/").set("玩家B 布 勝利");
			database.ref().child("/players/playerA/loss").set(playerA.loss + 1);
			database.ref().child("/players/playerB/win").set(playerB.win + 1);
		} else {
			database.ref().child("/result/").set("玩家A 石頭 勝利");
			database.ref().child("/players/playerA/win").set(playerA.win + 1);
			database.ref().child("/players/playerB/loss").set(playerB.loss + 1);
		}

	} else if (playerA.choice === "paper") {
		if (playerB.choice === "rock") {
			database.ref().child("/result/").set("玩家A 布 勝利");
			database.ref().child("/players/playerA/win").set(playerA.win + 1);
			database.ref().child("/players/playerB/loss").set(playerB.loss + 1);
		} else if (playerB.choice === "paper") {
			database.ref().child("/result/").set("和局");
			database.ref().child("/players/playerA/tie").set(playerA.tie + 1);
			database.ref().child("/players/playerB/tie").set(playerB.tie + 1);
		} else {
			database.ref().child("/result/").set("玩家B 剪刀 勝利");
			database.ref().child("/players/playerA/loss").set(playerA.loss + 1);
			database.ref().child("/players/playerB/win").set(playerB.win + 1);
		}

	} else if (playerA.choice === "scissors") {
		if (playerB.choice === "rock") {
			database.ref().child("/result/").set("玩家B 石頭 勝利");
			database.ref().child("/players/playerA/loss").set(playerA.loss + 1);
			database.ref().child("/players/playerB/win").set(playerB.win + 1);
		} else if (playerB.choice === "paper") {
			database.ref().child("/result/").set("玩家A 剪刀 勝利");
			database.ref().child("/players/playerA/win").set(playerA.win + 1);
			database.ref().child("/players/playerB/loss").set(playerB.loss + 1);
		} else {
			database.ref().child("/result/").set("和局");
			database.ref().child("/players/playerA/tie").set(playerA.tie + 1);
			database.ref().child("/players/playerB/tie").set(playerB.tie + 1);
		}
	}
}

database.ref("/result/").on("value", function(snapshot) {
    if(snapshot.val() != null && snapshot.val() != ''){
        $("#result").text(snapshot.val());
        $('[data-choice]').removeClass('active').removeClass('disabled')
        $('#player_A_choose,#player_B_choose').text('')
		database.ref().child("/players/playerA/choice").set('');
		database.ref().child("/players/playerB/choice").set('');
        playerAChoice = ''
        playerBChoice = ''
    }
})