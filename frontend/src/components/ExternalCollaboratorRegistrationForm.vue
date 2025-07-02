<script setup>
import { ref } from "vue";

const props = defineProps({
    initialEmail: {
        type: String,
        default: "",
    },
    errorMessage: {
        type: String,
        default: null,
    },
    isSubmitting: {
        type: Boolean,
        default: false,
    },
    // Prop para la lista de unidades académicas existentes
    unidadesAcademicas: {
        type: Array,
        required: true,
    },
    // Nueva prop: para indicar si estamos esperando la creación de una nueva unidad
    isAddingNewUnidad: {
        type: Boolean,
        default: false,
    },
});

// Emits existentes
const emit = defineEmits(["register-external", "back", "add-new-unidad"]);

const name = ref("");
const aPaterno = ref("");
const aMaterno = ref("");
const email = ref(props.initialEmail);
// selectedUnidadId ahora solo contendrá IDs de unidades existentes o null
const selectedUnidadId = ref(null);

// NUEVOS ESTADOS PARA LA FUNCIONALIDAD DE AÑADIR UNIDAD
const showNewUnidadInput = ref(false); // Controla la visibilidad del input de nueva unidad
const newUnidadName = ref(""); // Almacena el nombre de la nueva unidad a crear

// Función para registrar al colaborador externo
const register = () => {
    // Basic validation for required fields
    if (!name.value.trim() || !aPaterno.value.trim() || !email.value.trim()) {
        emit("register-external", {
            name: name.value,
            aPaterno: aPaterno.value,
            aMaterno: aMaterno.value,
            email: email.value,
            id_unidad: selectedUnidadId.value,
            validationError: "Por favor, complete al menos Nombre, Apellido Paterno y Correo Electrónico.",
        });
        return;
    }

    // Si el input de nueva unidad está visible y no se ha añadido, o está en proceso de añadir
    if (showNewUnidadInput.value && (!newUnidadName.value.trim() || props.isAddingNewUnidad)) {
        emit("register-external", {
            name: name.value,
            aPaterno: aPaterno.value,
            aMaterno: aMaterno.value,
            email: email.value,
            id_unidad: selectedUnidadId.value,
            validationError: "Por favor, añada el nombre de la nueva unidad académica antes de registrarse.",
        });
        return;
    }


    emit("register-external", {
        name: name.value,
        aPaterno: aPaterno.value,
        aMaterno: aMaterno.value,
        email: email.value,
        id_unidad: selectedUnidadId.value,
    });
};

const goBack = () => {
    emit("back");
};

// Función para llamar al emit para añadir la nueva unidad
const addNewUnidad = () => {
    if (newUnidadName.value.trim() && !props.isAddingNewUnidad) {
        emit("add-new-unidad", newUnidadName.value.trim());
        // Después de emitir, la lógica de App.vue se encargará de actualizar unidadesAcademicas
        // y podrías querer resetear showNewUnidadInput o newUnidadName aquí si es apropiado
        // showNewUnidadInput.value = false; // Opcional: ocultar el input después de añadir
        // newUnidadName.value = ""; // Opcional: limpiar el input
    }
};

// CAMBIO: Toggle para mostrar/ocultar el input de nueva unidad
const toggleNewUnidadInput = () => {
    showNewUnidadInput.value = !showNewUnidadInput.value;
    if (!showNewUnidadInput.value) {
        newUnidadName.value = ""; // Limpiar el input si se oculta
    }
};
</script>

