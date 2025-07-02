<script setup>
const emit = defineEmits(["reset-app"]);

const reset = () => {
    emit("reset-app");
};
</script>

<template>
    <transition name="fade">
        <div class="final-success-message card">
            <div class="success-icon big-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="check-mark">
                    <path fill-rule="evenodd"
                        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.532-1.267-1.267a.75.75 0 0 0-1.06 1.06l1.75 1.75a.75.75 0 0 0 1.154-.108 3.5 3.5 0 0 1 3.194-4.42Z"
                        clip-rule="evenodd" />
                </svg>
            </div>
            <h2 class="success-title">¡Respuestas Enviadas con Éxito!</h2>
            <p class="success-text">Nuestros evaluadores estudiarán su proyecto próximamente.</p>
            <p class="success-text">¡Gracias por contribuir!</p>
            <button @click="reset" class="primary-btn reset-app-btn">
                Volver al Inicio
            </button>
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

/* Contenedor principal del mensaje de éxito (la tarjeta) */
.final-success-message {
    background-color: #ffffff;
    padding: 2.5rem;
    /* Consistente con otros formularios */
    border-radius: 12px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    max-width: 450px;
    /* Mismo ancho que los formularios de acceso */
    margin: 4rem auto;
    /* Centra y añade más espacio superior para un mensaje final */
    text-align: center;
    border: 1px solid #e0e0e0;
}

/* Icono de éxito */
.success-icon.big-icon {
    font-size: 4rem;
    /* Tamaño original era con un checkmark de texto, ahora con SVG */
    color: #28a745;
    /* Verde de éxito */
    margin-bottom: 1.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 80px;
    /* Tamaño fijo para el contenedor SVG */
    height: 80px;
    /* Tamaño fijo para el contenedor SVG */
    margin-left: auto;
    margin-right: auto;
    background-color: #e6ffed;
    /* Fondo verde claro */
    border-radius: 50%;
    /* Círculo */
    border: 2px solid #28a745;
    /* Borde verde */
    box-shadow: 0 0 0 6px rgba(40, 167, 69, 0.1);
    /* Anillo verde suave */
}

/* Estilo para el SVG del checkmark */
.check-mark {
    width: 60px;
    /* Tamaño del SVG dentro del círculo */
    height: 60px;
    color: #28a745;
    /* Color del checkmark */
}


/* Título de éxito */
.success-title {
    font-size: 2rem;
    color: #2E5C8A;
    /* Azul de la PUCV para el título principal */
    margin-bottom: 1rem;
    font-weight: 700;
}

/* Párrafos de texto de éxito */
.success-text {
    font-size: 1rem;
    color: #555;
    margin-bottom: 0.8rem;
    line-height: 1.5;
}

.success-text:last-of-type {
    margin-bottom: 2rem;
    /* Espacio extra antes del botón */
}

/* Botón "Volver al Inicio" */
.reset-app-btn {
    padding: 0 2rem;
    /* Padding horizontal */
    font-size: 1.1rem;
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
    margin: 0 auto;
    /* Centra el botón si es necesario */
}

.reset-app-btn:hover {
    background-color: #264e75;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(46, 92, 138, 0.2);
}


/* Responsive adjustments */
@media (max-width: 600px) {
    .final-success-message {
        padding: 1.5rem;
        margin: 2rem auto;
        max-width: 95%;
    }

    .success-icon.big-icon {
        width: 60px;
        height: 60px;
        margin-bottom: 1rem;
    }

    .check-mark {
        width: 45px;
        height: 45px;
    }

    .success-title {
        font-size: 1.6rem;
    }

    .success-text {
        font-size: 0.9rem;
        margin-bottom: 0.6rem;
    }

    .success-text:last-of-type {
        margin-bottom: 1.5rem;
    }

    .reset-app-btn {
        padding: 0 1.5rem;
        font-size: 1rem;
        height: 40px;
    }
}
</style>