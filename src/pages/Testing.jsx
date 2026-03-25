import React, { useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries, LineSeries } from "lightweight-charts";

export default function BollingerCloudChart() {

    const containerRef = useRef(null);
    const [cloudColor, setCloudColor] = useState("#3B82F6");

    function hexToRGBA(hex, a) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r},${g},${b},${a})`;
    }

    useEffect(() => {

        const width = 900;
        const height = 500;

        const chart = createChart(containerRef.current, {
            width,
            height
        });

        const candleSeries = chart.addSeries(CandlestickSeries);

        // dummy candles
        const candles = [];
        let price = 100;
        const start = new Date(2024, 2, 1);

        for (let i = 0; i < 120; i++) {

            price += (Math.random() - 0.5) * 5;

            const d = new Date(start);
            d.setDate(start.getDate() + i);

            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const dd = String(d.getDate()).padStart(2, "0");

            candles.push({
                time: `${yyyy}-${mm}-${dd}`,
                open: price - 2,
                high: price + 3,
                low: price - 3,
                close: price
            });
        }

        candleSeries.setData(candles);

        const closeData = candles.map(c => ({ time: c.time, value: c.close }));

        // bollinger calc
        function Bollinger(data, p = 20) {

            const upper = [];
            const lower = [];

            for (let i = p; i < data.length; i++) {

                let sum = 0;
                for (let j = 0; j < p; j++) sum += data[i - j].value;

                const mean = sum / p;

                let v = 0;
                for (let j = 0; j < p; j++)
                    v += Math.pow(data[i - j].value - mean, 2);

                const std = Math.sqrt(v / p);

                upper.push({ time: data[i].time, value: mean + std * 2 });
                lower.push({ time: data[i].time, value: mean - std * 2 });

            }

            return { upper, lower };
        }

        const { upper, lower } = Bollinger(closeData);

        // lines
        const upperLine = chart.addSeries(LineSeries, { color: "#22C55E", lineWidth: 2 });
        const lowerLine = chart.addSeries(LineSeries, { color: "#EF4444", lineWidth: 2 });

        upperLine.setData(upper);
        lowerLine.setData(lower);

        // cloud canvas
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        canvas.style.position = "absolute";
        canvas.style.left = "0";
        canvas.style.top = "0";
        canvas.style.pointerEvents = "none";
        canvas.style.zIndex = "1";

        containerRef.current.appendChild(canvas);

        const ctx = canvas.getContext("2d");

        function drawCloud() {

            ctx.clearRect(0, 0, width, height);

            ctx.beginPath();

            // upper
            upper.forEach((p, i) => {

                const x = chart.timeScale().timeToCoordinate(p.time);
                const y = upperLine.priceToCoordinate(p.value);

                if (x === null || y === null) return;

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);

            });

            // lower reverse
            for (let i = lower.length - 1; i >= 0; i--) {

                const p = lower[i];

                const x = chart.timeScale().timeToCoordinate(p.time);
                const y = lowerLine.priceToCoordinate(p.value);

                if (x === null || y === null) continue;

                ctx.lineTo(x, y);

            }

            ctx.closePath();

            ctx.fillStyle = hexToRGBA(cloudColor, 0.35);
            ctx.fill();

        }

        // redraw on zoom/scroll
        chart.timeScale().subscribeVisibleLogicalRangeChange(drawCloud);
        chart.subscribeCrosshairMove(drawCloud);

        setTimeout(drawCloud, 200);

        return () => chart.remove();

    }, [cloudColor]);



    return (

        <div>

            <h3>Bollinger Cloud</h3>

            <input
                type="color"
                value={cloudColor}
                onChange={(e) => setCloudColor(e.target.value)}
            />

            <div
                ref={containerRef}
                style={{
                    position: "relative",
                    width: "900px",
                    height: "500px"
                }}
            ></div>

        </div>

    );

<<<<<<< HEAD
}
=======
}
>>>>>>> b9c4f8e41f172adcc0276e87881f22bf45fce9ce
