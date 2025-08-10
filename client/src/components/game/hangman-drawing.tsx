interface HangmanDrawingProps {
  wrongGuesses: number;
}

export default function HangmanDrawing({ wrongGuesses }: HangmanDrawingProps) {
  const getHangmanParts = (guesses: number) => {
    const parts = [
      "  +---+",
      "  |   |",
      "  |   ",
      "  |   ",
      "  |   ",
      "  |",
      "========="
    ];

    if (guesses >= 1) parts[2] = "  |   O";
    if (guesses >= 2) parts[3] = "  |   |";
    if (guesses >= 3) parts[3] = "  |  /|";
    if (guesses >= 4) parts[3] = "  |  /|\\";
    if (guesses >= 5) parts[4] = "  |  / ";
    if (guesses >= 6) parts[4] = "  |  / \\";

    return parts;
  };

  const hangmanParts = getHangmanParts(wrongGuesses);

  return (
    <div className="flex justify-center">
      <div className="font-mono text-4xl leading-tight text-gray-800 bg-gray-50 p-8 rounded-lg border-2 border-gray-200">
        <div className="text-center space-y-1">
          {hangmanParts.map((part, index) => (
            <div key={index}>{part}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
