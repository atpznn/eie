<template>
  <div>max turn :{{ game.maxTurn }}</div>
  <div>max turn :{{ game.currentTurn }}</div>

  <div class="flex flex-col gap-4 relative">
    <div class="absolute right-[-120px] top-[175px] h-[150px]">
      <div
        v-for="(value, index) in game.players.find(
          (x) => x.id == game.playerTurn
        )?.dices"
      >
        <div
          @click="
            () => {
              valueIndex = index;
            }
          "
          :class="[{'ml-[-12px]': valueIndex == index, },`${colorMap[value]}`]"
          class="cursor-pointer rounded-md $bg-amber-900 border-4 border-b-blue-200 w-[50px] h-[50px] flex items-center justify-center font-bold"
        >
          {{ value }}
        </div>
      </div>
    </div>

    <div v-for="(board, index) in [player1, player2]">
      <div :class="{ 'flex flex-col gap-2': true }">
        <div class="">score: {{ board.score }}</div>
        <div>id: {{ board.id }}</div>
        <div
          class="rotate-90 grid grid-cols-3"
          :class="{ 'scale-x-[-1]': index == 0 }"
        >
          <div class="" v-for="block in board.data">
            <div
              class="flex items-center justify-center"
              :class="[{
                'border w-[50px] h-[50px]': true,
                'cursor-no-drop':
                  game.playerTurn != board.id || block[1].number > 0,
                'border-amber-200': game.playerTurn == board.id,
                'border-gray-600': game.playerTurn != board.id,
                'cursor-pointer':block[1].number == 0,
                'rotate-270': true,
                'scale-y-[-1]': index == 0,
              },`${colorMap[block[1].number]}`]"
              :disabled="game.playerTurn != board.id || block[1].number > 0"
              @click="
              (e:Event) => {
                if( game.playerTurn != board.id || checkGameIsEnd() ||block[1].number > 0)return
                block[1].justPlace = true;

                block[1].number = game.players.find(x=>x.id == game.playerTurn)!.dices[valueIndex]
                game.players.find(x=>x.id == game.playerTurn)!.dices[valueIndex] = getRandom()
                valueIndex = 0
                process();
              }
            "
            >
              {{ block[1].number != 0 ? block[1].number : "" }}
            </div>
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
const colorMap = {
  1:'bg-red-600',
  2:'bg-green-600',
  3:'bg-black-500',
  4:'bg-orange-600',
  5:'bg-pink-600',
  6:'bg-blue-600',
}
const player1 = ref<Player>({
  id: "1",
  score: 0,
  data: new Map(),
  dices: [0, 0, 0],
});
const player2 = ref<Player>({
  id: "2",
  data: new Map(),
  score: 0,
  dices: [0, 0, 0],
});
const game = ref<GameState>({
  currentTurn: 0,
  maxTurn: 10,
  playerTurn: "1",
  moveInCurrentTurn: 0, // 👈 เพิ่มตรงนี้
  players: [player1.value, player2.value],
  winner: null,
});
const valueIndex = ref(0);
const keymap = [
  [1, 4, 7],
  [2, 5, 8],
  [3, 6, 9],
];
function getRandom() {
  return parseInt(`${Math.random() * (7 - 1) + 1}`);
}
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
  player1.value.dices = player1.value.dices.map((x) => getRandom());
  player2.value.dices = player2.value.dices.map((x) => getRandom());
  // player1.value.isTurn = true;
});
type Player = {
  id: string;
  score: number;
  data: Map<number, Dice>;
  dices: number[];
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
  if (game.value.players.every((x) => x.score == game.value.players[0].score)) {
    alert(`ending! drawing!`);
    return;
  }
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
