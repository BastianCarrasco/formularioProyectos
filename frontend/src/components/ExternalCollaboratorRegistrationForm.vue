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
    // NUEVA PROP: Lista de unidades académicas
    unidadesAcademicas: {
        type: Array,
        required: true,
    },
});

const emit = defineEmits(["register-external", "back"]);

const name = ref("");
const aPaterno = ref("");
const aMaterno = ref("");
const email = ref(props.initialEmail);
// NUEVO STATE: Para la unidad académica seleccionada por el externo
const selectedUnidadId = ref(null); // Inicialmente null, para la opción "Ninguna"

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

            <!-- NUEVO CAMPO: Selección de Unidad Académica -->
            <div class="form-group">
                <label for="external-unidad">Unidad Académica (opcional):</label>
                <select id="external-unidad" v-model="selectedUnidadId" class="select-input">
                    <!-- Opción para indicar que no pertenece a ninguna unidad -->
                    <option :value="null">Si no pertenece a ninguna, deje en blanco</option>
                    <option v-for="unidad in unidadesAcademicas" :key="unidad.id_unidad" :value="unidad.id_unidad">
                        {{ unidad.nombre }}
                    </option>
                </select>
            </div>

            <p v-if="errorMessage" class="error-message">
                {{ errorMessage }}
            </p>

            <div class="form-actions">
                <button @click="goBack" class="secondary-btn back-btn">Volver</button>
                <button @click="register" :disabled="isSubmitting" class="verify-btn primary-btn">
                    <span v-if="!isSubmitting">Registrar y Acceder al Cuestionario</span>
                    <span v-else class="spinner-btn"></span>
                </button>
            </div>
        </div>
    </transition>
</template>

<style scoped>
/* Tus estilos existentes aquí. Asegúrate de que .select-input también esté definido. */
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
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
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
</style>