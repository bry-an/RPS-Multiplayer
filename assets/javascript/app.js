// Initialize Firebase
var config = {
  apiKey: "AIzaSyDXVbNWsuLCknQtzjCvGoFwpg5jMK299D4",
  authDomain: "multiplayer-rps-a820d.firebaseapp.com",
  databaseURL: "https://multiplayer-rps-a820d.firebaseio.com",
  projectId: "multiplayer-rps-a820d",
  storageBucket: "multiplayer-rps-a820d.appspot.com",
  messagingSenderId: "947470144121"
};

firebase.initializeApp(config);
database = firebase.database();

var connectionsRef = database.ref("/connections"); //list of all logged on
var connectedRef = database.ref(".info/connected"); //boolean
var playersRef = database.ref("/players"); //ref to players child
var player1Ref = playersRef.child("player1");
var player2Ref = playersRef.child("player2");
var chatRef = database.ref("/chats"); //ref to chats child
var con = [];
var numPlayers; //number of connected players
var playerNumber; //either 1 or 2 depending on when connected
var me; // representing local machine, will point to either player 1 or 2 object (done to keep p1 & p2 consistent in database)
var opp; //same, representing opponent's machine
var firstPlayer;
var waitingForJudgement = false; //used by computer that's listening for other player's move


var amIPlayer1;

connectedRef.on("value", function (snap) {
  if (snap.val()) {
    con = connectionsRef.push(true);
    con.onDisconnect().remove();
  }
});

connectionsRef.on("value", function (snap) {
  numPlayers = snap.numChildren();
  if (numPlayers < 2) {
    game.setPlayersRef(); //clear out and initialize database variables
    me = game.players[0]; //assign local machine to player 1
    opp = game.players[1];
    game.setStatus("Waiting on other player to join.");
    firstPlayer = true;
  }
  else if (numPlayers == 2) {
    game.setStatus("Both players joined. Click an icon to make your move.");
  }
  if (!firstPlayer) {
    me = game.players[1]; //assign local machine to player 2
    opp = game.players[0];
    $("#arena-name-opp").html("<p>" + opp.nameDisp + "</p>");
  }
});


var game = {
  //player objects
  players: [
    player1 = {
      name: "player1",
      wins: 0,
      losses: 0,
      choice: "not-set",
      nameDisp: "Player 1"
    },
    player2 = {
      name: "player2",
      wins: 0,
      losses: 0,
      choice: "not-set",
      nameDisp: "Player 2"
    }
  ],

  returnIcon: function (choice) {
    return $("<img src = 'assets/images/" + choice + ".jpg' class='choice-icon' />")
  },

  setPlayersRef: function () {
    playersRef.set({
      player1: {
        name: "player1",
        wins: player1.wins,
        losses: player1.losses,
        choice: "not-set",
        nameDisp: player2.nameDisp
      },
      player2: {
        name: "player2",
        wins: player2.wins,
        losses: player2.losses,
        choice: "not-set",
        nameDisp: player2.nameDisp
      }
    });
  },

  updatePlayersRefNameDisp: function (value) {
    playersRef.child(this.name).update({
      nameDisp: value,
    });
  },

  updatePlayersRefWins: function (value) {
    playersRef.child(this.name).update({
      wins: value,
    });
  },

  updatePlayersRefLosses: function (value) {
    playersRef.child(this.name).update({
      losses: value,
    });
  },

  updatePlayersRefChoice: function (value) {
    playersRef.child(this.name).update({
      choice: value,
    });
  },

  resetGame: function () {
    $("#arena-icon-me").empty();
    $("#arena-icon-opp").empty();
    $("#rock, #paper, #scissors").show();
  },

  conclude: function (conclusion) {
    //code conclusion for non-host
    if (conclusion == "my-win") {
      me.wins++;
      opp.losses++;
      console.log("opp losses", opp.losses)
      this.setStatus("You win! Play again.");
    }
    else if (conclusion == "opp-win") {
      me.losses++;
      opp.wins++;
      console.log("opp wins", opp.wins)
      this.setStatus("Opponent wins! Play again.");
    }
    else this.setStatus("You have tied. Play again.");

    $("#arena-icon-opp").append(this.returnIcon(opp.choice));
    $("#arena-wins-me").text("Wins: " + me.wins);
    $("#arena-losses-me").text("Losses: " + me.losses);
    $("#arena-wins-opp").text("Wins: " + opp.wins);
    $("#arena-losses-opp").text("Losses: " + opp.losses)
    $("#status").append("<button class='button-primary' id = 'new-game'>Play again!</button>");
    this.updatePlayersRefWins.call(me, me.wins);
    this.updatePlayersRefLosses.call(me, me.losses);
    this.updatePlayersRefChoice.call(me, "not-set");
    this.updatePlayersRefChoice.call(opp, "not-set");
  },
  //core game logic
  judge: function () {
    waitingForJudgement = false;
    console.log("the judge is in")
    var myMove = me.choice;
    var oppMove = opp.choice;
    if (myMove == oppMove) {
      this.conclude("tie");
    }
    else if ((myMove == "rock" && oppMove == "scissors") ||
      (myMove == "paper" && oppMove == "rock") ||
      (myMove == "scissors" && oppMove == "paper")) {
      this.conclude("my-win");
    }
    else {
      this.conclude("opp-win");
    }

  },


  setMove: function (selected) {
    $("#arena-icon-me").append(this.returnIcon(selected));
    this.updatePlayersRefChoice.call(me, selected);
    if (opp.choice == "not-set") { //you're the first to choose
      waitingForJudgement = true;
      this.setStatus("Waiting for opponent to move.");
    } else {
      this.judge();
    }
  },

  setStatus: function (condition) {
    $("#status").text("Game Status: " + condition);
  }

};


