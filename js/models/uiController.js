// Classification model and confidence threshold
// These variables can be set in the UI
let imageModelURL = 'https://teachablemachine.withgoogle.com/models/JFrhRDPNV/';
let confidenceThreshold = 0.96;

// Result dictionary definition
// This dictionary maps object labels to QLab cue numbers
// The key "Vacio" is reserved for the case when no object is detected
let resultDict = {
	"Vacio": "0",
	"Taza" : "1",
	"Guitarra": "2",
	"Saco": "3",
};

// Variable to control if it is possible to send the same Classification result via OSC
let repeatRecognition = false;

// OSC Client IP and Listening Port (manual entry, expected value: QLab Network OSC settings)
// Listeing Port set as 3333 by default
let clientIP = "127.0.0.1"; // Valor predeterminado
let clientPort = 3333;      // Valor predeterminado


////////////

// Función para alternar la visibilidad de la sección de Configuración OSC
function toggleOscSettings() {
    const content = document.getElementById('osc-content');
    const toggleButton = document.querySelector('.osc-config-toggle-button');

    if (content.style.display === 'none' || content.style.display === '') {
        content.style.display = 'block'; // Mostrar el contenido
        toggleButton.textContent = '▲'; // Cambiar el texto del botón
    } else {
        content.style.display = 'none'; // Ocultar el contenido
        toggleButton.textContent = '▼'; // Cambiar el texto del botón
    }
}

// Función para guardar la configuración OSC desde los textboxes
function saveOscSettings() {
    const ipInput = document.getElementById('ip-input').value.trim();
    const portInput = document.getElementById('port-input').value.trim();
    const modelUrlInput = document.getElementById('model-url-input').value.trim();
    const confidenceInput = document.getElementById('confidence-threshold-input').value.trim();

    // Validar la dirección IP
    if (ipInput && ipInput !== "") {
        clientIP = ipInput;
    } else {
        alert("No se ingresó una Dirección IP válida. Se usará la dirección predeterminada: 127.0.0.1");
        clientIP = "127.0.0.1"; // Dirección IP predeterminada
    }

    // Validar el puerto
    if (portInput && !isNaN(portInput) && parseInt(portInput) > 0) {
        clientPort = parseInt(portInput);
    } else {
        alert("No se ingresó un número de puerto válido. Se usará el puerto predeterminado: 3333");
        clientPort = 3333; // Puerto predeterminado
    }

    // Validar la URL del modelo
    if (modelUrlInput && modelUrlInput !== "") {
        imageModelURL = modelUrlInput;
    } else {
        alert("No se ingresó una URL válida para el modelo. Se usará la URL predeterminada.");
        imageModelURL = "https://teachablemachine.withgoogle.com/models/JFrhRDPNV/"; // URL predeterminada
    }

    // Validar el umbral de confianza
    if (confidenceInput && !isNaN(confidenceInput) && parseFloat(confidenceInput) >= 0 && parseFloat(confidenceInput) <= 1) {
        confidenceThreshold = parseFloat(confidenceInput);
    } else {
        alert("No se ingresó un valor válido para la precisión. Se usará el valor predeterminado: 0.96");
        confidenceThreshold = 0.96; // Valor predeterminado
    }

    // Reconfigurar la interfaz OSC
    setupOsc(12000, clientPort, clientIP);

    // Recargar el modelo
    preload();

    // Classifiy again!
    classifyVideo();

    // Notificar al usuario
    alert(`Configuración guardada:\nDirección IP: ${clientIP}\nPuerto: ${clientPort}\nModelo de Reconocimiento: ${imageModelURL}\nPrecisión: ${confidenceThreshold}`);
}

///////////////
// Diccionario
//////////////

