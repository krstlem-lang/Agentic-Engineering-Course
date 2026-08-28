const expressionEl = document.getElementById('expression');
const currentEl = document.getElementById('current');

let current = '0';
let previous = null;
let operator = null;
let justEvaluated = false;
let awaitingNewValue = false;

function formatNumber(numStr) {
  if (numStr === '' || numStr === '-') return numStr;
  const [intPart, decPart] = numStr.split('.');
  const formattedInt = new Intl.NumberFormat('en-US').format(Number(intPart));
  return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
}

function updateDisplay() {
  currentEl.textContent = formatNumber(current);
  if (operator && previous !== null) {
    const opSymbol = { '+': '+', '-': '−', '*': '×', '/': '÷' }[operator];
    expressionEl.textContent = `${formatNumber(previous)} ${opSymbol}`;
  } else {
    expressionEl.textContent = '';
  }
}

function inputDigit(digit) {
  if (justEvaluated || awaitingNewValue) {
    current = digit;
    justEvaluated = false;
    awaitingNewValue = false;
    return;
  }
  if (current === '0') {
    current = digit;
  } else {
    current += digit;
  }
}

function inputDecimal() {
  if (justEvaluated || awaitingNewValue) {
    current = '0.';
    justEvaluated = false;
    awaitingNewValue = false;
    return;
  }
  if (!current.includes('.')) {
    current += '.';
  }
}

function clearAll() {
  current = '0';
  previous = null;
  operator = null;
  justEvaluated = false;
  awaitingNewValue = false;
}

function negate() {
  if (current === '0') return;
  current = current.startsWith('-') ? current.slice(1) : `-${current}`;
}

function percent() {
  current = String(parseFloat(current) / 100);
}

function compute(a, b, op) {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return b === 0 ? NaN : a / b;
    default: return b;
  }
}

function setOperator(op) {
  if (operator && previous !== null && !justEvaluated && !awaitingNewValue) {
    const result = compute(parseFloat(previous), parseFloat(current), operator);
    previous = String(result);
    current = String(result);
  } else {
    previous = current;
  }
  operator = op;
  justEvaluated = false;
  awaitingNewValue = true;
}

function equals() {
  if (operator === null || previous === null) return;
  const result = compute(parseFloat(previous), parseFloat(current), operator);
  current = Number.isNaN(result) ? 'Error' : String(result);
  previous = null;
  operator = null;
  justEvaluated = true;
  awaitingNewValue = false;
}

document.querySelector('.buttons').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const { action, value } = btn.dataset;

  switch (action) {
    case 'digit': inputDigit(value); break;
    case 'decimal': inputDecimal(); break;
    case 'clear': clearAll(); break;
    case 'negate': negate(); break;
    case 'percent': percent(); break;
    case 'operator': setOperator(value); break;
    case 'equals': equals(); break;
  }
  updateDisplay();
});

document.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') inputDigit(e.key);
  else if (e.key === '.') inputDecimal();
  else if (['+', '-', '*', '/'].includes(e.key)) setOperator(e.key);
  else if (e.key === 'Enter' || e.key === '=') equals();
  else if (e.key === 'Backspace') {
    current = current.length > 1 ? current.slice(0, -1) : '0';
  } else if (e.key === 'Escape') clearAll();
  else return;
  updateDisplay();
});

updateDisplay();
