import React, { useState, useEffect } from 'react';

const Stopwatch = ({ isStart }) => {
    const [time, setTime] = useState(0);
    const [running, setRunning] = useState(false);

    useEffect(() => {
        if (isStart) {
            setTimeout(() => {
                setRunning(true)
            }, 350);
        }
    }, [isStart])

    useEffect(() => {
        let interval;

        if (running) {
            interval = setInterval(() => {
                setTime(prevTime => prevTime + 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }

        return () => {
            clearInterval(interval);
        };
    }, [running]);

    const toggleRunning = () => {
        setRunning(prevRunning => !prevRunning);
    };

    const resetTime = () => {
        setTime(0);
        setRunning(false);
    };

    return (
        <div>
            <span>{new Date(time * 1000).toISOString().substr(11, 8)}</span>
        </div>
    );
};

export default Stopwatch;
