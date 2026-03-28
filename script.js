class Calculator {
    constructor(previousOperandElement, currentOperandElement) {
        this.previousOperandElement = previousOperandElement;
        this.currentOperandElement = currentOperandElement;
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
    }

    delete() {
        if (this.currentOperand === '0') return;
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
        if (this.currentOperand === '') this.currentOperand = '0';
    }

    appendNumber(number) {
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
    }

    chooseOperation(operation) {
        if (this.currentOperand === '') return;
        if (this.previousOperand !== '') {
            this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        if (isNaN(prev) || isNaN(current)) return;
        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '−':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '÷':
                computation = prev / current;
                break;
            default:
                return;
        }
        const expression = `${this.getDisplayNumber(prev)} ${this.operation} ${this.getDisplayNumber(current)}`;
        this.currentOperand = computation;
        this.operation = undefined;
        this.previousOperand = '';

        // Save to history
        this.saveToHistory(expression, this.getDisplayNumber(computation));
    }

    saveToHistory(expression, result) {
        const history = JSON.parse(localStorage.getItem('calc_history') || '[]');
        history.push({ expression, result });
        // Keep only last 10
        if (history.length > 10) history.shift();
        localStorage.setItem('calc_history', JSON.stringify(history));
    }

    getDisplayNumber(number) {
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        }
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    updateDisplay() {
        this.currentOperandElement.innerText = this.getDisplayNumber(this.currentOperand);
        if (this.operation != null) {
            this.previousOperandElement.innerText = `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.previousOperandElement.innerText = '';
        }
    }

    // Add haptic feedback for better PWA experience
    vibrate() {
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    }
}

// Select Elements
const numberButtons = document.querySelectorAll('[data-number]');
const operationButtons = document.querySelectorAll('[data-operation]');
const equalsButton = document.querySelector('[data-equals]');
const deleteButton = document.querySelector('[data-delete]');
const allClearButton = document.querySelector('[data-all-clear]');
const previousOperandElement = document.getElementById('previous-operand');
const currentOperandElement = document.getElementById('current-operand');
const themeToggle = document.getElementById('theme-toggle');
const splashScreen = document.getElementById('splash-screen');

const calculator = new Calculator(previousOperandElement, currentOperandElement);

// Splash Screen Logic
window.addEventListener('load', () => {
    setTimeout(() => {
        splashScreen.classList.add('fade-out');
        // Re-enable scroll if needed
        document.body.style.overflow = 'auto';
    }, 600);
});

// Calculator Logic Listeners
numberButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.vibrate();
        calculator.appendNumber(button.innerText);
        calculator.updateDisplay();
    });
});

operationButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.vibrate();
        calculator.chooseOperation(button.innerText);
        calculator.updateDisplay();
    });
});

equalsButton.addEventListener('click', button => {
    calculator.vibrate();
    calculator.compute();
    calculator.updateDisplay();
});

allClearButton.addEventListener('click', button => {
    calculator.vibrate();
    calculator.clear();
    calculator.updateDisplay();
});

deleteButton.addEventListener('click', button => {
    calculator.vibrate();
    calculator.delete();
    calculator.updateDisplay();
});

// Theme Management
const enableDarkMode = () => {
    document.body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
};

const disableDarkMode = () => {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
};

// Check for saved theme preference or system preference
const savedTheme = localStorage.getItem('theme');
const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme === 'dark' || (!savedTheme && systemDarkMode)) {
    enableDarkMode();
}

themeToggle.addEventListener('click', () => {
    calculator.vibrate();
    if (document.body.classList.contains('dark-mode')) {
        disableDarkMode();
    } else {
        enableDarkMode();
    }
});

// Prevent pull-to-refresh
document.body.style.overscrollBehaviorY = 'contain';

// Keyboard accessibility
window.addEventListener('keydown', e => {
    if ((e.key >= 0 && e.key <= 9) || e.key === '.') calculator.appendNumber(e.key);
    if (e.key === 'Enter' || e.key === '=') calculator.compute();
    if (e.key === 'Backspace') calculator.delete();
    if (e.key === 'Escape') calculator.clear();
    if (e.key === '+') calculator.chooseOperation('+');
    if (e.key === '-') calculator.chooseOperation('−');
    if (e.key === '*') calculator.chooseOperation('×');
    if (e.key === '/') calculator.chooseOperation('÷');
    calculator.updateDisplay();
});
