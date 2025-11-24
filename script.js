

let editar = null;
let genID = 0;
const statuses = ["created", "in-progress", "testing", "done"];
const results = ["Completed", "Cancelled"];
let taskList = [];
let userList = [];
let currentUser = null;
let currentFilter = {
    key: null,    // 'priority', 'assignedTo', 'createdBy'
    value: null   // 'low', 'Medium', 'user.email'
};
const filterTasksDiv = document.getElementById("filter-tasks");

// contenedores
const loginDiv = document.getElementById("login");
const loginForm = document.getElementById("login-form");
const loginEmailInput = document.getElementById("login-email");
const loginPasswordInput = document.getElementById("login-password");
const loginBtn = document.getElementById("login-btn");

let contentDiv = document.getElementById("main-app");
let taskForm = document.getElementById("task-form");
let userForm = document.getElementById("user-form");

// inputs tarea
let taskNameInput = document.getElementById("subject");
let taskDescInput = document.getElementById("description");
let taskPrioritySelect = document.getElementById("priority");
let submitTaskBtn = document.getElementById("submit-task");

// botones y tablas
let addTaskBtn = document.getElementById("add-task-btn");
let addUserBtn = document.getElementById("add-user-btn");
let taskTableBody = document.getElementById("task-table-body");
let userTableBody = document.getElementById("user-table-body");
let cancelButtons = document.querySelectorAll(".cancel-btn");




function showTaskInfo(taskId) {
    const tarea = taskList.find(t => t.id === taskId);
    if (!tarea) return;
    const infoDiv = document.getElementById("task-info");

    // --- Estilos de Prioridad (para la etiqueta) ---
    const priorityClasses = {
        'low': 'bg-green-100 text-green-800',
        'medium': 'bg-yellow-100 text-yellow-800',
        'high': 'bg-red-100 text-red-800'
    };
    const priorityTag = priorityClasses[tarea.priority.toLowerCase()] || 'bg-gray-100 text-gray-800';


    infoDiv.innerHTML = `
    <div class="modal-content p-6 rounded-lg shadow-2xl">
        <button id="close-task-info" class="close-task-info-btn text-xl font-bold text-gray-600 hover:text-gray-900 transition duration-150">x</button>
        
        <div class="flex justify-between items-start mb-4 pb-2 border-b border-gray-200">
            <h3 class="text-3xl font-extrabold text-gray-800">${tarea.subject}</h3>
            
            <div class="flex space-x-2 pt-1">
                <button class="text-gray-500 hover:text-blue-600 transition duration-150" onclick="editTask(${tarea.id})">
                    <span class="text-2xl">✏️</span>
                </button>
                <button class="text-gray-500 hover:text-red-600 transition duration-150" onclick="deleteTask(${tarea.id})">
                    <span class="text-2xl">🗑️</span>
                </button>
            </div>
        </div>

        <div class="grid grid-cols-2 gap-y-2 gap-x-4 mb-6 text-sm text-gray-700">
            
            <p><strong>Priority:</strong> <span class="px-3 py-1 rounded-full text-xs font-semibold ${priorityTag}">${tarea.priority}</span></p>
            <p><strong>Status:</strong> <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">${tarea.status}</span></p>
            
            <p class="col-span-2 mt-2"><strong>Created By:</strong> ${tarea.createdBy.name} on ${formatDateContextual(tarea.createdAt)}</p>
            <p class="col-span-2"><strong>Assigned To:</strong> ${tarea.assignedTo ? tarea.assignedTo.name : "Unassigned"}</p>
            <p class="col-span-2"><strong>Last Edited By:</strong> ${tarea.editedBy ? tarea.editedBy.name + " on " + formatDateContextual(tarea.editedAt) : "Never edited"}</p>
            
            <p class="col-span-2 mt-2 border-t pt-2 border-gray-100"><strong>Completed At:</strong> ${tarea.completedAt ? tarea.completedAt : "Not completed yet"}</p>
            <p class="col-span-2"><strong>Result:</strong> ${tarea.result ? tarea.result : "N/A"}</p>
            <p class="col-span-2 mt-4 text-gray-800 p-3 bg-gray-50 rounded-lg"><strong>Description:</strong> ${tarea.description}</p>
        </div>


        <div class="mt-6 border-t pt-4 border-gray-200">
            <h4 class="text-xl font-bold mb-3 text-gray-800">Comments (${tarea.comments ? tarea.comments.length : 0})</h4>
            
            <div id="comments-section" class="space-y-3 max-h-48 overflow-y-auto pr-2"> 
            ${tarea.comments && tarea.comments.length > 0 ?
            tarea.comments.map(comment => `
                <div class="comment p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                    <p class="text-xs text-gray-500 mb-1">
                        <strong>${comment.user}</strong> commented on ${formatDateContextual(comment.date)}
                    </p> 
                    <p class="text-gray-700 text-sm">${comment.text}</p>
                </div>`).join('')
            : '<p class="text-gray-500 italic">No comments yet.</p>'}
            </div>
            
            <div class="flex flex-col mt-4">
                <textarea id="comment-text" rows="3" placeholder="Write a new comment..." 
                          class="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"></textarea>
                <button onclick="addComment(${tarea.id})" 
                        class="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg mt-2 hover:bg-blue-700 transition duration-150 self-end">
                    Send Comment
                </button>
            </div>
        </div>
    </div>
    `;
    infoDiv.style.display = "block";

    const btnCloseInfo = document.getElementById("close-task-info");
    btnCloseInfo.addEventListener("click", function () {
        hideTaskInfoModal();
    });
}