<template>
    <transition name="fade">
        <div class="external-registration-form card">
            <h2 class="form-title">Registro de Colaborador Externo</h2>
            <p class="form-description">
                Para completar su registro, por favor, primero seleccione su Unidad
                Académica o añada una nueva si no la encuentra. Luego, complete sus datos
                personales.
            </p>

            <div class="form-columns-container">
                <!-- Columna Izquierda: Información de Unidad (AHORA ESTÁ PRIMERO) -->
                <div class="form-column form-column-left">
                    <h3>Paso 1: Información de Unidad</h3>
                    <!-- CAMPO SELECCIÓN DE UNIDAD ACADÉMICA -->
                    <div class="form-group">
                        <label for="external-unidad" class="input-label">Unidad Académica (opcional):</label>
                        <select id="external-unidad" v-model="selectedUnidadId" class="select-input">
                            <option :value="null">Ninguna / No pertenece a una unidad</option>
                            <option v-for="unidad in unidadesAcademicas" :key="unidad.id_unidad"
                                :value="unidad.id_unidad">
                                {{ unidad.nombre }}
                            </option>
                        </select>
                    </div>

                    <!-- BOTÓN PARA MOSTRAR/OCULTAR EL CAMPO DE NUEVA UNIDAD -->
                    <div class="form-group new-unidad-toggle-group">
                        <button @click="toggleNewUnidadInput" type="button" class="toggle-new-unidad-btn secondary-btn">
                            <span v-if="!showNewUnidadInput">Añadir Nueva Unidad</span>
                            <span v-else>Ocultar Campo de Unidad</span>
                        </button>
                    </div>

                    <!-- CAMPO NUEVA UNIDAD ACADÉMICA (CONDICIONAL E INDEPENDIENTE) -->
                    <transition name="fade-in-out">
                        <div class="form-group" v-if="showNewUnidadInput">
                            <label for="new-unidad-name" class="input-label required-label">Nombre de la Nueva Unidad
                                Académica:</label>
                            <div class="input-with-button">
                                <input type="text" id="new-unidad-name" v-model="newUnidadName"
                                    placeholder="Ej. Facultad de Ciencias de la Computación" class="text-input" />
                                <button @click="addNewUnidad" :disabled="!newUnidadName.trim() || isAddingNewUnidad"
                                    class="add-unidad-btn primary-btn small-btn">
                                    <span v-if="!isAddingNewUnidad" class="button-content">Añadir</span>
                                    <span v-else class="spinner-btn small-spinner button-content"></span>
                                </button>
                            </div>
                            <p class="info-message" v-if="isAddingNewUnidad">Añadiendo unidad, por favor espere...</p>
                        </div>
                    </transition>
                </div>

                <!-- Columna Derecha: Datos Personales (AHORA ESTÁ SEGUNDO) -->
                <div class="form-column form-column-right">
                    <h3>Paso 2: Datos Personales</h3>
                    <div class="form-group">
                        <label for="external-name" class="input-label required-label">Nombre:</label>
                        <input type="text" id="external-name" v-model="name" required class="text-input" />
                    </div>
                    <div class="form-group">
                        <label for="external-apaterno" class="input-label required-label">Apellido Paterno:</label>
                        <input type="text" id="external-apaterno" v-model="aPaterno" required class="text-input" />
                    </div>
                    <div class="form-group">
                        <label for="external-amaterno" class="input-label">Apellido Materno:</label>
                        <input type="text" id="external-amaterno" v-model="aMaterno" class="text-input" />
                    </div>
                    <div class="form-group">
                        <label for="email-external" class="input-label required-label">Correo Electrónico:</label>
                        <input type="email" id="email-external" v-model="email" required class="text-input" />
                    </div>
                </div>
            </div>
            <!-- Fin form-columns-container -->

            <p v-if="errorMessage" class="error-message">
                {{ errorMessage }}
            </p>

            <div class="form-actions-flex">
                <button @click="goBack" class="secondary-btn back-btn">
                    <span class="button-content">Volver</span>
                </button>
                <button @click="register"
                    :disabled="isSubmitting || !name.trim() || !aPaterno.trim() || !email.trim() || (showNewUnidadInput && (!newUnidadName.trim() || isAddingNewUnidad))"
                    class="primary-btn register-btn">
                    <span v-if="!isSubmitting" class="button-content">Registrar y Acceder al Cuestionario</span>
                    <span v-else class="spinner-btn button-content"></span>
                </button>
            </div>
        </div>
    </transition>
