<script setup>
import { ref } from "vue"; // CORREGIDO: Usar 'from' en lugar de '='

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
});

const emit = defineEmits(["verify-email", "back"]);

const email = ref(props.initialEmail);

const verify = () => {
    emit("verify-email", email.value);
};

const goBack = () => {
    emit("back");
};
</script>

<template>
    <transition name="fade">
        <div class="email-verification-form card">
            <h2 class="form-title">Verificación de Email (Académico)</h2>
            <p class="form-description">
                Por favor, ingrese su correo electrónico institucional para
                verificar su identidad como académico de la PUCV.
            </p>
            <div class="form-group">
                <label for="email" class="input-label">Correo Electrónico:</label>
                <input type="email" id="email" v-model="email" required class="text-input"
                    :class="{ 'input-error': errorMessage }" placeholder="ej. tunombre@pucv.cl" />
                <p v-if="errorMessage" class="error-message">
                    {{ errorMessage }}
                </p>
            </div>
            <div class="form-actions-flex">
                <button @click="goBack" class="secondary-btn back-btn" :disabled="isSubmitting">
                    <span class="button-content">Volver</span>
                </button>
                <button @click="verify" :disabled="isSubmitting || !email.length" class="primary-btn verify-btn">
                    <span v-if="!isSubmitting" class="button-content">Verificar Email</span>
                    <span v-else class="spinner-btn button-content"></span>
                </button>
            </div>
        </div>
    </transition>
</template>

<style scoped>
/* Transición de entrada/salida para el componente */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* Contenedor principal del formulario */
.email-verification-form {
    background-color: #ffffff;
    padding: 1.8rem;
    border-radius: 12px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    max-width: 450px;
    margin: 2rem auto;
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
    max-width: 380px;
    margin-left: auto;
    margin-right: auto;
}

/* Grupo de formulario (label + input) */
.form-group {
    margin-bottom: 1.5rem;
    text-align: left;
}

.input-label {
    display: block;
    font-size: 0.95rem;
    color: #333;
    margin-bottom: 0.5rem;
    font-weight: 500;
}

.text-input {
    width: 100%;
    padding: 0.8rem 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    color: #333;
    box-sizing: border-box;
    transition: all 0.3s ease;
}

.text-input:focus {
    border-color: #2E5C8A;
    box-shadow: 0 0 0 3px rgba(46, 92, 138, 0.2);
    outline: none;
}

/* Estilo para el input cuando hay un error */
.text-input.input-error {
    border-color: #e74c3c;
}

/* Mensaje de error */
.error-message {
    color: #e74c3c;
    font-size: 0.85rem;
    margin-top: 0.5rem;
    text-align: left;
}

/* Contenedor de acciones de botones */
.form-actions-flex {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 2rem;
}

/* Estilo general para botones (primary y secondary) */
.primary-btn,
.secondary-btn {
    padding: 0 1.5rem;
    font-size: 1.05rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    flex-grow: 1;
    flex-basis: 0;
    box-sizing: border-box;

    height: 43px;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    border-bottom: 10px;
}

/* Estilo para el botón primario */
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

/* Estilo para el botón secundario (volver) */
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

/* Contenido dentro de los botones (texto o spinner) */
.button-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

/* Estilo del spinner para el botón */
.spinner-btn {
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top: 3px solid #ffffff;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    animation: spin 1s linear infinite;
    vertical-align: middle;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

/* Responsive adjustments */
@media (max-width: 600px) {
    .email-verification-form {
        padding: 1.5rem;
        margin: 1.5rem auto;
        max-width: 95%;
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
        font-size: 0.9rem;
    }

    .text-input {
        padding: 0.7rem 0.8rem;
        font-size: 0.9rem;
    }

    .error-message {
        font-size: 0.8rem;
    }

    .form-actions-flex {
        flex-direction: column;
        gap: 0.8rem;
    }

    .primary-btn,
    .secondary-btn {
        padding: 0.8rem 1.2rem;
        font-size: 1rem;
        flex-basis: auto;
        height: auto;
        line-height: normal;
    }

    .button-content {
        height: auto;
        line-height: normal;
    }
}
</style>