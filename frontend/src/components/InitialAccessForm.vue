<script setup>
import { ref } from "vue";

const emit = defineEmits(["continue-access"]);

const isAcademico = ref(null);

const verificarAcceso = () => {
    emit("continue-access", isAcademico.value);
};
</script>

<template>
    <div class="verification-form card">
        <h2 class="form-title">Verificación de Acceso</h2>
        <p class="form-description">
            Por favor, selecciona si eres parte del cuerpo académico de la
            Pontificia Universidad Católica de Valparaíso o un colaborador
            externo.
        </p>

        <div class="options-container">
            <label class="radio-option" :class="{ selected: isAcademico === true }">
                <input type="radio" v-model="isAcademico" :value="true" class="hidden-radio" />
                <span class="custom-radio-circle"></span>
                <span class="option-text">Sí, soy parte del cuerpo académico</span>
            </label>

            <label class="radio-option" :class="{ selected: isAcademico === false }">
                <input type="radio" v-model="isAcademico" :value="false" class="hidden-radio" />
                <span class="custom-radio-circle"></span>
                <span class="option-text">No, no soy parte del cuerpo académico</span>
            </label>
        </div>

        <div class="form-actions-center">
            <button @click="verificarAcceso" :disabled="isAcademico === null" class="verify-btn primary-btn"
                :class="{ 'is-active': isAcademico !== null }">
                Continuar
            </button>
        </div>
    </div>
</template>

<style scoped>
/* Contenedor principal del formulario */
.verification-form {
    background-color: #ffffff;
    padding: 1.8rem;
    /* Reducido el padding */
    border-radius: 12px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    max-width: 450px;
    /* Reducido el ancho máximo */
    margin: 2rem auto;
    /* Reducido el margen superior */
    text-align: center;
    border: 1px solid #e0e0e0;
}

.form-title {
    font-size: 1.8rem;
    /* Ajustado el tamaño de fuente */
    color: #2E5C8A;
    margin-bottom: 0.8rem;
    /* Reducido el margen */
    font-weight: 700;
}

.form-description {
    font-size: 0.95rem;
    /* Ajustado el tamaño de fuente */
    color: #555;
    margin-bottom: 1.5rem;
    /* Reducido el margen */
    line-height: 1.4;
    /* Ajustado el line-height */
    max-width: 380px;
    /* Ajustado para el nuevo ancho */
    margin-left: auto;
    margin-right: auto;
}

/* Contenedor para las opciones de radio */
.options-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    /* Reducido el espacio entre opciones */
    margin-bottom: 2rem;
    /* Reducido el margen */
    text-align: left;
}

/* Estilo para cada opción de radio */
.radio-option {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 1rem 1.2rem;
    /* Reducido el padding */
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    transition: all 0.3s ease;
    background-color: #f9f9f9;
    position: relative;
    user-select: none;
}

.radio-option:hover {
    border-color: #a7cced;
    background-color: #eaf5ff;
}

/* Estilo cuando la opción está seleccionada */
.radio-option.selected {
    border-color: #2E5C8A;
    background-color: #e6f2ff;
    box-shadow: 0 2px 8px rgba(46, 92, 138, 0.15);
}

/* Ocultar el radio input nativo */
.hidden-radio {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
}

/* Estilo para el círculo de radio personalizado */
.custom-radio-circle {
    height: 18px;
    /* Ligeramente más pequeño */
    width: 18px;
    /* Ligeramente más pequeño */
    background-color: #fff;
    border: 2px solid #999;
    border-radius: 50%;
    display: inline-block;
    position: relative;
    margin-right: 0.8rem;
    /* Reducido el margen */
    flex-shrink: 0;
    transition: all 0.3s ease;
}

/* Punto interior del radio cuando está seleccionado */
.custom-radio-circle::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    height: 8px;
    /* Ligeramente más pequeño */
    width: 8px;
    /* Ligeramente más pequeño */
    border-radius: 50%;
    background: #2E5C8A;
    transition: transform 0.3s ease;
}

/* Mostrar el punto cuando el input está checked */
.hidden-radio:checked+.custom-radio-circle::after {
    transform: translate(-50%, -50%) scale(1);
}

/* Cambiar el borde y fondo del círculo cuando el input está checked */
.hidden-radio:checked+.custom-radio-circle {
    border-color: #2E5C8A;
    background-color: #f0f8ff;
}

/* Estilo del texto de la opción */
.option-text {
    font-size: 1rem;
    /* Ligeramente más pequeño */
    color: #333;
    font-weight: 500;
}

/* Acciones del formulario (botón) */
.form-actions-center {
    text-align: center;
}

.verify-btn {
    padding: 0.8rem 2.2rem;
    /* Reducido el padding */
    font-size: 1.05rem;
    /* Reducido el tamaño de fuente */
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.3s ease;
    background-color: #cccccc;
    color: #ffffff;
    cursor: not-allowed;
    border: none;
}

.verify-btn.is-active {
    background-color: #2E5C8A;
    cursor: pointer;
}

.verify-btn.is-active:hover {
    background-color: #264e75;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(46, 92, 138, 0.2);
}

/* Responsive adjustments */
@media (max-width: 600px) {
    .verification-form {
        padding: 1.2rem;
        /* Más reducido en móvil */
        margin: 1.5rem auto;
        max-width: 95%;
        /* Permite un poco más de ancho en móvil */
    }

    .form-title {
        font-size: 1.5rem;
    }

    .form-description {
        font-size: 0.85rem;
        max-width: 100%;
        margin-bottom: 1rem;
    }

    .options-container {
        gap: 0.8rem;
    }

    .radio-option {
        padding: 0.8rem;
    }

    .custom-radio-circle {
        height: 16px;
        width: 16px;
        margin-right: 0.6rem;
    }

    .custom-radio-circle::after {
        height: 7px;
        width: 7px;
    }

    .option-text {
        font-size: 0.9rem;
    }

    .verify-btn {
        padding: 0.7rem 1.8rem;
        font-size: 0.95rem;
    }
}
</style>