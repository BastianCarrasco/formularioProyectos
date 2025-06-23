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
            <h3>Verificación de Email (Académico)</h3>
            <p>
                Por favor, ingrese su correo electrónico institucional para verificar su
                identidad como académico.
            </p>
            <div class="form-group">
                <label for="email">Correo Electrónico:</label>
                <input type="email" id="email" v-model="email" required class="text-input" />
                <p v-if="errorMessage" class="error-message">
                    {{ errorMessage }}
                </p>
            </div>
            <div class="form-actions">
                <button @click="goBack" class="secondary-btn back-btn">Volver</button>
                <button @click="verify" :disabled="isSubmitting" class="verify-btn primary-btn">
                    <span v-if="!isSubmitting">Verificar Email</span>
                    <span v-else class="spinner-btn"></span>
                </button>
            </div>
        </div>
    </transition>
</template>