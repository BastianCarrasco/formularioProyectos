<script setup>
import { ref, watch, computed } from "vue"; // Importar 'watch'

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
const emit = defineEmits(["update:initialRespuestas", "update:selectedUnidadId", "submit-questionnaire"]); // Asegúrate de que el emit sea 'update:initialRespuestas'

// CAMBIO CLAVE: Usa un ref local para las respuestas
const currentRespuestas = ref([...props.initialRespuestas]); // Inicializa con una copia de la prop

// CAMBIO CLAVE: Sincroniza el ref local con la prop usando un watcher
// Cuando la prop initialRespuestas cambie desde el padre, actualiza el ref local
watch(() => props.initialRespuestas, (newVal) => {
    // Solo actualiza si los arrays son diferentes (para evitar bucles infinitos)
    // Se usa JSON.stringify para una comparación rápida de contenido si los elementos son primitivos
    if (JSON.stringify(newVal) !== JSON.stringify(currentRespuestas.value)) {
        currentRespuestas.value = [...newVal];
    }
}, { deep: true }); // Observa cambios profundos en el array

// La lógica para currentSelectedUnidadId con computed está bien, ya que es un valor primitivo
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
    // Modifica directamente el ref local
    // Vue 3 detecta la mutación de arrays dentro de refs
    currentRespuestas.value[index] = value;

    // Después de la mutación local, EMITE la actualización al padre
    // Importante: No uses la asignación en `computed` para esto, emite directamente.
    emit("update:initialRespuestas", currentRespuestas.value);

    console.log(`Respuesta ${index} actualizada a: ${value}. Array actual (local):`, currentRespuestas.value);
};
</script>

<template>
    <div class="cuestionario-container card">
        <div class="header-section">
            <h2 class="form-title">Cuestionario de Investigación</h2>

            <div class="info-badge-container">
                <!-- Mostrar información del investigador/colaborador -->
                <span v-if="academicoInfo" class="info-badge">
                    <i class="icon-user">👤</i> Investigador: {{ academicoInfo.nombre }}
                    {{ academicoInfo.a_paterno }}
                </span>
                <span v-else-if="externalInfo" class="info-badge">
                    <i class="icon-user">👥</i> Colaborador: {{ externalInfo.name }}
                    {{ externalInfo.aPaterno }}
                </span>
            </div>
        </div>

        <div class="divider"></div>

        <h3 class="instruction-text">
            Favor contestar las siguientes preguntas, de forma muy breve (que el
            documento final no sea más de 3 planas). No es obligatorio contestar
            todas las preguntas.
        </h3>

        <div class="divider"></div>

        <!-- Sección de selección de Unidad Académica -->
        <div class="form-group">
            <label for="unidadAcademicaProyecto" class="input-label required-label">
                Seleccione la Unidad Académica asociada a este proyecto:
            </label>
            <select id="unidadAcademicaProyecto" v-model="currentSelectedUnidadId" class="select-input"
                :class="{ 'input-error': submitError && (currentSelectedUnidadId === null || currentSelectedUnidadId === '') }"
                required>
                <option :value="null" disabled>-- Seleccione una unidad --</option>
                <option v-for="unidad in unidadesAcademicas" :key="unidad.id_unidad" :value="unidad.id_unidad">
                    {{ unidad.nombre }}
                </option>
            </select>
            <p v-if="submitError && (currentSelectedUnidadId === null || currentSelectedUnidadId === '')"
                class="error-message">
                Debe seleccionar una unidad académica asociada al proyecto.
            </p>
        </div>

        <div class="questions-list">
            <div v-for="(pregunta, index) in preguntas" :key="pregunta.id_cuestionario" class="pregunta-item">
                <div class="pregunta-header">
                    <span class="pregunta-number">Pregunta {{ index + 1 }}</span>
                </div>
                <p class="pregunta-text">{{ pregunta.pregunta }}</p>
                <textarea :value="currentRespuestas[index]" @input="updateRespuesta(index, $event.target.value)"
                    placeholder="Escriba su respuesta detallada aquí..." rows="5" class="textarea-input"></textarea>
            </div>
        </div>

        <div class="actions-section">
            <button @click="submitForm" :disabled="isSubmitting" class="primary-btn submit-btn">
                <span v-if="!isSubmitting" class="button-content">Enviar Cuestionario</span>
                <span v-else class="spinner-btn button-content"></span>
            </button>
        </div>

        <div v-if="submitError && !(currentSelectedUnidadId === null || currentSelectedUnidadId === '')"
            class="global-error-message">
            <div class="error-icon">⚠️</div>
            <p>{{ submitError }}</p>
        </div>
    </div>