function hideTaskInfoModal() {
    const infoDiv = document.getElementById("task-info");
    if (infoDiv) {
        infoDiv.style.display = "none";
        infoDiv.innerHTML = '';
    }
}


function addComment(taskId) {
    const commentTextarea = document.getElementById("comment-text");
    const commentText = commentTextarea.value.trim();

    if (!commentText) {
        mostrarMensaje("No puede enviar un comentario vacío");
        return;
    }

    const tarea = taskList.find(t => t.id === taskId);
    if (!tarea) return;


    if (!tarea.comments) {
        tarea.comments = [];
    }

    const newComment = {
        user: currentUser.name,
        date: new Date().toISOString(),
        text: commentText
    };
    commentTextarea.value = "";
    tarea.comments.push(newComment);
    guardarDatos();

    showTaskInfo(taskId);
    mostrarMensaje("Comentario agregado exitosamente.", 1500, true);
}
// Funciones de apoyo
function mostrarMensaje(text, duration = 2000, exito = false) {
    const msg = document.getElementById("message");
    const content = msg.querySelector(".modal-content");
    msg.className = exito ? "success" : "error";

    content.textContent = text;
    msg.style.display = "block";
    msg.style.opacity = "1";

    setTimeout(() => {
        msg.style.opacity = "0";
        setTimeout(() => { msg.style.display = "none"; }, 300);
    }, duration);
}

function mostrarModalLogin(message, onConfirm, onCancel) {
    const modal = document.getElementById("login-modal");
    const modalMessage = document.getElementById("login-modal-message");
    modalMessage.textContent = message;
    modal.style.display = "block";
    const confirmBtn = document.getElementById("login-modal-confirm-btn");
    const cancelBtn = document.getElementById("login-modal-cancel-btn");
    confirmBtn.onclick = function () {
        modal.style.display = "none";
        if (typeof onConfirm === "function") onConfirm();
        mostrarMensaje("Inicio de sesión exitoso.", 2000, true);
    };

    cancelBtn.onclick = function () {
        modal.style.display = "none";
        if (typeof onCancel === "function") onCancel();
    };

}

function mostrarModalEdit(innerHTML, onConfirm, onCancel) {
    const modal = document.getElementById("asign-edit-modal");
    const modalHTML = document.getElementById("modal-div");
    modalHTML.innerHTML = innerHTML;
    modal.style.display = "block";
    const confirmBtn = document.getElementById("save-btn");
    const cancelBtn = document.getElementById("cancel-btn-modal");
    confirmBtn.onclick = function () {
        if (typeof onConfirm === "function") onConfirm();
    };
    cancelBtn.onclick = function () {
        if (typeof onCancel === "function") onCancel();
    };
}

function mostrarPantalla() {
    contentDiv.style.display = "block";
    loginDiv.style.display = "none";
    pintarNavbar();
    inicializarFiltros();
    pintarTareas();
    pintarUsuarios();
}

