export const calculateStatsByType = (games, username) => {
    const stats = {
        Blitz: { wins: 0, losses: 0, draws: 0, totalMatches: 0 },
        Rapid: { wins: 0, losses: 0, draws: 0, totalMatches: 0 },
    };

    games.forEach(game => {
        const gameType = game.gameType || 'unknown'; // Maç türünü al, yoksa 'unknown' ata
        if (!stats[gameType]) {
            stats[gameType] = { wins: 0, losses: 0, draws: 0, totalMatches: 0 };
        }

        if (game.white_player_name === username) {
            if (game.results === 1) {
                stats[gameType].wins++;
            } else if (game.results === 0) {
                stats[gameType].losses++;
            } else {
                stats[gameType].draws++;
            }
        } else {
            if (game.results === 1) {
                stats[gameType].losses++;
            } else if (game.results === 0) {
                stats[gameType].wins++;
            } else {
                stats[gameType].draws++;
            }
        }
        stats[gameType].totalMatches++;
    });

    return stats;
};