</template>

<style scoped>
/* Contenedor principal del cuestionario (la tarjeta grande) */
.cuestionario-container {
    background-color: #ffffff;
    padding: 2.5rem 3rem;
    /* Más padding para un diseño más abierto */
    border-radius: 12px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    max-width: 900px;
    /* Un ancho más generoso para el cuestionario */
    margin: 2rem auto;
    /* Centra en la página */
    border: 1px solid #e0e0e0;
}

/* Sección del encabezado del cuestionario */
.header-section {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    /* Alinea el contenido a la izquierda */
    margin-bottom: 1.5rem;
}

.form-title {
    font-size: 2.2rem;
    /* Título más grande para el cuestionario */
    color: #2E5C8A;
    margin-bottom: 0.8rem;
    font-weight: 700;
}

/* Contenedor para los badges de información */
.info-badge-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
    margin-top: 0.5rem;
}

.info-badge {
    background-color: #e6f2ff;
    /* Fondo azul claro */
    color: #2E5C8A;
    /* Texto azul oscuro */
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.4rem;
}

.icon-user {
    font-size: 1.1em;
}

/* Texto de instrucción / itálico */
.instruction-text {
    font-size: 0.95rem;
    color: #666;
    margin-bottom: 2rem;
    line-height: 1.5;
    font-style: italic;
    text-align: left;
    /* Alinea el texto a la izquierda */
}

/* Divisor visual */
.divider {
    border-top: 1px solid #eee;
    margin: 2rem 0;
}

/* Estilo para los grupos de formulario (labels e inputs) */
.form-group {
    margin-bottom: 2rem;
    text-align: left;
}

.input-label {
    display: block;
    font-size: 1rem;
    color: #333;
    margin-bottom: 0.6rem;
    font-weight: 600;
}

.required-label::after {
    content: "*";
    color: #e74c3c;
    margin-left: 0.3rem;
}

/* Estilo para el SELECT input */
.select-input {
    width: 100%;
    padding: 0.8rem 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    color: #333;
    background-color: #fff;
    /* Fondo blanco */
    appearance: none;
    /* Remueve el estilo nativo de la flecha del select */
    -webkit-appearance: none;
    -moz-appearance: none;
    background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13.2-6.4H18.6c-5%200-9.3%201.8-13.2%205.8-3.9%204-6.2%209.1-6.2%2014.2%200%205.4%202.3%2010.5%206.2%2014.2l127.9%20127.9c4%203.9%209.1%206.2%2014.2%206.2%205%200%2010.1-2.3%2014.2-6.2L287%2097.7A19.1%2019.1%200%200%200%20287%2069.4z%22%2F%3E%3C%2Fsvg%3E');
    /* Flecha SVG personalizada */
    background-repeat: no-repeat;
    background-position: right 0.7rem top 50%;
    background-size: 0.65em auto;
    box-sizing: border-box;
    transition: all 0.3s ease;
}

.select-input:focus {
    border-color: #2E5C8A;
    box-shadow: 0 0 0 3px rgba(46, 92, 138, 0.2);
    outline: none;
}

/* Estilo para el SELECT input cuando hay un error */
.select-input.input-error {
    border-color: #e74c3c;
}

