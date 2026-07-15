self.addEventListener("message", (event) => {
  const {
    id,
    width,
    height,
    startX,
    startY,
    fillColor,
    tolerance,
    lineMask,
    buffer,
  } =
    event.data || {};

  if (
    typeof id !== "number" ||
    typeof width !== "number" ||
    typeof height !== "number" ||
    typeof startX !== "number" ||
    typeof startY !== "number" ||
    !buffer
  ) {
    return;
  }

  const data = new Uint8ClampedArray(buffer);
  const protectedPixels =
    lineMask instanceof Uint8Array ? lineMask : new Uint8Array(width * height);
  const totalPixels = width * height;
  const visited = new Uint8Array(totalPixels);
  const queue = new Uint32Array(totalPixels);
  let head = 0;
  let tail = 0;

  const startIndex = (startY * width + startX) * 4;
  const target = [
    data[startIndex],
    data[startIndex + 1],
    data[startIndex + 2],
    data[startIndex + 3],
  ];

  const matches = (offset) =>
    Math.abs(data[offset] - target[0]) <= tolerance &&
    Math.abs(data[offset + 1] - target[1]) <= tolerance &&
    Math.abs(data[offset + 2] - target[2]) <= tolerance &&
    Math.abs(data[offset + 3] - target[3]) <= tolerance;

  queue[tail++] = startY * width + startX;

  while (head < tail) {
    const idx = queue[head++];
    if (visited[idx]) continue;
    visited[idx] = 1;
    if (protectedPixels[idx]) continue;

    const px = idx % width;
    const py = (idx / width) | 0;
    const offset = idx * 4;

    if (!matches(offset)) continue;

    data[offset] = fillColor[0];
    data[offset + 1] = fillColor[1];
    data[offset + 2] = fillColor[2];
    data[offset + 3] = fillColor[3];

    if (px > 0) queue[tail++] = idx - 1;
    if (px < width - 1) queue[tail++] = idx + 1;
    if (py > 0) queue[tail++] = idx - width;
    if (py < height - 1) queue[tail++] = idx + width;
  }

  self.postMessage({ id, buffer: data.buffer }, [data.buffer]);
});
