export const calculateRankingAndPercentile = (leaderboard, playerName) => {
    // Oyuncunun sıralamasını bul
    const playerIndex = leaderboard.findIndex(player => player.username === playerName);

    if (playerIndex === -1) {
        // Oyuncu bulunamadı
        return { rank: null, percentile: null };
    }

    const totalPlayers = leaderboard.length;
    const rank = playerIndex + 1; // Sıralama 1'den başlar
    const percentile = ((totalPlayers - playerIndex) / totalPlayers) * 100; // Yüzdelik dilimi hesapla

    return { rank, percentile: percentile.toFixed(2) }; // Yüzdelik dilimini 2 ondalık basamağa yuvarla
};