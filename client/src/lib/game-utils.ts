export function getWordDisplay(word: string, guessedLetters: string[]): string[] {
  return word.split('').map(letter => 
    guessedLetters.includes(letter.toUpperCase()) ? letter.toUpperCase() : '_'
  );
}

export function getLetterStatus(letter: string, guessedLetters: string[], word: string): 'available' | 'correct' | 'incorrect' {
  if (!guessedLetters.includes(letter)) return 'available';
  
  if (word.includes(letter)) return 'correct';
  return 'incorrect';
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function isWordComplete(word: string, guessedLetters: string[]): boolean {
  return word.split('').every(letter => 
    guessedLetters.includes(letter.toUpperCase())
  );
}
