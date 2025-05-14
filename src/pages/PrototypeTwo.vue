<template>
  <div>max turn :{{ game.maxTurn }}</div>
  <div>max turn :{{ game.currentTurn }}</div>

  <div class="flex flex-col gap-4">
    <div v-for="(board, index) in [player1, player2]">
      <div :class="{ 'flex flex-col gap-2': true }">
        <div class="">score: {{ board.score }}</div>
        <div>id: {{ board.id }}</div>
        <div
          class="rotate-90 grid grid-cols-3"
          :class="{ 'scale-x-[-1]': index == 0 }"
        >
          <div class="" v-for="block in board.data">
            <input
              :class="{
                'border-amber-200 border w-[50px] h-[50px]': true,
                'cursor-no-drop':
                  game.playerTurn != board.id || block[1].number > 0,
                'rotate-270': true,
                'scale-y-[-1]': index == 0,
              }"
              :value="block[1].number"
              :disabled="game.playerTurn != board.id || block[1].number > 0"
              @change="
              (e:Event) => {
                block[1].justPlace = true;
                block[1].number = +(e.target! as any).value;
                process();
              }
            "
              type="text"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
type GameState = {
  currentTurn: number;
  maxTurn: number;
  moveInCurrentTurn: number; // 👈 เพิ่มตัวนี้!
  players: Player[];
  winner: Player | null;
  playerTurn: string;
};

interface Dice {
  number: number;
  justPlace: boolean;
}
const player1 = ref<Player>({
  id: "1",
  score: 0,
  data: new Map(),
});
const player2 = ref<Player>({
  id: "2",
  data: new Map(),
  score: 0,
});

const game = ref<GameState>({
  currentTurn: 0,
  maxTurn: 4,
  playerTurn: "1",
  moveInCurrentTurn: 0, // 👈 เพิ่มตรงนี้
  players: [player1.value, player2.value],
  winner: null,
});

const keymap = [
  [1, 4, 7],
  [2, 5, 8],
  [3, 6, 9],
];
onMounted(() => {
  keymap.forEach((x) =>
    x.forEach((f) => {
      player1.value.data.set(f, {
        justPlace: false,
        number: 0,
      });
      player2.value.data.set(f, {
        justPlace: false,
        number: 0,
      });
    })
  );
  // player1.value.isTurn = true;
});
type Player = {
  id: string;
  score: number;
  data: Map<number, Dice>;
};

function process() {
  if (checkGameIsEnd()) {
    alert("ending!");
    return;
  }
  const currentPlayer = game.value.players.find(
    (x) => x.id == game.value.playerTurn
  )!;
  const opposite = game.value.players.find(
    (x) => x.id != game.value.playerTurn
  )!;
  processGame(currentPlayer, opposite);
  // if(game.value.playerTurn == )
}
function summaryGame() {
  game.value.winner = game.value.players.sort((s) => s.score - s.score)[0];
  alert(`ending! id: ${game.value.winner} win`);
}
function checkGameIsEnd() {
  return game.value.maxTurn <= game.value.currentTurn;
}
function processTurn() {
  if (game.value.moveInCurrentTurn == 0) {
    game.value.moveInCurrentTurn++;
  } else {
    game.value.moveInCurrentTurn = 0;
    game.value.currentTurn++;
  }
}
function processGame(current: Player, opponent: Player) {
  processPlayerTurn(current, opponent);
  switchTurn(current, opponent);
  processTurn();
  if (checkGameIsEnd()) summaryGame();
}
function adjustSelf(line: number[], player: Player) {
  const numbers = line.map((key) => player.data.get(key)?.number || 0);

  const compacted = numbers.filter((n) => n !== 0);

  const adjusted = [
    ...compacted,
    ...Array(line.length - compacted.length).fill(0),
  ];

  for (let i = 0; i < line.length; i++) {
    const oldDice = player.data.get(line[i]);
    player.data.set(line[i], { ...oldDice!, number: adjusted[i] });
  }
}

function processPlayerTurn(current: Player, opponent: Player) {
  for (const [key, dice] of current.data) {
    if ([...current.data.values()].every((d) => !d.justPlace)) break;
    if (!dice.justPlace) continue;

    const line = getLineFromKey(key);
    if (!line) continue;

    attackOpponentLine(line, dice.number, opponent);
    adjustSelf(line, current);
    const lineNumbers = line.map((k) => current.data.get(k)?.number || 0);

    if (lineNumbers.every((n) => n === lineNumbers[0] && n !== 0)) {
      current.score += lineNumbers[0];
      clearLine(line, current);
    }
    dice.justPlace = false;
  }
}

function switchTurn(playerOne: Player, playerTwo: Player) {
  game.value.playerTurn =
    playerOne.id == game.value.playerTurn ? playerTwo.id : playerOne.id;
}

function getLineFromKey(key: number): number[] | undefined {
  return keymap.find((line) => line.includes(key))?.sort();
}

function attackOpponentLine(line: number[], number: number, opponent: Player) {
  // 1. ลบลูกเต๋าที่เลขตรงกัน
  for (const key of line) {
    const dice = opponent.data.get(key);
    if (dice?.number === number) {
      opponent.data.set(key, { ...dice, number: 0 });
    }
  }

  // 2. เลื่อนลูกเต๋าไปข้างหน้า (เหมือน bubble zero ไปหลัง)
  for (let i = 0; i < line.length; i++) {
    for (let j = line.length - 1; j > i; j--) {
      const currentKey = line[j];
      const prevKey = line[j - 1];

      const currentDice = opponent.data.get(currentKey);
      const prevDice = opponent.data.get(prevKey);

      if (prevDice?.number === 0 && currentDice?.number !== 0) {
        // swap
        opponent.data.set(prevKey, {
          ...prevDice,
          number: currentDice!.number,
        });
        opponent.data.set(currentKey, { ...currentDice!, number: 0 });
      }
    }
  }
}

function clearLine(line: number[], player: Player) {
  for (const key of line) {
    player.data.set(key, { number: 0, justPlace: false });
  }
}
</script>