function logout() {
    currentUser = null;
    localStorage.removeItem("currentUser");
    contentDiv.style.display = "none";
    loginDiv.style.display = "block";
    mostrarMensaje("Sesión cerrada.", 2000, true);
}
function limpiarForm(inputs) {
    inputs.forEach(input => input.value = "");
    taskPrioritySelect.value = "low";
}
function guardarDatos() {
    localStorage.setItem("taskList", JSON.stringify(taskList));
    localStorage.setItem("userList", JSON.stringify(userList));
    localStorage.setItem("contador", genID);
}
function cargarDatos() {
    if (localStorage.getItem("taskList")) taskList = JSON.parse(localStorage.getItem("taskList"));
    if (localStorage.getItem("userList")) userList = JSON.parse(localStorage.getItem("userList"));
    if (localStorage.getItem("contador")) genID = parseInt(localStorage.getItem("contador"));
}

// tareas
function agregarTarea(subject, description, priority) {
    const tarea = { id: genID++, subject, description, priority, status: "created", createdBy: { name: currentUser.name, email: currentUser.email }, editedBy: null, assignedTo: null, createdAt: new Date().toISOString(), editedAt: null, completedAt: null, comments: [], result: null };
    taskList.push(tarea);
    limpiarForm([taskNameInput, taskDescInput]);
    guardarDatos();
    mostrarPantalla();
    enableDragAndDrop();
}
function cargarTarea(id) {
    const tarea = taskList.find(t => t.id === id);
    if (tarea) {
        taskNameInput.value = tarea.subject;
        taskDescInput.value = tarea.description;
        taskPrioritySelect.value = tarea.priority;
        mostrarForm(taskForm);
    }
}
function editTask(id) {
    const tarea = taskList.find(t => t.id === id);
    if (!tarea) return;

    editar = id;

    const innerHtml = `
        <h2 class="text-xl font-bold mb-4 text-gray-800">Editar Tarea: ${tarea.subject}</h2>
        
        <label for="edit-task-subject" class="block text-sm font-medium text-gray-700 mb-1">Asunto:</label>
        <input type="text" id="edit-task-subject" 
               class="w-full p-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500" 
               value="${tarea.subject}" />
        
        <label for="edit-task-description" class="block text-sm font-medium text-gray-700 mb-1">Descripción:</label>
        <textarea id="edit-task-description" 
                  class="w-full p-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  rows="3" >${tarea.description}</textarea>
        
        <label for="edit-task-priority" class="block text-sm font-medium text-gray-700 mb-1">Prioridad:</label>
        <select id="edit-task-priority" 
                class="w-full p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="low" ${tarea.priority === 'low' ? 'selected' : ''}>Low</option>
            <option value="medium" ${tarea.priority === 'medium' ? 'selected' : ''}>Medium</option>
            <option value="high" ${tarea.priority === 'high' ? 'selected' : ''}>High</option>
        </select>

        ${tarea.status !== 'done' ? '' : `
        <label for="edit-task-result" class="block text-sm font-medium text-gray-700 mb-1">Resultado:</label>
        <select id="edit-task-result" 
                class="w-full p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Seleccionar resultado</option>
            ${results.map(r => `<option value="${r}" ${tarea.result === r ? 'selected' : ''}>${r}</option>`).join('')}
        </select>`}`;

    mostrarModalEdit(innerHtml,
        () => {
            const subject = document.getElementById("edit-task-subject").value.trim();
            const description = document.getElementById("edit-task-description").value.trim();
            const priority = document.getElementById("edit-task-priority").value;
            const result = document.getElementById("edit-task-result") ? document.getElementById("edit-task-result").value : null;

            if (subject === "" || description === "") {
                mostrarMensaje("El asunto y la descripción no pueden estar vacíos.");
                return;
            }

            if (tarea.status === "done" && !result) {
                mostrarMensaje("Debe seleccionar un resultado para el estado 'done'.");
                return;
            }

            tarea.subject = subject;
            tarea.description = description;
            tarea.priority = priority;

            tarea.result = tarea.status === "done" ? result : null;

            tarea.editedBy = { name: currentUser.name, email: currentUser.email };
            tarea.editedAt = new Date().toISOString();

            const modal = document.getElementById("asign-edit-modal");
            modal.style.display = "none";

            guardarDatos();
            mostrarPantalla();
            enableDragAndDrop();
            showTaskInfo(tarea.id);
            mostrarMensaje("Tarea editada exitosamente.", 2000, true);

            editar = null;
        },
        () => {
            const modal = document.getElementById("asign-edit-modal");
            modal.style.display = "none";
            editar = null;
        }
    );
}
function deleteTask(id) {
    mostrarModalEdit("<p>¿Está seguro de eliminar esta tarea?</p>", () => {
        taskList = taskList.filter(t => t.id !== id);
        guardarDatos();
        mostrarPantalla();
        mostrarMensaje("Tarea eliminada.", 2000, true);
        console.log("Tarea eliminada.");
        const modal = document.getElementById("asign-edit-modal");
        modal.style.display = "none";
        hideTaskInfoModal();
    }, () => {
        const modal = document.getElementById("asign-edit-modal");
        modal.style.display = "none";
    });
}
function agregarTareaHTML(tarea) {

    let dateText = `Created ${formatDateContextual(tarea.createdAt)}`;

    if (tarea.completedAt) {
        dateText = `Completed at: ${tarea.completedAt}`;
    }

    return `<div class="${tarea.priority.toLowerCase()} task-card card p-2 mb-2" draggable = "true" onclick = "showTaskInfo(${tarea.id})" data-id="${tarea.id}" >
        <h4 class ="card-title">${tarea.subject}</h4>
        <p class = "card-body">${tarea.description}</p>
        <p class= "card-text">${dateText}</p>
        
    </div > `;
}
function pintarNavbar() {
    const navbar = document.getElementById("navbar");
    navbar.innerHTML = `
        <div class="text-2xl font-bold tracking-wider">
            ISSUE TRACKER
        </div>
        
        <div id="user-info" class="flex items-center space-x-4">
            <button id="report-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-150 ease-in-out text-sm" onclick="mostrarSelectorFechasInforme()">
                📊 Generar Informe
            </button>
            
            <span class="text-white font-medium text-base">
                ${currentUser ? currentUser.name : "Invitado"}
            </span>
            
            <button id="logout-btn" class="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition duration-150 ease-in-out text-sm" onclick="logout()">
                Logout
            </button>
        </div>`;
}
function pintarTareas() {

    let tasksToDisplay = [...taskList];

    if (currentFilter.key && currentFilter.value) {
        tasksToDisplay = tasksToDisplay.filter(tarea => {
            const key = currentFilter.key;
            const value = currentFilter.value;

            if (key === 'priority') {
                return tarea.priority === value;
            } else if (key === 'assignedTo') {
                return tarea.assignedTo && tarea.assignedTo.email === value;
            } else if (key === 'createdBy') {
                return tarea.createdBy.email === value;
            }
            return false;
        });
    }

    statuses.forEach(status => {
        const columna = document.getElementById(status);
        if (columna) columna.innerHTML = "";
    });

    tasksToDisplay.forEach(tarea => {
        const columna = document.getElementById(tarea.status);
        if (columna) columna.innerHTML += agregarTareaHTML(tarea);
    });

    guardarDatos();
    enableDragAndDrop();
}

