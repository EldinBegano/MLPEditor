let currentFilePath = null;
let words = [];
let suggestionBox;
let editor;
let statusBar;

document.addEventListener("DOMContentLoaded", function() {
    suggestionBox = document.getElementById('suggestions');
    editor = document.getElementById('editor');
    statusBar = document.getElementById('status-bar');
    
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

    editor.addEventListener('dragover', (event) => {
        event.preventDefault();
    });
    
    editor.addEventListener('drop', (event) => {
        event.preventDefault();
        handleDrop(event);
    });

    document.getElementById('newBtn').addEventListener('click', newFile);
    document.getElementById('openBtn').addEventListener('click', openFileDialog);
    document.getElementById('saveBtn').addEventListener('click', saveFile);
    document.getElementById('imageBtn').addEventListener('click', () => {
        document.getElementById('imageUpload').click();
    });
    document.getElementById('imageUpload').addEventListener('change', insertImage);

    window.electronAPI.onNewFile(() => {
        newFile();
    });
    
    window.electronAPI.onFileOpened((data) => {
        editor.innerHTML = data.content;
        currentFilePath = data.path;
        updateStatusBar(`File opened: ${getFileName(data.path)}`);
    });
    
    window.electronAPI.onSaveFile(() => {
        saveFile();
    });
    
    window.electronAPI.onSaveFileAs(() => {
        saveFileAs();
    });
    
    window.electronAPI.onSaveComplete((filePath) => {
        currentFilePath = filePath;
        updateStatusBar(`File saved: ${getFileName(filePath)}`);
    });
    
    window.electronAPI.onSaveError((error) => {
        updateStatusBar(`Error saving file: ${error}`);
    });
    
    window.electronAPI.onFileOpenError((error) => {
        updateStatusBar(`Error opening file: ${error}`);
    });
});

function newFile() {
    editor.innerHTML = "Start writing here...";
    currentFilePath = null;
    updateStatusBar('New file created');
}


function openFileDialog() {
    window.electronAPI.openFile();
}

function saveFile() {
    if (editor.innerHTML === "Start writing here...") {
        updateStatusBar('Nothing to save');
        return;
    }
    
    if (currentFilePath) {
        window.electronAPI.saveFile(editor.innerHTML);
    } else {
        saveFileAs();
    }
}

function saveFileAs() {
    if (editor.innerHTML === "Start writing here...") {
        updateStatusBar('Nothing to save');
        return;
    }
    
    window.electronAPI.saveFile(editor.innerHTML);
}

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

function handleDrop(event) {
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.execCommand('insertImage', false, e.target.result);
        };
        reader.readAsDataURL(file);
    }
}

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

function showSuggestions(givenChars) {
    if (!givenChars || givenChars.length < 2) {
        suggestionBox.style.display = 'none';
        return;
    }

    let matches = words.filter(word => word.startsWith(givenChars.toLowerCase()));

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

function updateStatusBar(message) {
    statusBar.textContent = message;
    setTimeout(() => {
        statusBar.textContent = currentFilePath ? `Editing: ${getFileName(currentFilePath)}` : 'Ready';
    }, 3000);
}

function getFileName(filePath) {
    return filePath.split(/[\\/]/).pop();
}