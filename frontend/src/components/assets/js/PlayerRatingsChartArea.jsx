import React, { useEffect, useState } from 'react';
import { LineChart, lineElementClasses } from '@mui/x-charts/LineChart';

const PlayerRatingsChart = ({ data, gameTypeB }) => {
    const [logData, setLogData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [gameType, setGameType] = useState('');
    // const data = {
    //     id: 4,
    //     username: 'melihytkn',
    //     log_data:
    //         '[{"dateLog":"Jul 24, 2024","blitzPuan":421,"rapidPuan":500},{"dateLog":"Jul 25, 2024","blitzPuan":419,"rapidPuan":500},{"dateLog":"Jul 26, 2024","blitzPuan":419,"rapidPuan":500},{"dateLog":"Jul 27, 2024","blitzPuan":417,"rapidPuan":500},{"dateLog":"Jul 28, 2024","blitzPuan":424,"rapidPuan":500}]',
    //     last_updated: '2024-07-25T15:43:06.000Z',
    // };

    useEffect(() => {
        if (data) {
            // Veriyi parse et ve durumu güncelle
            try {
                console.log(data, gameTypeB)
                const parsedData = JSON.parse(data.log.log_data);
                setGameType(gameTypeB.toLowerCase());
                setLogData(parsedData);
            } catch (error) {
                console.error('Veri parse hatası:', error);
                setLogData([]);
            }
            setLoading(false); // Veri yüklendi
        } else {
            setLoading(false); // Veri yoksa da yüklemeyi bitir
        }
    }, [data, gameType]);

    if (loading) {
        return <div>Loading...</div>; // Yüklenirken gösterilecek mesaj
    }

    if (!logData || logData.length === 0) {
        return <div>No data available</div>; // Veri yoksa gösterilecek mesaj
    }

    // Seçilen oyun türüne göre puanları seç
    const uData = logData.map((entry) =>
        gameTypeB === 'Blitz' ? entry.blitzPuan : entry.rapidPuan
    );
    const xLabels = logData.map((entry) => entry.dateLog);

    return (
        <LineChart
            width={500}
            height={300}
            series={[
                { data: uData, label: `${gameType}`, area: true, showMark: false },
            ]}
            xAxis={[{ scaleType: 'point', data: xLabels }]}
            yAxis={[{ min: Math.min(...uData) - 10, max: Math.max(...uData) + 10 }]} // y ekseni aralığını ayarla
            sx={{
                [`& .${lineElementClasses.root}`]: {
                    display: 'none',
                },
            }}
        />
    );
};

export default PlayerRatingsChart;