$(document).ready(function () {
  var player1 = game.players[0];
  var player2 = game.players[1];

  $("#rock, #paper, #scissors").on("click", function () {
    if (numPlayers == 2 && me.choice == "not-set") {
      game.setMove($(this).attr("id"));
      $(this).hide();
    }
  });

  $("#name-me-submit").on("click", function () {
    me.nameDisp = $("#name-me-entry").val();
    $("#name-me-entry").val("");
    game.updatePlayersRefNameDisp.call(me, me.nameDisp);
    $("#arena-name-me").html("<p>" + me.nameDisp + "</p>");
  });

  $(document).on("click", "#new-game", function () {
    console.log("clickey");
    this.remove();
    game.resetGame();
    game.setStatus("Both players joined. Ready for move.")
  });

  playersRef.on("value", function (snap) {
    if (numPlayers == 2) {

      if (snap.val()) {
        player1.nameDisp = snap.child("player1").val().nameDisp;
        player1.choice = snap.child("player1").val().choice;
        player1.wins = snap.child("player1").val().wins;
        player1.losses = snap.child("player1").val().losses;
        player2.nameDisp = snap.child("player2").val().nameDisp;
        player2.choice = snap.child("player2").val().choice;
        player2.wins = snap.child("player2").val().wins;
        player2.losses = snap.child("player2").val().losses;
      }
      if (waitingForJudgement)
        game.judge();
      $("#arena-name-opp").html("<p>" + opp.nameDisp + "</p>");
    }
  });

  $("#chat-submit").on("click", function () {
    event.preventDefault();
    var chatText = $("#chat-input").val();
    chatRef.push({
      author: me.nameDisp,
      chat: chatText,
    });
  });

  $("#chatbox").ready(function () {
    chatRef.on("child_added", function (snap) {
      if (snap.val()) {
        console.log(snap.val().author)
        console.log(snap.val().chat)
        $("#chatbox").contents().find("body").prepend("<p>" + snap.val().author + ": " + snap.val().chat + "</p>");
      }
    });
  })
  //enter to submit forms
  $("input").keypress(function (event) {
    if (event.which == 13) {
      event.preventDefault();
      $("#chat-input").submit();
    }
  });
});


//issue: players can't reload page else both are player2
//need chat functionality