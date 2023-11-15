import { Fragment, useState, useEffect } from "react";
import { CountdownRenderProps } from "react-countdown";
import io, { Socket } from "socket.io-client";
import _ from "lodash";
import GameTimer from "../components/GameTimer";

type PlayerType = {
  role: "red" | "green" | "blue" | "yellow" | "black";
  playerId: string;
};

type ScoreItemPlayer = {
  correct: number;
  wrong: number;
};

type ScorePlayer = {
  red: ScoreItemPlayer;
  green: ScoreItemPlayer;
  blue: ScoreItemPlayer;
  yellow: ScoreItemPlayer;
  black: ScoreItemPlayer;
};

const questions = [
  {
    question: "Berapa 1 + 1",
    answerA: "1",
    answerB: "5",
    answerC: "3",
    answerD: "2",
    correctAnswer: "D",
  },
  {
    question: "Berapa 2 + 2",
    answerA: "1",
    answerB: "5",
    answerC: "4",
    answerD: "2",
    correctAnswer: "C",
  },
  {
    question: "Berapa 3 + 3",
    answerA: "6",
    answerB: "5",
    answerC: "3",
    answerD: "2",
    correctAnswer: "A",
  },
  {
    question: "Berapa 4 + 1",
    answerA: "1",
    answerB: "5",
    answerC: "3",
    answerD: "2",
    correctAnswer: "B",
  },
  {
    question: "Berapa 2 + 1",
    answerA: "1",
    answerB: "5",
    answerC: "3",
    answerD: "2",
    correctAnswer: "C",
  },
  {
    question: "Berapa 3 + 7",
    answerA: "1",
    answerB: "10",
    answerC: "3",
    answerD: "2",
    correctAnswer: "B",
  },
  {
    question: "Berapa 1 + 3",
    answerA: "1",
    answerB: "5",
    answerC: "3",
    answerD: "4",
    correctAnswer: "D",
  },
  {
    question: "Berapa 4 + 5",
    answerA: "1",
    answerB: "9",
    answerC: "3",
    answerD: "2",
    correctAnswer: "B",
  },
  {
    question: "Berapa 3 + 1",
    answerA: "4",
    answerB: "5",
    answerC: "3",
    answerD: "2",
    correctAnswer: "A",
  },
  {
    question: "Berapa 2 + 9",
    answerA: "11",
    answerB: "12",
    answerC: "13",
    answerD: "14",
    correctAnswer: "A",
  },
];

