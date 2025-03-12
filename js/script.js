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

function saveContent() {
    const content = document.getElementById('editor').innerHTML;
    
    const fileName = prompt("Enter the file name:", "mlpeditor");
    
    const finalFileName = fileName ? fileName : 'mlpeditor';

    const blob = new Blob([content], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = finalFileName + '.mlp';
    link.click();
    alert('Content Saved as file!');
}


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
