// Função para criar um novo elemento de tarefa
function createTaskElement(taskText) {
    let task = document.createElement('div');
    task.className = 'task';
    task.draggable = true; // Permite arrastar
    task.id = 'task-' + Date.now();

    // Div para o texto da tarefa, que é editável
    let textDiv = document.createElement('div');
    textDiv.contentEditable = true;
    textDiv.innerText = taskText;
    textDiv.className = 'task-text';
    task.appendChild(textDiv);

    // Evento de arrastar: inicia o arrasto
    task.addEventListener('dragstart', (e) => {
        // Verifica se o bloco está sendo editado
        if (document.activeElement === textDiv) {
            e.preventDefault(); // Impede arrastar enquanto edita
            return;
        }
        e.dataTransfer.setData('text/plain', task.id);
        task.classList.add('dragging');
    });

    // Finaliza o arrasto
    task.addEventListener('dragend', () => {
        task.classList.remove('dragging');
        saveBoard(); // Salva o estado do quadro após a movimentação
    });

    // Controle de edição: desativa o arrasto durante a edição
    textDiv.addEventListener('focus', function() {
        task.draggable = false; // Impede arrastar enquanto está editando
    });

    textDiv.addEventListener('blur', function() {
        task.draggable = true; // Permite arrastar após terminar de editar
        if (this.innerText.trim() === '') {
            if (confirm("Você deseja apagar esta tarefa?")) {
                task.remove();
                saveBoard();
            } else {
                this.innerText = taskText;
            }
        } else {
            saveBoard();
        }
    });

    // Permite inserir uma nova linha ao pressionar 'Enter'
    textDiv.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            document.execCommand('insertLineBreak');
            e.preventDefault(); // Impede que o Enter finalize a edição
        }
    });

    return task;
}

// Adiciona funcionalidade de arrastar e soltar entre as colunas
document.querySelectorAll('.column').forEach((column) => {
    column.addEventListener('dragover', (e) => {
        e.preventDefault();
        const dragging = document.querySelector('.dragging');
        if (dragging) {
            column.appendChild(dragging);
        }
    });
});

// Função para salvar o estado atual do quadro de tarefas no LocalStorage
function saveBoard() {
    const boardData = {
        columns: {}
    };

    document.querySelectorAll('.column').forEach((column) => {
        const columnId = column.id;
        const tasks = [];
        column.querySelectorAll('.task-text').forEach((task) => {
            tasks.push(task.innerText); // Salva o conteúdo do bloco de notas
        });
        boardData.columns[columnId] = tasks; // Associa o conteúdo às colunas
    });

    localStorage.setItem('taskBoard', JSON.stringify(boardData)); // Salva no LocalStorage
}

// Função para carregar o quadro de tarefas do LocalStorage
function loadBoard() {
    const boardData = JSON.parse(localStorage.getItem('taskBoard'));
    if (!boardData) return; // Se não houver dados salvos, não faz nada

    for (const columnId in boardData.columns) {
        const column = document.getElementById(columnId);
        
        // Verifica se a coluna existe
        if (column) {
            const tasksContainer = column.querySelector('.tasks-container'); // Supondo que você tenha um contêiner para as tarefas

            // Adiciona as tarefas do LocalStorage
            boardData.columns[columnId].forEach((taskText) => {
                if (taskText.trim() !== '') { // Verifica se a tarefa não está vazia
                    // Verifica se a tarefa já não está presente
                    const existingTasks = Array.from(tasksContainer.children);
                    const taskExists = existingTasks.some(existingTask => existingTask.querySelector('.task-text').innerText === taskText);

                    if (!taskExists) { // Se a tarefa não existe, adiciona
                        const taskElement = createTaskElement(taskText);
                        tasksContainer.appendChild(taskElement);
                    }
                }
            });
        }
    }
}

// Carrega o quadro de tarefas quando a página é carregada
window.addEventListener('load', loadBoard);
