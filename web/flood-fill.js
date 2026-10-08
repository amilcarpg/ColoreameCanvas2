// One bounded implementation for the worker and the frame-by-frame fallback.
globalThis.PaintMeFill = (() => {
  const MAX_PIXELS = 1200 * 1200;

  function createTask({ width, height, startX, startY, fillColor, tolerance, lineMask, buffer } = {}) {
    if (!Number.isInteger(width) || width <= 0 ||
        !Number.isInteger(height) || height <= 0) return null;
    const size = width * height;
    if (size > MAX_PIXELS ||
        !Number.isInteger(startX) || startX < 0 || startX >= width ||
        !Number.isInteger(startY) || startY < 0 || startY >= height ||
        !Array.isArray(fillColor) || fillColor.length !== 4 ||
        !fillColor.every((channel) => Number.isInteger(channel) && channel >= 0 && channel <= 255) ||
        !Number.isFinite(tolerance) || tolerance < 0 || tolerance > 255 ||
        !(buffer instanceof ArrayBuffer) || buffer.byteLength !== size * 4 ||
        (lineMask != null && (!(lineMask instanceof Uint8Array) || lineMask.length !== size))) {
      return null;
    }

    const data = new Uint8ClampedArray(buffer);
    const start = startY * width + startX;
    const target = Array.from(data.subarray(start * 4, start * 4 + 4));
    const visited = new Uint8Array(size);
    const queue = new Uint32Array(size);
    let head = 0;
    let tail = 0;
    const enqueue = (index) => {
      if (visited[index]) return;
      visited[index] = 1;
      queue[tail++] = index;
    };
    if (!lineMask?.[start] && !target.every((value, channel) => Math.abs(value - fillColor[channel]) <= tolerance)) {
      enqueue(start);
    }

    return {
      data,
      get done() { return head === tail; },
      step(budget = 30000) {
        let processed = 0;
        while (head < tail && processed++ < budget) {
          const index = queue[head++];
          const offset = index * 4;
          if (lineMask?.[index] || !target.every((value, channel) => Math.abs(data[offset + channel] - value) <= tolerance)) continue;
          data.set(fillColor, offset);
          const x = index % width;
          const y = Math.floor(index / width);
          if (x > 0) enqueue(index - 1);
          if (x < width - 1) enqueue(index + 1);
          if (y > 0) enqueue(index - width);
          if (y < height - 1) enqueue(index + width);
        }
        return head === tail;
      },
    };
  }

  return { createTask };
})();