// usuarios
function agregarUsuario(name, email, password) {
    const usuario = { id: genID++, name, email, password, active: true };
    userList.push(usuario);
    limpiarForm([loginEmailInput, loginPasswordInput]);
    guardarDatos();
}
function cargarUsuario(id) {
    const usuario = userList.find(u => u.id === id);
    if (usuario) {
        loginPasswordInput.value = usuario.name;
        loginEmailInput.value = usuario.email;
        mostrarForm(userForm);
    }
}
function editarUsuario(id) {
    const usuario = userList.find(u => u.id === id);
    editar = usuario;
    const innerHtml = `
        <h2 class="text-xl font-bold mb-4 text-gray-800">Edit User</h2>
        
        <label for="edit-user-name" class="block text-sm font-medium text-gray-700 mb-1">Name:</label>
        <input type="text" id="edit-user-name" 
               class="w-full p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500" 
               value="${usuario.name}" />
        
        <label for="edit-user-email" class="block text-sm font-medium text-gray-700 mb-1">Email:</label>
        <input type="email" id="edit-user-email" 
               class="w-full p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500" 
               value="${usuario.email}" />
        
        <label for="edit-user-password" class="block text-sm font-medium text-gray-700 mb-1">Password:</label>
        <input type="password" id="edit-user-password" 
               class="w-full p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500" 
               value="${usuario.password}" />
    `;

    mostrarModalEdit(innerHtml, () => {
        const modal = document.getElementById("asign-edit-modal");
        const nameInput = document.getElementById("edit-user-name");
        const emailInput = document.getElementById("edit-user-email");
        const passwordInput = document.getElementById("edit-user-password");

        if (nameInput.value.trim() === "") {
            mostrarMensaje("El nombre no puede estar vacío.");
            return;
        }

        if (emailInput.value.trim() === "" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
            mostrarMensaje("Ingrese un correo electrónico válido.");
            return;
        }
        if (userList.find(u => u.email === emailInput.value.trim() && u.id != editar.id && u.active == false)) {
            u = userList.find(u => u.email === emailInput.value.trim());
            u.email = "";
        }
        if (userList.find(u => u.email === emailInput.value.trim() && u.id != editar.id)) {
            mostrarMensaje("El correo electrónico ya está en uso por otro usuario.");
            return;
        }

        if (passwordInput.value.trim() === "") {
            mostrarMensaje("La contraseña no puede estar vacía.");
            return;
        }
        editar.name = nameInput.value.trim();
        editar.email = emailInput.value.trim();
        editar.password = passwordInput.value.trim();
        currentUser = editar;
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        guardarDatos();
        mostrarPantalla();
        enableDragAndDrop();
        mostrarMensaje("Usuario editado exitosamente.", 2000, true);
        modal.style.display = "none";
    }, () => {
        const modal = document.getElementById("asign-edit-modal");
        modal.style.display = "none";
    });
}

