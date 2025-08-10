interface HangmanDrawingProps {
  wrongGuesses: number;
}

export default function HangmanDrawing({ wrongGuesses }: HangmanDrawingProps) {
  return (
    <div className="flex justify-center">
      <svg 
        width="200" 
        height="250" 
        viewBox="0 0 200 250" 
        className="border-2 border-gray-200 rounded-lg bg-gray-50 p-4"
      >
        {/* Gallows base */}
        <line x1="10" y1="230" x2="150" y2="230" stroke="#8B4513" strokeWidth="4" />
        
        {/* Gallows pole */}
        {wrongGuesses >= 1 && (
          <line x1="30" y1="230" x2="30" y2="20" stroke="#8B4513" strokeWidth="4" />
        )}
        
        {/* Gallows top beam */}
        {wrongGuesses >= 2 && (
          <line x1="30" y1="20" x2="130" y2="20" stroke="#8B4513" strokeWidth="4" />
        )}
        
        {/* Noose */}
        {wrongGuesses >= 3 && (
          <line x1="130" y1="20" x2="130" y2="50" stroke="#8B4513" strokeWidth="3" />
        )}
        
        {/* Head */}
        {wrongGuesses >= 4 && (
          <circle cx="130" cy="70" r="20" fill="none" stroke="#2D3748" strokeWidth="3" />
        )}
        
        {/* Body */}
        {wrongGuesses >= 5 && (
          <line x1="130" y1="90" x2="130" y2="170" stroke="#2D3748" strokeWidth="3" />
        )}
        
        {/* Left arm */}
        {wrongGuesses >= 6 && (
          <line x1="130" y1="110" x2="100" y2="140" stroke="#2D3748" strokeWidth="3" />
        )}
        
        {/* Right arm */}
        {wrongGuesses >= 7 && (
          <line x1="130" y1="110" x2="160" y2="140" stroke="#2D3748" strokeWidth="3" />
        )}
        
        {/* Left leg */}
        {wrongGuesses >= 8 && (
          <line x1="130" y1="170" x2="100" y2="210" stroke="#2D3748" strokeWidth="3" />
        )}
        
        {/* Right leg */}
        {wrongGuesses >= 9 && (
          <line x1="130" y1="170" x2="160" y2="210" stroke="#2D3748" strokeWidth="3" />
        )}
        
        {/* Face details when game is lost */}
        {wrongGuesses >= 6 && (
          <>
            {/* Eyes */}
            <circle cx="123" cy="65" r="2" fill="#2D3748" />
            <circle cx="137" cy="65" r="2" fill="#2D3748" />
            
            {/* Sad face when losing */}
            {wrongGuesses >= 8 && (
              <path d="M 120 80 Q 130 85 140 80" stroke="#DC2626" strokeWidth="2" fill="none" />
            )}
            
            {/* Normal mouth when still playing */}
            {wrongGuesses < 8 && (
              <line x1="125" y1="78" x2="135" y2="78" stroke="#2D3748" strokeWidth="2" />
            )}
          </>
        )}
        
        {/* Additional gallows support */}
        {wrongGuesses >= 1 && (
          <line x1="30" y1="50" x2="50" y2="20" stroke="#8B4513" strokeWidth="3" />
        )}
      </svg>
    </div>
  );
}
