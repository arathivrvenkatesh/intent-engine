const KEYS = {
  EVENTS: "intent_engine_events",
  TASKS: "intent_engine_tasks",
  HISTORY: "intent_engine_history",
  API_KEY: "intent_engine_groq_key",
};

export function saveApiKey(key) {
  localStorage.setItem(KEYS.API_KEY, key);
}

export function loadApiKey() {
  return localStorage.getItem(KEYS.API_KEY) || "";
}

export function getEvents() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.EVENTS) || "[]");
  } catch {
    return [];
  }
}

export function addEvent(event) {
  const events = getEvents();
  const newEvent = {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    ...event,
  };
  events.unshift(newEvent);
  localStorage.setItem(KEYS.EVENTS, JSON.stringify(events));
  return newEvent;
}

export function deleteEvent(id) {
  const events = getEvents().filter((e) => e.id !== id);
  localStorage.setItem(KEYS.EVENTS, JSON.stringify(events));
}

export function getTasks() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.TASKS) || "[]");
  } catch {
    return [];
  }
}

export function addTask(task) {
  const tasks = getTasks();
  const newTask = {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    done: false,
    ...task,
  };
  tasks.unshift(newTask);
  localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
  return newTask;
}

export function toggleTask(id) {
  const tasks = getTasks().map((t) =>
    t.id === id ? { ...t, done: !t.done } : t
  );
  localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
}

export function deleteTask(id) {
  const tasks = getTasks().filter((t) => t.id !== id);
  localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
}

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.HISTORY) || "[]");
  } catch {
    return [];
  }
}

export function addHistory(entry) {
  const history = getHistory();
  history.unshift({ id: Date.now(), timestamp: new Date().toISOString(), ...entry });
  const trimmed = history.slice(0, 20);
  localStorage.setItem(KEYS.HISTORY, JSON.stringify(trimmed));
}

export function clearHistory() {
  localStorage.removeItem(KEYS.HISTORY);
}