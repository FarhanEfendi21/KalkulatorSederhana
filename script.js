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
            case '+': computation = prev + current; break;
            case '−': computation = prev - current; break;
            case '×': computation = prev * current; break;
            case '÷': computation = prev / current; break;
            case 'power': computation = Math.pow(prev, current); break;
            default: return;
        }
        const expression = `${this.getDisplayNumber(prev)} ${this.operation === 'power' ? '^' : this.operation} ${this.getDisplayNumber(current)}`;
        this.currentOperand = computation;
        this.operation = undefined;
        this.previousOperand = '';
        this.shouldResetScreen = true;
        this.saveToHistory(expression, this.getDisplayNumber(computation));
    }

    advancedCompute(type) {
        const current = parseFloat(this.currentOperand);
        if (isNaN(current) && !['phi', 'e'].includes(type)) return;
        
        let result;
        let expression = '';
        const angleValue = this.isDeg ? (current * Math.PI) / 180 : current;

        switch (type) {
            case 'sin': result = Math.sin(angleValue); expression = `sin(${current})`; break;
            case 'cos': result = Math.cos(angleValue); expression = `cos(${current})`; break;
            case 'tan': result = Math.tan(angleValue); expression = `tan(${current})`; break;
            case 'lg': result = Math.log10(current); expression = `log(${current})`; break;
            case 'ln': result = Math.log(current); expression = `ln(${current})`; break;
            case 'sqrt': result = Math.sqrt(current); expression = `√(${current})`; break;
            case 'inv': result = 1 / current; expression = `1/(${current})`; break;
            case 'phi': result = 1.61803398875; expression = 'φ'; break;
            case 'e': result = Math.E; expression = 'e'; break;
            case 'fact': result = this.factorial(current); expression = `${current}!`; break;
            default: return;
        }

        if (['phi', 'e'].includes(type)) {
            this.currentOperand = result.toString();
        } else {
            this.saveToHistory(expression, this.getDisplayNumber(result));
            this.currentOperand = result.toString();
            this.shouldResetScreen = true;
        }
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
        let integerDisplay = isNaN(integerDigits) ? '' : integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        return decimalDigits != null ? `${integerDisplay}.${decimalDigits}` : integerDisplay;
    }

    updateDisplay() {
        this.currentOperandElement.innerText = this.getDisplayNumber(this.currentOperand);
        if (this.operation != null) {
            let opSymbol = this.operation === 'power' ? '^' : this.operation;
            this.previousOperandElement.innerText = `${this.getDisplayNumber(this.previousOperand)} ${opSymbol}`;
        } else {
            this.previousOperandElement.innerText = '';
        }
    }

    vibrate() { if ('vibrate' in navigator) navigator.vibrate(10); }
}

const previousOperandElement = document.getElementById('previous-operand');
const currentOperandElement = document.getElementById('current-operand');
const buttonsGrid = document.getElementById('buttons-grid');
const advancedToggle = document.getElementById('advanced-toggle');
const themeToggle = document.getElementById('theme-toggle');
const splashScreen = document.getElementById('splash-screen');

const calculator = new Calculator(previousOperandElement, currentOperandElement);

// Toggle Advanced
advancedToggle.addEventListener('click', () => {
    calculator.vibrate();
    buttonsGrid.classList.toggle('advanced-active');
});

// Event Delegation for Buttons
buttonsGrid.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    calculator.vibrate();

    if (btn.hasAttribute('data-number')) {
        calculator.appendNumber(btn.innerText);
    } else if (btn.hasAttribute('data-operation')) {
        calculator.chooseOperation(btn.getAttribute('data-operation'));
    } else if (btn.hasAttribute('data-advanced')) {
        const type = btn.getAttribute('data-advanced');
        if (type === 'deg') {
            calculator.isDeg = !calculator.isDeg;
            btn.innerText = calculator.isDeg ? 'deg' : 'rad';
        } else if (type === 'power') {
            calculator.chooseOperation('power');
        } else if (['(', ')'].includes(type)) {
            calculator.appendNumber(type);
        } else {
            calculator.advancedCompute(type);
        }
    } else if (btn.hasAttribute('data-all-clear')) {
        calculator.clear();
    } else if (btn.hasAttribute('data-delete')) {
        calculator.delete();
    } else if (btn.hasAttribute('data-equals')) {
        calculator.compute();
    }
    calculator.updateDisplay();
});

// Splash Screen
const hasShownSplash = sessionStorage.getItem('splash_shown');
if (hasShownSplash) {
    splashScreen.style.display = 'none';
} else {
    window.addEventListener('load', () => {
        setTimeout(() => {
            splashScreen.classList.add('fade-out');
            sessionStorage.setItem('splash_shown', 'true');
        }, 800);
    });
}

// Theme
const applyTheme = (theme) => {
    document.body.classList.toggle('dark-mode', theme === 'dark');
    localStorage.setItem('theme', theme);
};
if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) applyTheme('dark');
themeToggle.addEventListener('click', () => applyTheme(document.body.classList.contains('dark-mode') ? 'light' : 'dark'));

document.body.style.overscrollBehaviorY = 'contain';
