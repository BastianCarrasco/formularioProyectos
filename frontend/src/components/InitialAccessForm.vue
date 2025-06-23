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
        <h2>Verificación de Acceso</h2>
        <div class="form-group">
            <label class="radio-container">
                <input type="radio" v-model="isAcademico" :value="true" />
                <span class="radio-checkmark"></span>
                Sí, soy parte del cuerpo académico
            </label>
        </div>

        <div class="form-group">
            <label class="radio-container">
                <input type="radio" v-model="isAcademico" :value="false" />
                <span class="radio-checkmark"></span>
                No, no soy parte del cuerpo académico
            </label>
        </div>

        <div class="form-actions-center">
            <button @click="verificarAcceso" :disabled="isAcademico === null" class="verify-btn primary-btn">
                Continuar
            </button>
        </div>
    </div>
</template>