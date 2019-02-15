window.addEventListener("DOMContentLoaded", () => {
  const $form = document.querySelector("form");
  const $input = document.querySelector("input");
  const $list = document.querySelector(".currentPlayers");
  const $shuffle = document.querySelector(".shuffle");
  const $teamDisplay = document.querySelector(".showTeams");
  const $board = document.querySelector(".board");
  const $controls = document.querySelector(".controls");
  const $turnDisplay = document.createElement("h3");
  const $nextTurn = document.createElement("button");
  const $container = document.querySelector(".container");
  const $currentplayersContainer = document.querySelector(
    ".currentplayersContainer"
  );
  const $audio = document.querySelector("audio");

  document.querySelector(".playMusic").addEventListener("click", () => {
    $audio.play();
  });

  const stages = ["💀", "1 life", "2 lives", "3 lives", "🔪 KILLER"];
  let players = [];
  let teams = [];
  const board = [
    20,
    1,
    18,
    4,
    13,
    6,
    10,
    15,
    2,
    17,
    3,
    19,
    7,
    16,
    8,
    11,
    14,
    9,
    12,
    5
  ];
  const targets = [];
  let turnNumber = 0;
  let currentPlayer;

  let game = [];

  const teamColors = [
    ["black", "B8FFBB", "8BEA85", "6EDD61", "24BB07"],
    ["black", "BAB8FF", "9D94F1", "8071E3", "2907BB"],
    ["black", "F1B8FF", "E594F1", "D971E3", "B707BB"],
    ["black", "B8FFF8", "94F1E9", "71E3DA", "07BBAE"],
    ["black", "FFDBB8", "F1C594", "E3B071", "BB7107"],
    ["black", "E3B8FF", "CC94F1", "B571E3", "7107BB"],

    ["black", "B8FFE7", "94F1CE", "71E3B5", "07BB6B"],
    ["black", "F1B8FF", "E594F1", "D971E3", "B707BB"],
    ["black", "F1B8FF", "E594F1", "D971E3", "B707BB"],
    ["black", "F1B8FF", "E594F1", "D971E3", "B707BB"],
    ["black", "F1B8FF", "E594F1", "D971E3", "B707BB"],
    ["black", "F1B8FF", "E594F1", "D971E3", "B707BB"],
    ["black", "FFDBB8", "F1C594", "E3B071", "BB7107"]
  ];

  function addPlayerToList(name) {
    players.push(name);
    const $listItem = document.createElement("div");
    $listItem.setAttribute("class", "listedPlayer");
    $listItem.setAttribute("id", `player-${name}`);
    const $removeButton = document.createElement("button");
    $removeButton.setAttribute("class", name);
    const $name = document.createElement("p");
    $removeButton.innerHTML = "Remove";
    $removeButton.addEventListener("click", removePlayer);
    $name.innerHTML = name;
    $listItem.append($name);
    $listItem.append($removeButton);
    $list.append($listItem);
  }

  function removePlayer(e) {
    const playerToRemove = e.target.classList.value;
    players = players.filter(player => player !== playerToRemove);
    const $playerToRemove = document.querySelector(`#player-${playerToRemove}`);
    $list.removeChild($playerToRemove);
  }

  function mixTeams() {
    $container.removeChild($form);
    $container.removeChild($currentplayersContainer);

    players = players.sort((a, b) => (Math.random() > 0.5 ? 1 : -1));
    players.forEach((player, index) => {
      if (index % 2 === 0) {
        teams.push([player]);
      } else {
        const pos = teams.length - 1;
        teams[pos].push(player);
      }
    });
    displayTeams();
  }

  function displayTeams() {
    const distance = Math.floor(20 / teams.length);

    teams.forEach((team, index) => {
      const target = board[Math.ceil(distance / 2) + index * distance];
      targets.push(target);
      const teamToAddToGame = {
        players: team,
        number: target,
        color: teamColors[index],
        lives: 1,
        isKiller: false
      };
      game.push(teamToAddToGame);
      const $team = document.createElement("div");
      const $teamName = document.createElement("h2");
      const $target = document.createElement("h2");
      const $score = document.createElement("div");
      $score.setAttribute("class", `scoreDisplay-${target}`);
      $target.innerHTML = `Target: ${target}`;
      $teamName.innerHTML = `Team ${index + 1}`;
      $teamName.setAttribute("style", `color: ${teamToAddToGame.color}`);
      $team.append($teamName);
      $team.append($target);
      $team.setAttribute("class", "team");
      $team.setAttribute(
        "style",
        `background-color: #${teamToAddToGame.color[3]}`
      );
      $score.innerHTML = stages[1];
      $target.setAttribute("class", "target");
      team.forEach(player => {
        const $player = document.createElement("p");
        $player.innerHTML = player;
        $team.append($player);
      });
      $team.append($score);
      $teamDisplay.append($team);
    });
    createBoard();
  }

  $shuffle.addEventListener("click", mixTeams);

  $form.addEventListener("submit", e => {
    e.preventDefault();
    addPlayerToList($input.value);
    $input.value = "";
  });

  function hit(e) {
    const $segHit = document.querySelector(`#seg${e.target.id}`);
    const teamHit = game.find(team => team.number === parseInt(e.target.id));
    const teamId = game.map(team => team.number).indexOf(parseInt(e.target.id));
    const currentHitTheres = teamId === turnNumber;

    if (currentHitTheres && teamHit.lives !== 0 && !currentPlayer.isKiller) {
      teamHit.lives++;
      const style =
        $segHit.style.cssText.slice(0, $segHit.style.cssText.indexOf("#")) +
        "#" +
        teamHit.color[teamHit.lives];

      if (teamHit.lives >= 4) {
        teamHit.isKiller = true;
        $turnDisplay.innerHTML = `${currentPlayer.players.join(
          " and "
        )} are killers! 🔪`;
      }
      $segHit.setAttribute("style", style);
    }

    if (currentPlayer.isKiller && !currentHitTheres) {
      teamHit.lives--;
      const style =
        $segHit.style.cssText.slice(0, $segHit.style.cssText.indexOf("#")) +
        "#" +
        teamHit.color[teamHit.lives];
      $segHit.setAttribute("style", style);
    }

    if (!teamHit.lives) {
      $turnDisplay.innerHTML = `${teamHit.players.join(" and ")} are Dead!! 💀`;
      $controls.removeChild(e.target);
      game = game.filter(team => team.number !== parseInt(e.target.id));
      if (game.length === 1) {
        $turnDisplay.innerHTML = `${currentPlayer.players.join(
          " and "
        )} WIN!!!!! 🙌`;
        $controls.removeChild($nextTurn);
      }
    }
    document.querySelector(`.scoreDisplay-${e.target.id}`).innerHTML =
      stages[teamHit.lives];
  }

  function changeTurn() {
    turnNumber++;
    if (turnNumber >= game.length) {
      turnNumber = 0;
    }
    currentPlayer = game[turnNumber];
    $turnDisplay.innerHTML = `It is ${currentPlayer.players.join(
      " and "
    )}'s turn`;
    $turnDisplay.setAttribute("style", `color: #${currentPlayer.color[3]}`);
  }

  function addButtons() {
    $controls.append($turnDisplay);
    currentPlayer = game[turnNumber];
    $turnDisplay.innerHTML = `It is ${currentPlayer.players.join(
      " and "
    )}'s turn`;
    game.forEach((team, index) => {
      const $button = document.createElement("button");
      $button.setAttribute("id", team.number);
      $button.setAttribute("style", `background-color: #${team.color[3]}`);
      $button.innerHTML = `${team.number}`;
      $controls.append($button);
      $button.addEventListener("click", hit);
    });

    $nextTurn.addEventListener("click", changeTurn);
    $nextTurn.innerHTML = "Next Turn";
    $controls.append($nextTurn);
  }

  function createBoard() {
    board.forEach((segment, index) => {
      const $seg = document.createElement("div");
      $seg.setAttribute("class", "pie_segment");
      $seg.setAttribute("id", `seg${segment}`);

      const team = game.find(team => team.number === segment);

      $seg.setAttribute(
        "style",
        `--offset: ${
          index * 5 - 2.5
          // index === 0 ? 99 : 1 + index
        }; --value: 5; --over50: 0; --color: ${
          team ? `#${team.color[1]}` : index % 2 === 0 ? "#242a21" : "#aebbb1"
        }`
      );
      $board.append($seg);
    });
    addButtons();
  }
});
