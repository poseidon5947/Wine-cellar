"use client";

export function WineBubbles() {
  const bubbles = [
    { size: 6, left: "8%", delay: "0s", duration: "14s" },
    { size: 4, left: "18%", delay: "2s", duration: "11s" },
    { size: 8, left: "28%", delay: "1s", duration: "16s" },
    { size: 3, left: "38%", delay: "3.5s", duration: "10s" },
    { size: 5, left: "52%", delay: "0.5s", duration: "13s" },
    { size: 7, left: "62%", delay: "4s", duration: "15s" },
    { size: 4, left: "72%", delay: "2.5s", duration: "12s" },
    { size: 6, left: "82%", delay: "1.5s", duration: "17s" },
    { size: 3, left: "90%", delay: "3s", duration: "9s" },
    { size: 5, left: "95%", delay: "5s", duration: "14s" }
  ];

  return (
    <>
      {bubbles.map((b, i) => (
        <div
          key={i}
          className="wine-particle"
          style={{
            width: `${b.size}px`,
            height: `${b.size}px`,
            left: b.left,
            bottom: "-20px",
            animation: `rise ${b.duration} ease-in ${b.delay} infinite`
          }}
        />
      ))}
    </>
  );
}