</template>

<style scoped>
/* Transición de entrada/salida para el componente principal */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* Transición para el input de "Añadir Nueva Unidad" */
.fade-in-out-enter-active,
.fade-in-out-leave-active {
    transition: all 0.4s ease-in-out;
}

.fade-in-out-enter-from,
.fade-in-out-leave-to {
    opacity: 0;
    transform: translateY(-10px);
    max-height: 0;
    padding-top: 0;
    padding-bottom: 0;
    margin-top: 0;
    margin-bottom: 0;
    overflow: hidden;
}

/* Contenedor principal del formulario (la tarjeta) */
.external-registration-form {
    background-color: #ffffff;
    padding: 0.9rem 2.5rem;
    border-radius: 12px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    max-width: 800px;
    margin: 0;
    text-align: center;
    border: 1px solid #e0e0e0;
}

/* Título del formulario */
.form-title {
    font-size: 1.8rem;
    color: #2E5C8A;
    margin-bottom: 0.8rem;
    font-weight: 700;
}

/* Descripción del formulario */
.form-description {
    font-size: 0.95rem;
    color: #555;
    margin-bottom: 1.5rem;
    line-height: 1.4;
    max-width: 650px;
    margin-left: auto;
    margin-right: auto;
}

/* Contenedor de las columnas */
.form-columns-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-bottom: 1.5rem;
    text-align: left;
}

.form-column h3 {
    font-size: 1.2rem;
    color: #2E5C8A;
    margin-bottom: 1rem;
    font-weight: 600;
    border-bottom: 1px solid #eee;
    padding-bottom: 0.5rem;
}

/* Grupo de formulario (label + input/select) */
.form-group {
    margin-bottom: 1.2rem;
    text-align: left;
}

.input-label {
    display: block;
    font-size: 0.9rem;
    color: #333;
    margin-bottom: 0.4rem;
    font-weight: 500;
}

.required-label::after {
    content: "*";
    color: #e74c3c;
    margin-left: 0.3rem;
}

/* Estilo para inputs de texto y select */
.text-input,
.select-input {
    width: 100%;
    padding: 0.7rem 0.9rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 0.95rem;
    color: #333;
    box-sizing: border-box;
    transition: all 0.3s ease;
}

.text-input:focus,
.select-input:focus {
    border-color: #2E5C8A;
    box-shadow: 0 0 0 3px rgba(46, 92, 138, 0.2);
    outline: none;
}

/* Select flecha personalizada */
.select-input {
    background-color: #fff;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13.2-6.4H18.6c-5%200-9.3%201.8-13.2%205.8-3.9%204-6.2%209.1-6.2%2014.2%200%205.4%202.3%2010.5%206.2%2014.2l127.9%20127.9c4%203.9%209.1%206.2%2014.2%206.2%205%200%2010.1-2.3%2014.2-6.2L287%2097.7A19.1%2019.1%200%200%200%20287%2069.4z%22%2F%3E%3C%2Fsvg%3E');
    background-repeat: no-repeat;
    background-position: right 0.7rem top 50%;
    background-size: 0.65em auto;
}

/* Mensaje de error general */
.error-message {
    color: #e74c3c;
    font-size: 0.8rem;
    margin-top: 0.5rem;
    text-align: left;
    background-color: #ffe6e6;
    border: 1px solid #e74c3c;
    padding: 0.6rem;
    border-radius: 8px;
    margin-bottom: 1.2rem;
}

/* Grupo de botón para mostrar/ocultar nueva unidad */
.new-unidad-toggle-group {
    text-align: center;
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
}

.toggle-new-unidad-btn {
    padding: 0 1.5rem;
    height: 40px;
    font-size: 1rem;
}

