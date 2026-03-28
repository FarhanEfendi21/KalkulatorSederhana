class Calculator {
    constructor(previousOperandElement, currentOperandElement) {
        this.previousOperandElement = previousOperandElement;
        this.currentOperandElement = currentOperandElement;
        this.isDeg = true;
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetScreen = false;
    }

    delete() {
        if (this.currentOperand === '0') return;
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
        if (this.currentOperand === '') this.currentOperand = '0';
    }

    appendNumber(number) {
        if (this.shouldResetScreen) {
            this.currentOperand = '';
            this.shouldResetScreen = false;
        }
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
    }

    chooseOperation(operation) {
        if (operation === '%') {
            this.currentOperand = (parseFloat(this.currentOperand) / 100).toString();
            return;
        }
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
            case 'power':
                computation = Math.pow(prev, current);
                break;
            default:
                return;
        }
        const expression = `${this.getDisplayNumber(prev)} ${this.operation === 'power' ? '^' : this.operation} ${this.getDisplayNumber(current)}`;
        this.currentOperand = computation;
        this.operation = undefined;
        this.previousOperand = '';
        this.shouldResetScreen = true;

        this.saveToHistory(expression, this.getDisplayNumber(computation));
    }

    // Advanced Operations
    advancedCompute(type) {
        const current = parseFloat(this.currentOperand);
        if (isNaN(current) && type !== 'phi') return;
        
        let result;
        let expression = '';
        const angleValue = this.isDeg ? (current * Math.PI) / 180 : current;

        switch (type) {
            case 'sin':
                result = Math.sin(angleValue);
                expression = `sin(${current})`;
                break;
            case 'cos':
                result = Math.cos(angleValue);
                expression = `cos(${current})`;
                break;
            case 'tan':
                result = Math.tan(angleValue);
                expression = `tan(${current})`;
                break;
            case 'lg':
                result = Math.log10(current);
                expression = `log(${current})`;
                break;
            case 'ln':
                result = Math.log(current);
                expression = `ln(${current})`;
                break;
            case 'sqrt':
                result = Math.sqrt(current);
                expression = `√(${current})`;
                break;
            case 'inv':
                result = 1 / current;
                expression = `1/(${current})`;
                break;
            case 'phi':
                result = 1.61803398875;
                expression = 'φ';
                this.currentOperand = result.toString();
                this.updateDisplay();
                return;
            case 'fact':
                result = this.factorial(current);
                expression = `${current}!`;
                break;
            default:
                return;
        }

        this.saveToHistory(expression, this.getDisplayNumber(result));
        this.currentOperand = result.toString();
        this.shouldResetScreen = true;
        this.updateDisplay();
    }

    factorial(n) {
        if (n < 0) return NaN;
        if (n === 0 || n === 1) return 1;
        let res = 1;
        for (let i = 2; i <= n; i++) res *= i;
        return res;
    }

    saveToHistory(expression, result) {
        const history = JSON.parse(localStorage.getItem('calc_history') || '[]');
        history.push({ expression, result });
        if (history.length > 10) history.shift();
        localStorage.setItem('calc_history', JSON.stringify(history));
    }

    getDisplayNumber(number) {
        if (isNaN(number)) return 'Error';
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
            let opSymbol = this.operation;
            if (opSymbol === 'power') opSymbol = '^';
            this.previousOperandElement.innerText = `${this.getDisplayNumber(this.previousOperand)} ${opSymbol}`;
        } else {
            this.previousOperandElement.innerText = '';
        }
    }

    vibrate() {
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    }
}

// Select Elements
const numberButtons = document.querySelectorAll('[data-number]');
const operationButtons = document.querySelectorAll('[data-operation]');
const advancedButtons = document.querySelectorAll('[data-advanced]');
const equalsButton = document.querySelector('[data-equals]');
const deleteButton = document.querySelector('[data-delete]');
const allClearButton = document.querySelector('[data-all-clear]');
const previousOperandElement = document.getElementById('previous-operand');
const currentOperandElement = document.getElementById('current-operand');
const themeToggle = document.getElementById('theme-toggle');
const splashScreen = document.getElementById('splash-screen');
const advancedToggle = document.getElementById('advanced-toggle');
const advancedPanel = document.getElementById('advanced-panel');
const modeToggle = document.getElementById('mode-toggle');

const calculator = new Calculator(previousOperandElement, currentOperandElement);

// Toggle Advanced Panel
advancedToggle.addEventListener('click', () => {
    calculator.vibrate();
    advancedPanel.classList.toggle('open');
});

// Advanced Buttons Logic
advancedButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.vibrate();
        const type = button.dataset.advanced;
        if (type === 'deg') {
            calculator.isDeg = !calculator.isDeg;
            button.innerText = calculator.isDeg ? 'deg' : 'rad';
        } else if (type === 'power') {
            calculator.chooseOperation('power');
        } else if (['sin', 'cos', 'tan', 'lg', 'ln', 'sqrt', 'fact', 'inv', 'phi'].includes(type)) {
            calculator.advancedCompute(type);
        } else {
            // Brackets - For simplicity in vanilla, we just append
            calculator.appendNumber(type);
        }
        calculator.updateDisplay();
    });
});

// Splash Screen Logic (Session-based)
const hasShownSplash = sessionStorage.getItem('splash_shown');
if (hasShownSplash) {
    splashScreen.style.display = 'none';
    document.body.style.overflow = 'auto';
} else {
    window.addEventListener('load', () => {
        setTimeout(() => {
            splashScreen.classList.add('fade-out');
            sessionStorage.setItem('splash_shown', 'true');
            document.body.style.overflow = 'auto';
        }, 800);
    });
}

// Calculator Listeners
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
        calculator.chooseOperation(button.getAttribute('data-operation') || button.innerText);
        calculator.updateDisplay();
    });
});

equalsButton.addEventListener('click', () => {
    calculator.vibrate();
    calculator.compute();
    calculator.updateDisplay();
});

allClearButton.addEventListener('click', () => {
    calculator.vibrate();
    calculator.clear();
    calculator.updateDisplay();
});

deleteButton.addEventListener('click', () => {
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
const savedTheme = localStorage.getItem('theme');
const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
if (savedTheme === 'dark' || (!savedTheme && systemDarkMode)) enableDarkMode();

themeToggle.addEventListener('click', () => {
    calculator.vibrate();
    document.body.classList.contains('dark-mode') ? disableDarkMode() : enableDarkMode();
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
    if (e.key === '%') calculator.chooseOperation('%');
    calculator.updateDisplay();
});