function eliminarUsuario(id) {
    const usuario = userList.find(u => u.id === id);
    const modal = document.getElementById("asign-edit-modal");
    editar = usuario;
    const innerHtml = `
    <h2 class="text-2xl font-bold mb-4 text-red-500">⚠️ Eliminar cuenta </h2>
    <p class="text-lg text-gray-700 mb-6">¿Estás seguro que quieres eliminar la cuenta: 
        <strong class="font-extrabold">"${usuario.name}"</strong>?
    </p>
`;
    mostrarModalEdit(innerHtml, () => {
        const usuario = userList.find(u => u.id === editar.id);
        usuario.active = false;
        guardarDatos();
        mostrarMensaje("Usuario eliminado", 2000, true);
        currentUser = null;
        localStorage.removeItem("currentUser");
        contentDiv.style.display = "none";
        loginDiv.style.display = "block";
        modal.style.display = "none";
        hideTaskInfoModal();

    }, () => {
        modal.style.display = "none";
        editar = null;
    });
}
function pintarUsuarios() {
    userTableBody.innerHTML = "";
    userList.forEach(u => {
        const row = document.createElement("tr");
        row.innerHTML = `
        <td>
        ${u.active ? u.name : `<span class="inactive text-decoration-line-through">${u.name}</span>`} 
        ${u.email == currentUser.email ? "(You) <button id=\"edit-user\" onclick=\"editarUsuario(" + u.id + ")\">✏️</button> <button id=\"delete-user\" onclick=\"eliminarUsuario(" + u.id + ")\">🗑️</button>" : (`${u.email}`)}
        </td>`;
        userTableBody.appendChild(row);
    });
}

