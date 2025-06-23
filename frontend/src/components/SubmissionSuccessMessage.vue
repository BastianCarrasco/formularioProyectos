<script setup>
const emit = defineEmits(["reset-app"]);

const reset = () => {
    emit("reset-app");
};
</script>

<template>
    <transition name="fade">
        <div class="final-success-message card">
            <div class="success-icon big-icon">✓</div>
            <h2>¡Respuestas Enviadas con Éxito!</h2>
            <p>Nuestros evaluadores estudiarán su proyecto próximamente.</p>
            <p>¡Gracias por contribuir!</p>
            <button @click="reset" class="primary-btn reset-app-btn">
                Volver al Inicio
            </button>
        </div>
    </transition>
</template>