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
const selectedUnidadId = ref(null); // ID de la unidad seleccionada (puede ser null para "Ninguna" o "Otra")

// NUEVOS ESTADOS PARA LA FUNCIONALIDAD DE AÑADIR UNIDAD
const showNewUnidadInput = ref(false); // Controla la visibilidad del input de nueva unidad
const newUnidadName = ref(""); // Almacena el nombre de la nueva unidad a crear

// Función para registrar al colaborador externo
const register = () => {
    emit("register-external", {
        name: name.value,
        aPaterno: aPaterno.value,
        aMaterno: aMaterno.value,
        email: email.value,
        id_unidad: selectedUnidadId.value, // Incluimos la unidad seleccionada (puede ser null)
    });
};

const goBack = () => {
    emit("back");
};

// NUEVA FUNCIÓN: Maneja el cambio en el selector de unidad académica
const handleUnidadChange = () => {
    // Si se selecciona la opción "otra", muestra el input
    showNewUnidadInput.value = selectedUnidadId.value === "other";
    // Si se vuelve a seleccionar una unidad existente o "ninguna", limpia el input de nueva unidad
    if (selectedUnidadId.value !== "other") {
        newUnidadName.value = "";
    }
};

// NUEVA FUNCIÓN: Llama al emit para añadir la nueva unidad
const addNewUnidad = () => {
    if (newUnidadName.value.trim() && !props.isAddingNewUnidad) {
        emit("add-new-unidad", newUnidadName.value.trim());
    }
};
</script>

<template>
    <transition name="fade">
        <div class="email-registration-form card">
            <h3>Registro de Colaborador Externo</h3>
            <p>
                Por favor, complete la siguiente información para registrarse como
                colaborador externo y acceder al cuestionario.
            </p>
            <div class="form-group">
                <label for="external-name">Nombre:</label>
                <input type="text" id="external-name" v-model="name" required class="text-input" />
            </div>
            <div class="form-group">
                <label for="external-apaterno">Apellido Paterno:</label>
                <input type="text" id="external-apaterno" v-model="aPaterno" required class="text-input" />
            </div>
            <div class="form-group">
                <label for="external-amaterno">Apellido Materno:</label>
                <input type="text" id="external-amaterno" v-model="aMaterno" class="text-input" />
            </div>
            <div class="form-group">
                <label for="email-external">Correo Electrónico:</label>
                <input type="email" id="email-external" v-model="email" required class="text-input" />
            </div>

            <!-- CAMPO MODIFICADO: Selección de Unidad Académica -->
            <div class="form-group">
                <label for="external-unidad">Unidad Académica (opcional):</label>
                <select id="external-unidad" v-model="selectedUnidadId" @change="handleUnidadChange"
                    class="select-input">
                    <!-- Opción para indicar que no pertenece a ninguna unidad -->
                    <option :value="null">Ninguna / No pertenece a una unidad</option>
                    <option v-for="unidad in unidadesAcademicas" :key="unidad.id_unidad" :value="unidad.id_unidad">
                        {{ unidad.nombre }}
                    </option>
                    <!-- Opción para indicar que la unidad no está en la lista -->
                    <option value="other">Mi unidad no está en la lista</option>
                </select>
            </div>

            <!-- NUEVO CAMPO: Input para nueva unidad académica, mostrado condicionalmente -->
            <transition name="fade">
                <div class="form-group" v-if="showNewUnidadInput">
                    <label for="new-unidad-name">Nombre de la Nueva Unidad Académica:</label>
                    <div class="input-with-button">
                        <input type="text" id="new-unidad-name" v-model="newUnidadName"
                            placeholder="Ej. Facultad de Ciencias de la Computación" class="text-input" />
                        <button @click="addNewUnidad" :disabled="!newUnidadName.trim() || isAddingNewUnidad"
                            class="add-unidad-btn primary-btn small-btn">
                            <span v-if="!isAddingNewUnidad">Añadir</span>
                            <span v-else class="spinner-btn small-spinner"></span>
                        </button>
                    </div>
                    <p class="info-message" v-if="isAddingNewUnidad">Añadiendo unidad, por favor espere...</p>
                </div>
            </transition>


            <p v-if="errorMessage" class="error-message">
                {{ errorMessage }}
            </p>

            <div class="form-actions">
                <button @click="goBack" class="secondary-btn back-btn">Volver</button>
                <button @click="register" :disabled="isSubmitting || (showNewUnidadInput && !selectedUnidadId)"
                    class="verify-btn primary-btn">
                    <span v-if="!isSubmitting">Registrar y Acceder al Cuestionario</span>
                    <span v-else class="spinner-btn"></span>
                </button>
            </div>
        </div>
    </transition>