function asignarUsuario(tarea, onConfirm, onCancel) {
    displayModal = document.getElementById("asign-edit-modal");
    editar = tarea;
    mostrarModalEdit(`
        <h2> Asignar Usuario</h2> 
        <label>Quiere asignarse la tarea?</label>`,
        () => {
            editar.assignedTo = { id: currentUser.id, name: currentUser.name, email: currentUser.email };
            editar.status = "in-progress";
            guardarDatos();
            pintarTareas();
            enableDragAndDrop();
            if (typeof onConfirm === "function") {
                onConfirm();
                displayModal.style.display = "none";
            }

        }, () => {
            if (typeof onCancel === "function") {
                onCancel();
                displayModal.style.display = "none";
            }

        });
}
function inicializarFiltros() {
    filterTasksDiv.innerHTML = `
        <div class="flex items-center space-x-3"> 
            
            <label for="filter-by" class="mr-3 font-semibold text-gray-700">Filtrar por:</label>
            
            <select id="filter-by" class="w-40 border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150">
                <option value="">-- Sin Filtro --</option>
                <option value="priority">Prioridad</option>
                <option value="assignedTo">Asignado a</option>
                <option value="createdBy">Creado por</option>
            </select>
            
            <div id="filter-value-container" class="w-40" style="display: none;">
                <select id="filter-value" class="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150"></select>
            </div>
            
        </div>
    `;

    document.getElementById("filter-by").addEventListener("change", manejarFiltroPrincipal);
}

function manejarFiltroPrincipal(e) {
    const filterKey = e.target.value;
    const valueContainer = document.getElementById("filter-value-container");

    currentFilter.key = null;
    currentFilter.value = null;

    if (filterKey === "") {
        valueContainer.style.display = "none";
        document.getElementById("filter-value").innerHTML = '';
        pintarTareas();
        return;
    }

    valueContainer.style.display = "block";
    llenarFiltroSecundario(filterKey);
}

function llenarFiltroSecundario(key) {
    const filterValueSelect = document.getElementById("filter-value");
    filterValueSelect.innerHTML = '<option value="">-- Seleccione Valor --</option>';

    let options = [];

    if (key === 'priority') {
        options = ["low", "medium", "high"];
        options.forEach(opt => {
            filterValueSelect.innerHTML += `<option value="${opt}">${opt.charAt(0).toUpperCase() + opt.slice(1)}</option>`;
        });
    } else if (key === 'assignedTo' || key === 'createdBy') {
        const uniqueUsers = userList.filter(u => u.active).map(u => ({ email: u.email, name: u.name }));
        uniqueUsers.forEach(u => {
            filterValueSelect.innerHTML += `<option value="${u.email}">${u.name} (${u.email})</option>`;
        });
    }

    filterValueSelect.removeEventListener("change", manejarFiltroSecundario);
    filterValueSelect.addEventListener("change", manejarFiltroSecundario);
}

function manejarFiltroSecundario(e) {
    const key = document.getElementById("filter-by").value;
    const value = e.target.value;

    if (value === "") {
        currentFilter.key = null;
        currentFilter.value = null;
    } else {
        currentFilter.key = key;
        currentFilter.value = value;
    }

    pintarTareas();
}

let reportData = null;

function mostrarSelectorFechasInforme() {
    const innerHtml = `
        <h2 class="text-xl font-bold mb-4 text-gray-800">Seleccionar Rango de Fechas</h2>
        
        <label for="start-date" class="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio:</label>
        <input type="date" id="start-date" 
               class="w-full p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500" /><br/>
        
        <label for="end-date" class="block text-sm font-medium text-gray-700 mb-1">Fecha de Fin:</label>
        <input type="date" id="end-date" 
               class="w-full p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500" /><br/>
    `;

    mostrarModalEdit(innerHtml,
        () => {
            const startDateStr = document.getElementById("start-date").value;
            const endDateStr = document.getElementById("end-date").value;

            if (!endDateStr) {
                mostrarMensaje("Debe seleccionar una fecha de fin.", 2000, false);
                return;
            }
            generarInforme(startDateStr, endDateStr);

        },
        () => {
            const modal = document.getElementById("asign-edit-modal");
            modal.style.display = "none";
        }
    );
}


