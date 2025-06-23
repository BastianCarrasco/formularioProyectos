<script setup>
import { computed } from "vue";

const props = defineProps({
    preguntas: {
        type: Array,
        required: true,
    },
    initialRespuestas: {
        type: Array,
        default: () => [],
    },
    academicoInfo: {
        type: Object,
        default: null,
    },
    externalInfo: {
        type: Object,
        default: null,
    },
    unidadesAcademicas: {
        type: Array,
        required: true,
    },
    selectedUnidadId: {
        type: [Number, null], // Podría venir con un valor inicial para académicos, o null
        default: null,
    },
    isAcademico: {
        type: Boolean,
        default: null, // Indica si el usuario inició como académico o externo
    },
    submitError: {
        type: String,
        default: null,
    },
    isSubmitting: {
        type: Boolean,
        default: false,
    },
});

// AHORA el emit 'submit-questionnaire' puede recibir un argumento
// para un mensaje de error de validación si es necesario.
const emit = defineEmits(["update:respuestas", "update:selectedUnidadId", "submit-questionnaire"]);

const currentRespuestas = computed({
    get: () => props.initialRespuestas,
    set: (value) => emit("update:respuestas", value),
});

const currentSelectedUnidadId = computed({
    get: () => props.selectedUnidadId,
    set: (value) => emit("update:selectedUnidadId", value),
});

const nombreEscuelaSeleccionada = computed(() => {
    if (!currentSelectedUnidadId.value) return "";
    const unidad = props.unidadesAcademicas.find(
        (u) => u.id_unidad === currentSelectedUnidadId.value
    );
    return unidad ? unidad.nombre : "";
});

const submitForm = () => {
    // Validar que se haya seleccionado una unidad académica antes de emitir el submit
    if (currentSelectedUnidadId.value === null || currentSelectedUnidadId.value === "") {
        // Emitir el evento con el mensaje de error para que App.vue lo capture
        emit("submit-questionnaire", "Debe seleccionar la Unidad Académica asociada al proyecto.");
        return; // Detener el envío del formulario
    }
    // Si la unidad está seleccionada, emitir el evento sin mensaje de error
    emit("submit-questionnaire");
};

const updateRespuesta = (index, value) => {
    const newRespuestas = [...currentRespuestas.value];
    newRespuestas[index] = value;
    currentRespuestas.value = newRespuestas;
};
</script>

<template>
    <div class="cuestionario-container card">
        <div class="header-section">
            <h2>Cuestionario de Investigación</h2>

            <div class="info-badge">
                <!-- Mostrar la unidad seleccionada actualmente para el proyecto -->
                <span v-if="currentSelectedUnidadId">Unidad Asociada al Proyecto:
                    {{ nombreEscuelaSeleccionada }}</span>
                <!-- Mostrar información del investigador/colaborador -->
                <span v-if="academicoInfo">Investigador: {{ academicoInfo.nombre }}
                    {{ academicoInfo.a_paterno }}</span>
                <span v-else-if="externalInfo">Colaborador: {{ externalInfo.name }}
                    {{ externalInfo.aPaterno }}</span>
            </div>
        </div>

        <div class="divider"></div>
        <h3 style="font-style: italic">
            Favor contestar las siguientes preguntas, de forma muy breve (que el
            documento final no sea más de 3 planas). No es obligatorio contestar
            todas las preguntas.
        </h3>

        <div class="divider"></div>

        <!-- CAMBIO CLAVE: SE ELIMINÓ EL V-IF PARA MOSTRAR SIEMPRE LA SELECCIÓN DE UNIDAD -->
        <div class="form-group">
            <label for="unidadAcademicaProyecto">Por favor, seleccione la Unidad Académica asociada a este
                proyecto:</label>
            <select id="unidadAcademicaProyecto" v-model="currentSelectedUnidadId" class="select-input" required>
                <!-- Opción inicial para forzar la selección, con valor `null` -->
                <option :value="null" disabled>Seleccione una unidad</option>
                <option v-for="unidad in unidadesAcademicas" :key="unidad.id_unidad" :value="unidad.id_unidad">
                    {{ unidad.nombre }}
                </option>
            </select>
            <!-- Mostrar error si el campo está vacío y hay un submitError global -->
            <p v-if="submitError && (currentSelectedUnidadId === null || currentSelectedUnidadId === '')"
                class="error-message">
                Debe seleccionar una unidad académica asociada al proyecto.
            </p>
        </div>

        <div v-for="(pregunta, index) in preguntas" :key="pregunta.id_cuestionario" class="pregunta-item">
            <div class="pregunta-header">
                <span class="pregunta-number">Pregunta {{ index + 1 }}</span>
            </div>
            <p class="pregunta-text">{{ pregunta.pregunta }}</p>
            <textarea :value="currentRespuestas[index]" @input="updateRespuesta(index, $event.target.value)"
                placeholder="Escriba su respuesta detallada aquí..." rows="5" class="textarea-input"></textarea>
        </div>

        <div class="actions-section">
            <button @click="submitForm" :disabled="isSubmitting" class="primary-btn submit-btn">
                <span v-if="!isSubmitting">Enviar Cuestionario</span>
                <span v-else class="spinner-btn"></span>
            </button>
        </div>

        <div v-if="submitError" class="error-message">
            <div class="error-icon">⚠️</div>
            <p>{{ submitError }}</p>
        </div>
    </div>
</template>

<!-- No <style scoped> aquí para no alterar los estilos globales -->