export default function Game() {
  const [userId, setUserId] = useState<string>("");
  const [findingMatch, setFindingMatch] = useState<boolean>(false);
  const [socketIO, setSocketIO] = useState<Socket | null>(null);
  const [playersOnMatch, setPlayersOnmatch] = useState<PlayerType[]>([]);
  const [roomId, setRoomId] = useState<string>("");
  const [socketId, setSocketId] = useState<string>("");

  const [timerKey, setTimerKey] = useState<string>(generateRandomString());
  const [gameTime] = useState<number>(10);
  const [starting, setStarting] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [answer, setAnswer] = useState<string>("");

  const [score, setScore] = useState<ScorePlayer>({
    red: {
      correct: 0,
      wrong: 0,
    },
    green: {
      correct: 0,
      wrong: 0,
    },
    blue: {
      correct: 0,
      wrong: 0,
    },
    yellow: {
      correct: 0,
      wrong: 0,
    },
    black: {
      correct: 0,
      wrong: 0,
    },
  });

  const [questionSection, setQuestionSection] = useState<number>(1);

  useEffect(() => {
    const socket = io("https://football-quiz-socket.onrender.com");
    setSocketIO(socket);

    socket.on("findingMatch", (response) => {
      console.log(response);
      setFindingMatch(true);
      setGameOver(false);
    });

    socket.on("matchFound", (response) => {
      console.log(response);
      setFindingMatch(false);
      setPlayersOnmatch(response.players);
      setStarting(true);

      setSocketId(response.socketId);
      setRoomId(response.roomId);
    });

    socket.on("playerAnswered", (response) => {
      console.log(response);
    });

    socket.on("gameOver", (response) => {
      console.log(response);

      setGameOver(true);
      setScore(response.score);
    });
  }, []);

  useEffect(() => {
    if (questionSection > 10) {
      setStarting(false);
      setQuestionSection(1);
    }
  }, [questionSection]);

  const matchmaking = () => {
    socketIO?.emit("matchmaking", {
      playerId: userId,
    });
  };

  const customTimeRenderer = (countdown: CountdownRenderProps): JSX.Element => {
    let { seconds } = countdown.formatted;
    if (seconds === "00") seconds = `${gameTime}`;

    const formattedTime = `${seconds} detik`;

    return (
      <span className="text-primary" style={{ fontSize: `${16}px` }}>
        {formattedTime}
      </span>
    );
  };

  return (
    <Fragment>
      <h1>Game</h1>
      <p>Socket Id: {socketId}</p>
      <p>Room Id: {roomId}</p>
      <p>
        User Role:{" "}
        {playersOnMatch.filter((player) => player.playerId === userId)[0]?.role}
      </p>
      <input
        type="text"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      {findingMatch || starting ? (
        <button style={{ backgroundColor: "green", padding: "10px" }}>
          Loading...
        </button>
      ) : (
        <button
          onClick={matchmaking}
          style={{ backgroundColor: "blue", padding: "10px" }}
        >
          Play Game!
        </button>
      )}
      <br />
      {findingMatch && <p>Finding Match</p>}
      <br />
      <ul>
        {playersOnMatch.map((player) => (
          <li key={player.playerId}>
            {player.playerId} - {player.role}
          </li>
        ))}
      </ul>

      {starting && (
        <div>
          <span>Remaining Time:</span>
          <GameTimer
            key={timerKey}
            time={gameTime}
            end={() => {
              socketIO?.emit("answerQuestion", {
                roomId: roomId,
                role: playersOnMatch.filter(
                  (player) => player.playerId === userId
                )[0]?.role,
                questionSection: `question${questionSection}`,
                statusAnswer: false,
              });
              setTimerKey(generateRandomString());
              setQuestionSection(questionSection + 1);
            }}
            render={customTimeRenderer}
          />
          <p>Question: {questions[questionSection - 1]?.question}</p>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          <button
            onClick={() => {
              socketIO?.emit("answerQuestion", {
                roomId: roomId,
                role: playersOnMatch.filter(
                  (player) => player.playerId === userId
                )[0]?.role,
                questionSection: `question${questionSection}`,
                statusAnswer: answer === "pdip" ? true : false,
              });
              setTimerKey(generateRandomString());
              setQuestionSection(questionSection + 1);
            }}
            style={{ backgroundColor: "blue", padding: "10px" }}
          >
            SEND!
          </button>
        </div>
      )}

      {gameOver && (
        <div>
          <div>
            <h5>Red:</h5>
            <p>Correct: {score?.red?.correct}</p>
            <p>Wrong: {score?.red?.wrong}</p>
          </div>
          <div>
            <h5>Green:</h5>
            <p>Correct: {score?.green?.correct}</p>
            <p>Wrong: {score?.green?.wrong}</p>
          </div>
          <div>
            <h5>Blue:</h5>
            <p>Correct: {score?.blue?.correct}</p>
            <p>Wrong: {score?.blue?.wrong}</p>
          </div>
          <div>
            <h5>Yellow:</h5>
            <p>Correct: {score?.yellow?.correct}</p>
            <p>Wrong: {score?.yellow?.wrong}</p>
          </div>
          <div>
            <h5>Black:</h5>
            <p>Correct: {score?.black?.correct}</p>
            <p>Wrong: {score?.black?.wrong}</p>
          </div>
        </div>
      )}
    </Fragment>
  );
}

function generateRandomString() {
  return _.sampleSize("abcdefghijklmnopqrstuvwxyz0123456789", 8).join("");
}
