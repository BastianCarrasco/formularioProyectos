<script setup>
import { ref } from "vue";

const props = defineProps({
    initialEmail: {
        type: String,
        default: "",
    },
    unidadesAcademicas: {
        type: Array,
        required: true,
    },
    errorMessage: {
        type: String,
        default: null,
    },
    isSubmitting: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(["register-internal", "back"]);

const name = ref("");
const aPaterno = ref("");
const aMaterno = ref("");
const email = ref(props.initialEmail);
const selectedUnidad = ref(""); // Use an empty string for initial disabled option

const register = () => {
    emit("register-internal", {
        name: name.value,
        aPaterno: aPaterno.value,
        aMaterno: aMaterno.value,
        email: email.value,
        id_unidad: selectedUnidad.value,
    });
};

const goBack = () => {
    emit("back");
};
</script>

<template>
    <transition name="fade">
        <div class="email-registration-form card">
            <h3>Registro de Académico Interno</h3>
            <p>
                Su email no fue encontrado. Por favor, complete sus datos como académico.
            </p>
            <div class="form-group">
                <label for="internal-name">Nombre:</label>
                <input type="text" id="internal-name" v-model="name" required class="text-input" />
            </div>
            <div class="form-group">
                <label for="internal-apaterno">Apellido Paterno:</label>
                <input type="text" id="internal-apaterno" v-model="aPaterno" required class="text-input" />
            </div>
            <div class="form-group">
                <label for="internal-amaterno">Apellido Materno:</label>
                <input type="text" id="internal-amaterno" v-model="aMaterno" class="text-input" />
            </div>
            <div class="form-group">
                <label for="email-internal-reg">Correo Electrónico:</label>
                <input type="email" id="email-internal-reg" v-model="email" required class="text-input" />
            </div>
            <div class="form-group">
                <label for="unidadAcademicaReg">Unidad Académica:</label>
                <select id="unidadAcademicaReg" v-model="selectedUnidad" class="select-input" required>
                    <option value="" disabled>Seleccione su unidad</option>
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
                    <span v-if="!isSubmitting">Registrar y Volver al Inicio</span>
                    <span v-else class="spinner-btn"></span>
                </button>
            </div>
        </div>
    </transition>
</template>