function generarInforme(startDateStr, endDateStr) {
    const modalDiv = document.getElementById("report-content");
    const start = startDateStr ? new Date(startDateStr) : null;
    const end = new Date(endDateStr);

    end.setDate(end.getDate() + 1);
    const completedTasks = taskList.filter(tarea => {

        if (tarea.status !== 'done') {
            return false;
        }

        const completedDate = new Date(tarea.completedAt);

        if (isNaN(completedDate)) {
            console.error("Fecha de completado inválida para la tarea:", tarea.id);
            return false;
        }

        const isAfterStart = !start || completedDate >= start;
        const isBeforeEnd = completedDate <= end;

        return isAfterStart && isBeforeEnd;
    });

    let reportHtml = `
        <h2 class="text-2xl font-bold mb-3 text-gray-800">📊 Informe de Tareas Completadas</h2>
        <p class="text-sm text-gray-600">Rango: 
            <strong>${startDateStr || 'Desde el Inicio'}</strong> hasta 
            <strong>${endDateStr}</strong>
        </p>
        <hr class="my-4 border-gray-200">
        
        <h4 class="text-lg font-semibold mb-3 text-gray-700">Total de Tareas Completadas: ${completedTasks.length}</h4>
        
        ${completedTasks.length === 0
            // Usamos clases de Tailwind para el mensaje 'text-muted'
            ? '<p class="text-gray-500 italic">No se encontraron tareas completadas en este rango.</p>'

            // Estilos de tabla con Tailwind
            : `<div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asunto</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridad</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsable</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completado en</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resultado</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${completedTasks.map(t => `
                            <tr>
                                <td class="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">${t.id}</td>
                                <td class="px-4 py-2 text-sm text-gray-700 max-w-xs truncate">${t.subject}</td>
                                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-700">${t.priority}</td>
                                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-700">${t.assignedTo ? t.assignedTo.name : 'N/A'}</td>
                                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-700">${t.completedAt}</td>
                                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-700">${t.result || 'N/A'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>`
        }
        <button id="close-report-btn" class="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg mt-4 transition duration-150">Cerrar</button>
    `;


    modalDiv.innerHTML = reportHtml;
    const modal = document.getElementById("report-modal");


    document.getElementById("close-report-btn").addEventListener('click', () => {
        const modal = document.getElementById("report-modal");
        modal.style.display = "none";

    });
    modal.style.display = "block";
    modalEdit = document.getElementById("asign-edit-modal");
    modalEdit.style.display = "none";
}


// eventos de login
loginBtn.addEventListener("click", e => {
    e.preventDefault();
    if (loginEmailInput.value && loginPasswordInput.value) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmailInput.value)) {
            mostrarMensaje("Ingrese un correo electrónico válido.");
            return;
        }
        if (!userList.some(u => u.email === loginEmailInput.value.trim())) {
            mostrarModalLogin("Usuario no encontrado, Deseas crear una cuenta?", () => {

                const email = loginEmailInput.value.trim();
                const password = loginPasswordInput.value.trim();

                agregarUsuario(email.split("@")[0], email, password);
                currentUser = userList.find(u => u.email === email);
                localStorage.setItem("currentUser", JSON.stringify(currentUser));

                cargarDatos();
                mostrarPantalla();
                enableDragAndDrop();

            }, () => { });

            return;
        }
        if (userList.find(u => u.email === loginEmailInput.value.trim() && u.active == false)) {
            let u = userList.find(u => u.email === loginEmailInput.value.trim())
            u.email = "";
            mostrarModalLogin("Usuario no encontrado, Deseas crear una cuenta?", () => {

                const email = loginEmailInput.value.trim();
                const password = loginPasswordInput.value.trim();

                agregarUsuario(email.split("@")[0], email, password);
                currentUser = userList.find(u => u.email === email);
                localStorage.setItem("currentUser", JSON.stringify(currentUser));

                cargarDatos();
                mostrarPantalla();
                enableDragAndDrop();

            }, () => { });

            return;

        }

        if (userList.find(u => u.email === loginEmailInput.value).email && loginPasswordInput.value !== userList.find(u => u.email === loginEmailInput.value).password) {
            mostrarMensaje("Contraseña incorrecta.");
            limpiarForm([loginPasswordInput]);
            return;
        }
        currentUser = userList.find(u => u.email === loginEmailInput.value);
        if (currentUser.active === false) { currentUser.active = true; }
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        mostrarMensaje("Inicio de sesión exitoso.", 2000, true);
        cargarDatos();
        mostrarPantalla();
        enableDragAndDrop();
    } else {
        mostrarMensaje("Debe completar todos los campos para iniciar sesión");
    }
});

// Drag & Drop
function enableDragAndDrop() {
    const taskCards = document.querySelectorAll(".task-card");
    const dropzones = document.querySelectorAll(".dropzone");

    taskCards.forEach(card => {
        card.setAttribute("draggable", "true");
        card.removeEventListener("dragstart", dragStartHandler);
        card.addEventListener("dragstart", dragStartHandler);
    });

    dropzones.forEach(zone => {
        zone.removeEventListener("dragover", dragOverHandler);
        zone.addEventListener("dragover", dragOverHandler);
        zone.removeEventListener("drop", dropHandler);
        zone.addEventListener("drop", dropHandler);
    });

    function dragStartHandler(e) {
        e.dataTransfer.setData("text/plain", e.target.dataset.id);
    }
    function dragOverHandler(e) {
        e.preventDefault();
    }
    function dropHandler(e) {
        e.preventDefault();
        const taskId = parseInt(e.dataTransfer.getData("text/plain"));
        const tarea = taskList.find(t => t.id === taskId);
        editar = tarea;
        if (!tarea) return;

        const fromStatus = tarea.status;
        const toStatus = e.currentTarget.id;

        if (fromStatus === "created" && toStatus === "done") {
            mostrarMensaje("No se puede mover directamente de created a DONE");
            return;
        }

        if (fromStatus === "done" && toStatus !== "done") {
            mostrarMensaje("No se puede mover una tarea completada.");
            return;
        }
        if (toStatus === "in-progress" && fromStatus !== "in-progress") { }
        if (fromStatus === toStatus) {
            return;
        }

        function finalizarMovimiento() {
            if (toStatus === "done") {
                if (!tarea.assignedTo) { mostrarMensaje("Debe asignar un usuario antes de completar."); return; }
                tarea.completedAt = new Date().toISOString().split('T')[0];
            }
            if (toStatus === "created") {
                let modal = document.getElementById("asign-edit-modal");

                mostrarModalEdit(`<p> Seguro que quiere desasignar la tarea ?</p>`
                    , () => {
                        editar.assignedTo = null;
                        editar.completedAt = null
                        modal.style.display = "none";
                        editar.status = toStatus;
                        editar = null;
                        pintarTareas();

                    }
                    , () => {
                        modal.style.display = "none";
                        editar = null;
                    });

                return;

            }
            tarea.status = toStatus;
            pintarTareas();
        }

        if (toStatus === "in-progress" && !tarea.assignedTo) {
            asignarUsuario(tarea, finalizarMovimiento, () => { });
        } else finalizarMovimiento();
    }
}

function formatDateContextual(isoDateString) {
    if (!isoDateString) return '';

    const date = new Date(isoDateString);
    const now = new Date();

    const isToday = date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

    if (isToday) {
        return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    } else {
        return date.toLocaleDateString();
    }
}

// botones cancelar
cancelButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        limpiarForm([taskNameInput, taskDescInput]);
        limpiarForm([userNameInput, loginEmailInput]);
        editar = null;
        mostrarPantalla();
    });
});


submitTaskBtn.addEventListener("click", e => {
    e.preventDefault();
    if (taskNameInput.value && taskDescInput.value && taskPrioritySelect.value) {
        if (editar === null) {
            agregarTarea(taskNameInput.value, taskDescInput.value, taskPrioritySelect.value);
        } else {
            const tarea = taskList.find(t => t.id === editar);
            if (tarea) {
                tarea.subject = taskNameInput.value;
                tarea.description = taskDescInput.value;
                tarea.priority = taskPrioritySelect.value;
            }
            editar = null;
            limpiarForm([taskNameInput, taskDescInput]);
            mostrarPantalla();
        }
    } else {
        mostrarMensaje("Debe completar todos los campos para crear una tarea");
    }
    ;
});



// Inicialización

cargarDatos();

// reiniciar datos
/*
localStorage.removeItem("taskList");
localStorage.removeItem("userList");
localStorage.removeItem("contador");
localStorage.removeItem("currentUser");
*/

// login automático si hay usuario en localStorage
if (localStorage.getItem("currentUser")) {
    currentUser = JSON.parse(localStorage.getItem("currentUser"));
    mostrarPantalla();
    enableDragAndDrop();
} else {
    loginDiv.style.display = "block";
    contentDiv.style.display = "none";

}