/// Función para renderizar el diccionario en la interfaz
function renderDictionary() {
    const container = document.getElementById('dictionary-container');
    container.innerHTML = ''; // Limpiar el contenedor

    // Agregar encabezado
    const headerDiv = document.createElement('div');
    headerDiv.style.display = 'flex';
    headerDiv.style.alignItems = 'center';
    headerDiv.style.marginBottom = '10px';
    headerDiv.style.fontWeight = 'bold';
    headerDiv.style.color = '#00d4ff'; // Color destacado para el encabezado

    const objectHeader = document.createElement('div');
    objectHeader.textContent = 'Objeto';
    objectHeader.style.flex = '1'; // Espaciado proporcional
    objectHeader.style.textAlign = 'left';
    objectHeader.style.paddingLeft = '10px'; // Alinear con los inputs

    const numberHeader = document.createElement('div');
    numberHeader.textContent = 'QLab Cue';
    numberHeader.style.flex = '1'; // Espaciado proporcional
    numberHeader.style.textAlign = 'left';
    numberHeader.style.paddingLeft = '10px'; // Alinear con los inputs

    const buttonSpace = document.createElement('div');
    buttonSpace.style.flex = '0.5'; // Espacio proporcional para simular los botones
    buttonSpace.style.textAlign = 'right'; // Alineación a la derecha

    headerDiv.appendChild(objectHeader);
    headerDiv.appendChild(numberHeader);
    headerDiv.appendChild(buttonSpace);
    container.appendChild(headerDiv);

    // Renderizar los elementos del diccionario
    for (const [key, value] of Object.entries(resultDict)) {
        const entryDiv = document.createElement('div');
        entryDiv.style.display = 'flex';
        entryDiv.style.alignItems = 'center';
        entryDiv.style.marginBottom = '10px';

        if (key === "Vacio") {
            // Renderizar el par "Vacio": "0" como inputs read-only
            const keyInput = document.createElement('input');
            keyInput.type = 'text';
            keyInput.value = key;
            keyInput.readOnly = true; // Hacer el campo de solo lectura
            keyInput.style.marginRight = '10px';
            keyInput.style.paddingLeft = '10px'; // Alinear con el encabezado
            keyInput.style.backgroundColor = '#1a1a2e'; // Fondo consistente con el diseño
            keyInput.style.color = '#e0e0e0'; // Color del texto
            keyInput.style.border = '1px solid #00d4ff';

            const valueInput = document.createElement('input');
            valueInput.type = 'text';
            valueInput.value = value;
            valueInput.readOnly = true; // Hacer el campo de solo lectura
            valueInput.style.paddingLeft = '10px'; // Alinear con el encabezado
            valueInput.style.backgroundColor = '#1a1a2e'; // Fondo consistente con el diseño
            valueInput.style.color = '#e0e0e0'; // Color del texto
            valueInput.style.border = '1px solid #00d4ff';

            const updateButton = document.createElement('button');
            updateButton.textContent = 'Actualizar';
            updateButton.classList.add('disabled-button'); // Usar la clase personalizada
            updateButton.style.marginLeft = '10px';
        
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Eliminar';
            deleteButton.classList.add('disabled-button'); // Usar la clase personalizada
            deleteButton.style.marginLeft = '10px';

            entryDiv.appendChild(keyInput);
            entryDiv.appendChild(valueInput);
            entryDiv.appendChild(updateButton);
            entryDiv.appendChild(deleteButton);
        } else {
            // Renderizar los pares editables
            const keyInput = document.createElement('input');
            keyInput.type = 'text';
            keyInput.value = key;
            keyInput.style.marginRight = '10px';
            keyInput.style.flex = '1'; // Alinear con el encabezado
            keyInput.style.paddingLeft = '10px'; // Alinear con el encabezado

            const valueInput = document.createElement('input');
            valueInput.type = 'text';
            valueInput.value = value;
            valueInput.style.flex = '1'; // Alinear con el encabezado
            valueInput.style.paddingLeft = '10px'; // Alinear con el encabezado

            const updateButton = document.createElement('button');
            updateButton.textContent = 'Actualizar';
            updateButton.onclick = () => updateDictionaryEntry(key, keyInput.value, valueInput.value);
            updateButton.style.marginLeft = '10px';

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Eliminar';
            deleteButton.style.marginLeft = '10px';
            deleteButton.onclick = () => deleteDictionaryEntry(key);

            entryDiv.appendChild(keyInput);
            entryDiv.appendChild(valueInput);
            entryDiv.appendChild(updateButton);
            entryDiv.appendChild(deleteButton);
        }

        container.appendChild(entryDiv);
    }
}

// Función para alternar la visibilidad del Editor de Diccionario
function toggleDictionaryEditor() {
    const content = document.getElementById('dictionary-content');
    const toggleButton = document.querySelector('.dictionary-config-toggle-button');

    if (content.style.display === 'none' || content.style.display === '') {
        content.style.display = 'block'; // Mostrar el contenido
        toggleButton.textContent = '▲'; // Cambiar el texto del botón
    } else {
        content.style.display = 'none'; // Ocultar el contenido
        toggleButton.textContent = '▼'; // Cambiar el texto del botón
    }
}