</template>

<style scoped>
/* Tus estilos existentes aquí */
.email-registration-form {
    padding: 2.5rem;
    background-color: #f8f9fa;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    text-align: center;
    max-width: 500px;
    margin: 2rem auto;
    animation: fadeIn 0.6s ease-out;
}

h3 {
    color: #2c3e50;
    margin-bottom: 1.5rem;
    font-size: 1.8em;
    font-weight: 700;
}

p {
    color: #555;
    margin-bottom: 2rem;
    line-height: 1.6;
    font-size: 1.05em;
}

.form-group {
    margin-bottom: 1.5rem;
    text-align: left;
}

.form-group label {
    display: block;
    margin-bottom: 0.8rem;
    font-weight: 600;
    color: #34495e;
    font-size: 1.05em;
}

.text-input,
.select-input {
    width: 100%;
    padding: 12px 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1em;
    color: #555;
    transition: all 0.3s ease;
    box-sizing: border-box;
}

.text-input:focus,
.select-input:focus {
    border-color: #2196f3;
    box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.2);
    outline: none;
}

.error-message {
    color: #d32f2f;
    background-color: #ffebee;
    border: 1px solid #ef9a9a;
    padding: 0.8em 1.2em;
    border-radius: 8px;
    margin-top: 1rem;
    font-size: 0.9em;
    text-align: left;
}

.form-actions {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 2rem;
}

.primary-btn,
.secondary-btn {
    padding: 12px 25px;
    border: none;
    border-radius: 8px;
    font-size: 1.1em;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
}

.primary-btn {
    background-color: #28a745;
    color: white;
}

.primary-btn:hover:not(:disabled) {
    background-color: #218838;
    transform: translateY(-2px);
}

.primary-btn:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
}

.secondary-btn {
    background-color: #6c757d;
    color: white;
}

.secondary-btn:hover:not(:disabled) {
    background-color: #5a6268;
    transform: translateY(-2px);
}

.spinner-btn {
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top: 3px solid #fff;
    width: 20px;
    height: 20px;
    -webkit-animation: spin 1s linear infinite;
    /* Safari */
    animation: spin 1s linear infinite;
    display: inline-block;
}

/* Safari */
@-webkit-keyframes spin {
    0% {
        -webkit-transform: rotate(0deg);
    }

    100% {
        -webkit-transform: rotate(360deg);
    }
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

/* Animaciones de transición */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease, transform 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}


/* --- NUEVOS ESTILOS PARA EL CAMPO DE AÑADIR UNIDAD --- */
.input-with-button {
    display: flex;
    gap: 10px;
    align-items: center;
}

.input-with-button .text-input {
    flex-grow: 1;
}

.add-unidad-btn {
    flex-shrink: 0;
    /* Evita que el botón se encoja */
    white-space: nowrap;
    /* Evita que el texto del botón se rompa */
}

.small-btn {
    padding: 8px 15px;
    font-size: 0.9em;
}

.info-message {
    font-size: 0.85em;
    color: #666;
    margin-top: 0.5rem;
    text-align: center;
}

.small-spinner {
    width: 16px;
    height: 16px;
    border-width: 2px;
}
</style>