/* Contenedor de la lista de preguntas */
.questions-list {
    margin-bottom: 2.5rem;
}

.pregunta-item {
    background-color: #fcfcfc;
    border: 1px solid #f0f0f0;
    border-radius: 10px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    text-align: left;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
}

.pregunta-header {
    display: flex;
    align-items: center;
    margin-bottom: 0.8rem;
}

.pregunta-number {
    background-color: #2E5C8A;
    color: white;
    font-weight: 700;
    padding: 0.3rem 0.7rem;
    border-radius: 5px;
    font-size: 0.9em;
    margin-right: 0.8rem;
}

.pregunta-text {
    font-size: 1.05rem;
    color: #333;
    font-weight: 500;
    margin-bottom: 1rem;
    line-height: 1.5;
}

.textarea-input {
    width: 100%;
    padding: 0.8rem 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    color: #333;
    box-sizing: border-box;
    transition: all 0.3s ease;
    resize: vertical;
    min-height: 100px;
    /* Altura mínima para la caja de texto */
}

.textarea-input:focus {
    border-color: #2E5C8A;
    box-shadow: 0 0 0 3px rgba(46, 92, 138, 0.2);
    outline: none;
}

/* Sección de acciones (botón de envío) */
.actions-section {
    text-align: center;
    margin-top: 2rem;
}

/* Estilo para el botón de envío */
.submit-btn {
    padding: 0 2.5rem;
    /* padding horizontal */
    font-size: 1.15rem;
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.3s ease;
    background-color: #2E5C8A;
    color: #ffffff;
    border: none;
    cursor: pointer;

    /* Asegura altura consistente con otros botones */
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
}

.submit-btn:hover:not(:disabled) {
    background-color: #264e75;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(46, 92, 138, 0.2);
}

.submit-btn:disabled {
    background-color: #cccccc;
    color: #f0f0f0;
    cursor: not-allowed;
}

/* Contenido dentro del botón (texto o spinner) */
.button-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

/* Spinner dentro del botón */
.spinner-btn {
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top: 3px solid #ffffff;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

/* Mensajes de error */
.error-message {
    color: #e74c3c;
    font-size: 0.85rem;
    margin-top: 0.5rem;
    text-align: left;
}

.global-error-message {
    background-color: #ffe6e6;
    border: 1px solid #e74c3c;
    color: #e74c3c;
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
    margin-top: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    font-size: 1rem;
    font-weight: 500;
}

.global-error-message .error-icon {
    font-size: 1.5rem;
    margin-bottom: 0;
    /* Reiniciar margen del icono */
}


/* Responsive adjustments */
@media (max-width: 768px) {
    .cuestionario-container {
        padding: 1.5rem;
        max-width: 95%;
        margin: 1.5rem auto;
    }

    .header-section {
        margin-bottom: 1rem;
    }

    .form-title {
        font-size: 1.8rem;
    }

    .info-badge {
        font-size: 0.8rem;
        padding: 0.4rem 0.8rem;
    }

    .instruction-text {
        font-size: 0.9rem;
        margin-bottom: 1.5rem;
    }

    .divider {
        margin: 1.5rem 0;
    }

    .form-group {
        margin-bottom: 1.5rem;
    }

    .input-label {
        font-size: 0.9rem;
        margin-bottom: 0.4rem;
    }

    .select-input,
    .textarea-input {
        padding: 0.7rem 0.9rem;
        font-size: 0.95rem;
    }

    .pregunta-item {
        padding: 1.2rem;
        margin-bottom: 1.2rem;
    }

    .pregunta-number {
        font-size: 0.8em;
        padding: 0.2rem 0.6rem;
    }

    .pregunta-text {
        font-size: 0.95rem;
        margin-bottom: 0.8rem;
    }

    .submit-btn {
        padding: 0 1.8rem;
        font-size: 1rem;
        height: 40px;
        /* Un poco más pequeño en móvil */
    }

    .spinner-btn {
        width: 18px;
        height: 18px;
    }
}
</style>