// Función para actualizar un par del diccionario
function updateDictionaryEntry(oldKey, newKey, newValue) {
    if (oldKey !== newKey) {
        delete resultDict[oldKey]; // Eliminar la clave antigua
    }
    resultDict[newKey] = newValue; // Actualizar o agregar la nueva clave-valor
    renderDictionary(); // Volver a renderizar

    // Mostrar un mensaje de notificación al usuario
    alert(`La entrada del diccionario con clave "${oldKey}" ha sido actualizada a:\nClave: "${newKey}"\nValor: "${newValue}"`);
}

// Función para eliminar un par del diccionario
function deleteDictionaryEntry(key) {
    // Mostrar una advertencia al usuario
    const confirmDelete = confirm(`¿Está seguro de que desea eliminar la entrada con clave "${key}"? Esta acción no se puede deshacer.`);
    if (confirmDelete) {
        delete resultDict[key]; // Eliminar la clave
        renderDictionary(); // Volver a renderizar
        alert(`La entrada con clave "${key}" ha sido eliminada del diccionario.`);
    } 
}

// Función para agregar un nuevo par al diccionario
function addDictionaryEntry() {
    const newKey = prompt('Ingrese la nueva clave:');
    if (newKey === null) {
        // Si el usuario cancela el prompt para la clave, salir de la función
        return;
    }

    const newValue = prompt('Ingrese el nuevo valor:');
    if (newValue === null) {
        // Si el usuario cancela el prompt para el valor, salir de la función
        return;
    }

    // Si ambos valores son válidos, agregar al diccionario
    if (newKey && newValue) {
        resultDict[newKey] = newValue;
        renderDictionary(); // Volver a renderizar
        alert(`Se agregó un nuevo par al diccionario:\nClave: "${newKey}"\nValor: "${newValue}"`);
    } else {
        alert("No se ingresaron valores válidos. La operación fue cancelada.");
    }
}
// Función para cargar un diccionario desde un archivo de texto
function triggerFileInput() {
    const fileInput = document.getElementById('dictionary-file');
    fileInput.click(); // Simular clic en el input de tipo file
}
function loadDictionaryFromFile(event) {
    const file = event.target.files[0];
    if (!file) {
        alert("No se seleccionó ningún archivo.");
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const lines = e.target.result.split('\n'); // Dividir el contenido en líneas
        const newDict = {}; // Crear un nuevo diccionario temporal

        // Vaciar el diccionario global dejando solo el valor por defecto
        resultDict = { "Vacio": "0" };

        for (const line of lines) {
            const [key, value] = line.split(',').map(item => item.trim()); // Dividir por coma y limpiar espacios
            if (key && value && key !== "Vacio") { // Evitar sobrescribir el valor por defecto
                newDict[key] = value; // Agregar al nuevo diccionario
            }
        }

        // Actualizar el diccionario global con los nuevos valores
        Object.assign(resultDict, newDict);

        // Refrescar la interfaz
        renderDictionary();

        // Notificar al usuario
        alert("El diccionario se ha cargado correctamente.");
    };

    reader.onerror = () => {
        alert("Hubo un error al leer el archivo. Por favor, inténtelo de nuevo.");
    };

    reader.readAsText(file); // Leer el archivo como texto
}

// Función para exportar el diccionario a un archivo .txt
function exportDictionary() {
    // Convertir el diccionario a un formato de texto separado por comas
    let dictionaryContent = '';
    for (const [key, value] of Object.entries(resultDict)) {
        dictionaryContent += `${key},${value}\n`;
    }

    // Crear un archivo Blob con el contenido del diccionario
    const blob = new Blob([dictionaryContent], { type: 'text/plain' });

    // Crear un enlace de descarga
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'diccionario.txt'; // Nombre del archivo
    a.style.display = 'none';

    // Agregar el enlace al documento y hacer clic en él
    document.body.appendChild(a);
    a.click();

    // Eliminar el enlace del documento
    document.body.removeChild(a);
}

// Renderizar el diccionario al cargar la página
window.onload = () => {
    renderDictionary();
};

// Función para alternar el estado de repetición del reconocimiento
function toggleRepeatRecognition() {
    const toggle = document.getElementById('repeat-recognition-toggle');
    repeatRecognition = toggle.checked;
}
