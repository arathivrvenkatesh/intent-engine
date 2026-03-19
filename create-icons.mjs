import { createCanvas } from "canvas";
import { writeFileSync } from "fs";

function createIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#7c6fff";
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.2);
  ctx.fill();

  ctx.fillStyle = "white";
  ctx.font = `bold ${size * 0.5}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("⚡", size / 2, size / 2);

  return canvas.toBuffer("image/png");
}

writeFileSync("public/icon-192.png", createIcon(192));
writeFileSync("public/icon-512.png", createIcon(512));
console.log("✅ Icons created!");