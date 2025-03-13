//Image Insert Function from 
function insertImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.execCommand('insertImage', false, e.target.result);
        };
        reader.readAsDataURL(file);
    }
}

//Image Drag and Drop
function handleDrop(event) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.execCommand('insertImage', false, e.target.result);
        };
        reader.readAsDataURL(file);
    }
}

//Save File function
function saveContent() {
    const content = document.getElementById('editor').innerHTML;
    
    const fileName = prompt("Enter the file name:", "mlpeditor");
    
    const finalFileName = fileName ? fileName : 'mlpeditor';
    //Blob = Binary Large Object, type: text/html makes content in HTML Format
    const blob = new Blob([content], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = finalFileName + '.mlp';
    link.click();
    alert('Content Saved as file!');
}

//Load File function
function loadContent() {
    const editor = document.getElementById('editor');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.mlp';
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                editor.innerHTML = e.target.result;
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

//If click temp text disappear if nothing inside temp text appear
document.addEventListener("DOMContentLoaded", function() {
    const editor = document.getElementById("editor");
    editor.addEventListener("focus", function() {
        if (editor.innerHTML.trim() === "Start writing here...") {
            editor.innerHTML = "";
        }
    });
    editor.addEventListener("blur", function() {
        if (editor.innerHTML.trim() === "") {
            editor.innerHTML = "Start writing here...";
        }
    });
});

let words = [];
let suggestionBox = document.getElementById('suggestions');
let editor = document.getElementById('editor');

editor.addEventListener('input', function () {
    updateWordList();
    let lastWord = getLastWord();
    showSuggestions(lastWord);
});

editor.addEventListener('keydown', function (event) {
    let suggestions = document.querySelectorAll('.suggestion');
    let selected = document.querySelector('.suggestion.selected');

    if (event.key === 'ArrowDown' && suggestions.length) {
        event.preventDefault();
        if (selected) {
            selected.classList.remove('selected');
            let next = selected.nextElementSibling || suggestions[0];
            next.classList.add('selected');
        } else {
            suggestions[0].classList.add('selected');
        }
    } else if (event.key === 'ArrowUp' && suggestions.length) {
        event.preventDefault();
        if (selected) {
            selected.classList.remove('selected');
            let prev = selected.previousElementSibling || suggestions[suggestions.length - 1];
            prev.classList.add('selected');
        }
    } else if (event.key === 'Enter' && selected) {
        event.preventDefault();
        insertWord(selected.innerText);
    }
});

function updateWordList() {
    let text = editor.innerText;
    let wordsArray = text.match(/\b\w{2,}\b/g) || [];
    
    wordsArray.forEach(word => {
        if (!words.includes(word.toLowerCase())) {
            words.push(word.toLowerCase());
        }
    });
}

function getLastWord() {
    let text = editor.innerText;
    let wordsArray = text.split(/\s+/);
    return wordsArray[wordsArray.length - 1] || '';
}

function showSuggestions(givenchars) {
    if (!givenchars || givenchars.length < 2) {
        suggestionBox.style.display = 'none';
        return;
    }

    let matches = words.filter(word => word.startsWith(givenchars.toLowerCase()));

    if (matches.length === 0) {
        suggestionBox.style.display = 'none';
        return;
    }

    suggestionBox.innerHTML = matches.map(word => `<div class="suggestion">${word}</div>`).join('');
    suggestionBox.style.display = 'block';

    let rect = editor.getBoundingClientRect();
    suggestionBox.style.left = `${rect.left + window.scrollX}px`;
    suggestionBox.style.top = `${rect.bottom + window.scrollY}px`;

    document.querySelectorAll('.suggestion').forEach(item => {
        item.addEventListener('click', () => insertWord(item.innerText));
    });
}

function insertWord(word) {
    let text = editor.innerText;
    let wordsArray = text.split(/\s+/);
    wordsArray[wordsArray.length - 1] = word;
    editor.innerText = wordsArray.join(' ') + ' ';
    suggestionBox.style.display = 'none';
    editor.focus();
}
