import React from 'react';

interface GameTableProps {
  players: Array<{
    id: string;
    name: string;
    chips: number;
    cards?: string[];
    isDealer?: boolean;
    isSmallBlind?: boolean;
    isBigBlind?: boolean;
  }>;
  communityCards: string[];
  pot: number;
}

const GameTable: React.FC<GameTableProps> = ({ players, communityCards, pot }) => {
  return (
    <div className="relative w-full max-w-4xl mx-auto aspect-[4/3] bg-green-800 rounded-[50%] p-8 shadow-2xl">
      {/* Community Cards */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-2">
        {communityCards.map((card, index) => (
          <div
            key={index}
            className="w-16 h-24 bg-white rounded-lg shadow-md flex items-center justify-center"
          >
            {card}
          </div>
        ))}
      </div>

      {/* Pot */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-8 text-white text-xl font-bold">
        Pot: ${pot}
      </div>

      {/* Player Positions */}
      <div className="absolute inset-0">
        {players.map((player, index) => {
          const positions = [
            'bottom-4 left-1/2 -translate-x-1/2', // bottom
            'bottom-1/4 right-4', // bottom right
            'top-1/4 right-4', // top right
            'top-4 left-1/2 -translate-x-1/2', // top
            'top-1/4 left-4', // top left
            'bottom-1/4 left-4', // bottom left
          ];
          
          return (
            <div
              key={player.id}
              className={`absolute ${positions[index]} bg-gray-800 text-white p-4 rounded-lg shadow-lg`}
            >
              <div className="font-bold">{player.name}</div>
              <div>${player.chips}</div>
              {player.cards && (
                <div className="flex gap-1 mt-2">
                  {player.cards.map((card, i) => (
                    <div
                      key={i}
                      className="w-8 h-12 bg-white text-black rounded flex items-center justify-center"
                    >
                      {card}
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2 mt-2">
                {player.isDealer && <span className="text-yellow-400">D</span>}
                {player.isSmallBlind && <span className="text-blue-400">SB</span>}
                {player.isBigBlind && <span className="text-red-400">BB</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GameTable; 