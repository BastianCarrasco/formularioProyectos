<script setup>
import { ref, onMounted, computed } from "vue";

const urlcuestionario = import.meta.env.VITE_API_URL_CUESTIONARIOS;
const urlacademico = import.meta.env.VITE_API_URL_ACADEMICOS;
const urlUA = import.meta.env.VITE_API_URL_UA;

// Estados
const isAcademico = ref(false);
const selectedUnidadId = ref(null);
const showCuestionario = ref(false);
const isSubmitting = ref(false);
const submitSuccess = ref(false);
const submitError = ref(false);
const isLoading = ref(false);
const loadError = ref(null);
const showJsonData = ref(false);

// Datos
const unidadesAcademicas = ref([]);
const academicos = ref([]);
const preguntasCuestionario = ref([]);

// Formulario
const formData = ref({
  id_investigador: null,
  respuestas: [],
});

// Computed
const nombreInvestigadorSeleccionado = computed(() => {
  if (!formData.value.id_investigador) return "";
  const academico = academicos.value.find(
    (a) => a.id_academico === formData.value.id_investigador
  );
  return academico ? academico.nombre : "";
});

const nombreEscuelaSeleccionada = computed(() => {
  if (!selectedUnidadId.value) return "";
  const unidad = unidadesAcademicas.value.find(
    (u) => u.id_unidad === selectedUnidadId.value
  );
  return unidad ? unidad.nombre : "";
});

// Cargar datos
onMounted(async () => {
  try {
    isLoading.value = true;
    const [uaResponse, acResponse, cuResponse] = await Promise.all([
      fetch(urlUA).then((res) => res.json()),
      fetch(urlacademico).then((res) => res.json()),
      fetch(urlcuestionario).then((res) => res.json()),
    ]);

    if (uaResponse.success) unidadesAcademicas.value = uaResponse.data;
    if (acResponse.success) academicos.value = acResponse.data;
    if (cuResponse.success) {
      preguntasCuestionario.value = cuResponse.data;
      formData.value.respuestas = Array(
        preguntasCuestionario.value.length
      ).fill("");
    }
  } catch (error) {
    console.error("Error al cargar datos:", error);
    loadError.value = "Error al cargar los datos. Por favor intente más tarde.";
  } finally {
    isLoading.value = false;
  }
});

const verificarAcceso = () => {
  if (isAcademico.value && selectedUnidadId.value) {
    showCuestionario.value = true;
  }
};

// Generar estructura para POST
const generatePostData = () => {
  return {
    nombre_investigador: formData.value.id_investigador,
    escuela: selectedUnidadId.value,
    respuestas: formData.value.respuestas,
  };
};

const logPostData = () => {
  console.log("Datos a enviar:", JSON.stringify(generatePostData(), null, 2));
  showJsonData.value = true;
};

const enviarCuestionario = async () => {
  isSubmitting.value = true;
  submitError.value = false;

  try {
    const postData = generatePostData();
    console.log("Enviando datos:", JSON.stringify(postData, null, 2));

    const response = await fetch(
      "https://kth2025backend-production.up.railway.app/respuestas-cuestionarios",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      }
    );

    if (response.ok) {
      submitSuccess.value = true;
      formData.value = {
        id_investigador: null,
        respuestas: Array(preguntasCuestionario.value.length).fill(""),
      };
      selectedUnidadId.value = null;
      showJsonData.value = false;
    } else {
      throw new Error("Error en el envío");
    }
  } catch (error) {
    submitError.value = true;
    console.error("Error al enviar el cuestionario:", error);
  } finally {
    isSubmitting.value = false;
  }
};

const updateRespuesta = (index, value) => {
  formData.value.respuestas[index] = value;
};
</script>