/* Contenedor de input con botón (para "Añadir Unidad") */
.input-with-button {
    display: flex;
    gap: 0.8rem;
    align-items: center;
    margin-top: 0.5rem;
}

.input-with-button .text-input {
    flex-grow: 1;
}

/* Botones generalizados */
.primary-btn,
.secondary-btn {
    padding: 0 1.5rem;
    font-size: 1rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    flex-grow: 1;
    flex-basis: 0;
    box-sizing: border-box;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
}

/* Botón primario */
.primary-btn {
    background-color: #2E5C8A;
    color: #ffffff;
    border: none;
}

.primary-btn:hover:not(:disabled) {
    background-color: #264e75;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(46, 92, 138, 0.2);
}

.primary-btn:disabled {
    background-color: #cccccc;
    color: #f0f0f0;
    cursor: not-allowed;
}

/* Botón secundario */
.secondary-btn {
    background-color: #f0f0f0;
    color: #555;
    border: 1px solid #ccc;
}

.secondary-btn:hover:not(:disabled) {
    background-color: #e0e0e0;
    color: #333;
    border-color: #bbb;
}

.secondary-btn:disabled {
    background-color: #f7f7f7;
    color: #aaa;
    cursor: not-allowed;
    border-color: #e0e0e0;
}

/* Estilos específicos para el botón "Añadir" */
.add-unidad-btn {
    flex-shrink: 0;
    white-space: nowrap;
    padding: 0 1rem;
    font-size: 0.8rem;
    height: 34px;
}

/* Mensaje de información (ej. "Añadiendo unidad...") */
.info-message {
    font-size: 0.8rem;
    color: #4a4a4a;
    background-color: #f0f8ff;
    border: 1px solid #cce0ff;
    padding: 0.5rem;
    border-radius: 8px;
    margin-top: 0.8rem;
    text-align: center;
}

/* Spinner general */
.spinner-btn {
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top: 3px solid #ffffff;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    animation: spin 1s linear infinite;
    display: inline-block;
    vertical-align: middle;
}

/* Spinner pequeño */
.small-spinner {
    width: 16px;
    height: 16px;
    border-width: 2px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

/* Contenedor de acciones (botones Volver y Registrar) */
.form-actions-flex {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 2rem;
}

/* Contenido interno del botón (texto o spinner) */
.button-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}


/* Responsive adjustments */
@media (max-width: 768px) {
    .external-registration-form {
        padding: 1.5rem;
        max-width: 95%;
    }

    .form-columns-container {
        grid-template-columns: 1fr;
        gap: 0.5rem;
    }

    .form-column h3 {
        margin-bottom: 0.8rem;
        padding-bottom: 0.3rem;
        font-size: 1.1rem;
    }

    .form-group {
        margin-bottom: 0.8rem;
    }

    .form-title {
        font-size: 1.6rem;
    }

    .form-description {
        font-size: 0.9rem;
        max-width: 100%;
        margin-bottom: 1rem;
    }

    .input-label {
        font-size: 0.85rem;
        margin-bottom: 0.3rem;
    }

    .text-input,
    .select-input {
        padding: 0.6rem 0.7rem;
        font-size: 0.85rem;
    }

    .error-message {
        font-size: 0.75rem;
        padding: 0.5rem;
        margin-bottom: 1rem;
    }

    .form-actions-flex {
        flex-direction: column;
        gap: 0.8rem;
        margin-top: 1.5rem;
    }

    .primary-btn,
    .secondary-btn {
        padding: 0.7rem 1rem;
        font-size: 0.95rem;
        height: auto;
    }

    .toggle-new-unidad-btn {
        height: 36px;
        font-size: 0.9rem;
    }

    .add-unidad-btn {
        height: 30px;
        font-size: 0.8rem;
        padding: 0 0.8rem;
    }

    .spinner-btn {
        width: 16px;
        height: 16px;
    }

    .small-spinner {
        width: 12px;
        height: 12px;
    }
}
</style>