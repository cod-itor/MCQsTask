const data = {
  "q": "What are the two main types of primary studies in epidemiology?",
  "a": "Descriptive studies/nAnalytic studies[cite: 3]",
  "b": "Another test\\nWith literal backslash-n"
};

function sanitize(obj) {
  if (typeof obj === 'string') {
    return obj.replace(/\/n/g, '\n').replace(/\\n/g, '\n');
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, sanitize(v)])
    );
  }
  return obj;
}

console.log(sanitize(data));