<template>
  <div class="welcome-container">
    <header>
      <img
        src="https://pucv.cl/uuaa/site/artic/20180620/imag/foto_0000000120180620105732.png"
        alt="Logo Universidad"
        class="logo"
      />
      <h1>Perfil de Proyecto Innovación Tecnológica</h1>
     
    </header>

    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>Cargando datos del cuestionario...</p>
    </div>

    <div v-if="loadError" class="error">
      <div class="error-icon">⚠️</div>
      <p>{{ loadError }}</p>
      <button @click="onMounted" class="retry-btn">Reintentar</button>
    </div>

    <div v-if="!isLoading && !loadError">
      <div v-if="!showCuestionario" class="verification-form card">
        <h2>Verificación de Acceso</h2>
        <div class="form-group">
          <label class="checkbox-container">
            <input type="checkbox" v-model="isAcademico" />
            <span class="checkmark"></span>
            ¿Eres parte del cuerpo académico?
          </label>
        </div>

        <transition name="fade">
          <div class="form-group" v-if="isAcademico">
            <label for="unidad-academica">Unidad Académica:</label>
            <select id="unidad-academica" v-model="selectedUnidadId" class="select-input">
              <option :value="null">Seleccione una opción</option>
              <option
                v-for="unidad in unidadesAcademicas"
                :key="unidad.id_unidad"
                :value="unidad.id_unidad"
              >
                {{ unidad.nombre }}
              </option>
            </select>
          </div>
        </transition>

        <button
          @click="verificarAcceso"
          :disabled="!isAcademico || !selectedUnidadId"
          class="verify-btn primary-btn"
        >
          Continuar al Cuestionario
        </button>
      </div>

      <div v-if="showCuestionario" class="cuestionario-container card">
        <div class="header-section">
          <h2>Cuestionario de Investigación</h2>
          <div class="info-badge">
            <span>Unidad: {{ nombreEscuelaSeleccionada }}</span>
          </div>
        </div>

        <div class="form-group">
          <label for="nombre-investigador">Identificación del Investigador:</label>
          <select
            id="nombre-investigador"
            v-model="formData.id_investigador"
            required
            class="select-input"
          >
            <option :value="null">Seleccione su nombre</option>
            <option
              v-for="academico in academicos"
              :key="academico.id_academico"
              :value="academico.id_academico"
            >
              {{ academico.nombre }}
            </option>
          </select>
        </div>

        <div class="divider"></div>

        <div
          v-for="(pregunta, index) in preguntasCuestionario"
          :key="pregunta.id_cuestionario"
          class="pregunta-item"
        >
          <div class="pregunta-header">
            <span class="pregunta-number">Pregunta {{ index + 1 }}</span>
            <span class="pregunta-required">* Requerido</span>
          </div>
          <p class="pregunta-text">{{ pregunta.pregunta }}</p>
          <textarea
            v-model="formData.respuestas[index]"
            @input="updateRespuesta(index, $event.target.value)"
            placeholder="Escriba su respuesta detallada aquí..."
            rows="5"
            required
            class="textarea-input"
          ></textarea>
        </div>

        <div class="actions-section">
          <!-- <button @click="logPostData" class="secondary-btn">
            Ver Datos a Enviar
          </button> -->

          <button
            @click="enviarCuestionario"
            :disabled="
              isSubmitting ||
              !formData.id_investigador ||
              formData.respuestas.some((r) => !r)
            "
            class="primary-btn submit-btn"
          >
            <span v-if="!isSubmitting">Enviar Cuestionario</span>
            <span v-else class="spinner-btn"></span>
          </button>
        </div>

        <transition name="fade">
          <div v-if="showJsonData" class="json-viewer card">
            <h3>Datos que se enviarán:</h3>
            <pre>{{ generatePostData() }}</pre>
          </div>
        </transition>

        <transition name="fade">
          <div v-if="submitSuccess" class="success-message">
            <div class="success-icon">✓</div>
            <p>¡Cuestionario enviado con éxito!</p>
            <p>Gracias por tu participación.</p>
          </div>
        </transition>

        <div v-if="submitError" class="error-message">
          <div class="error-icon">⚠️</div>
          <p>Error al enviar el cuestionario. Por favor intente nuevamente.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Agrega tus estilos aquí si es necesario */
</style>
