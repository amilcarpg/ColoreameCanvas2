importScripts("flood-fill.js?v=20261007-2");

self.addEventListener("message", (event) => {
  const { id } = event.data || {};
  if (!Number.isSafeInteger(id)) return;
  const task = PaintMeFill.createTask(event.data);
  if (!task) {
    self.postMessage({ id, error: "invalid_fill" });
    return;
  }
  while (!task.step()) { /* Work runs off the UI thread. */ }
  self.postMessage({ id, buffer: task.data.buffer }, [task.data.buffer]);
});
