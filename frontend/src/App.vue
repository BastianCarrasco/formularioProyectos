<script setup>
import { ref, onMounted, computed } from "vue";
import "../src/assets/estilos.css";

const urlcuestionario = import.meta.env.VITE_API_URL_CUESTIONARIOS;
const urlacademico = import.meta.env.VITE_API_URL_ACADEMICOS;
const urlUA = import.meta.env.VITE_API_URL_UA;

const isAcademico = ref(null);
const selectedUnidadId = ref(null);
const showCuestionario = ref(false);
const isSubmitting = ref(false);
const submitSuccess = ref(false);
const submitError = ref(false);
const isLoading = ref(false);
const loadError = ref(null);
const showJsonData = ref(false);
const isVerifyingEmail = ref(false);
const emailVerificationError = ref(null);
const email = ref("");
const isNotInUA = ref(false);
const notInUASuccess = ref(false);
const externalName = ref("");
const externalAPaterno = ref("");
const externalAMaterno = ref("");
const isExternalRegistration = ref(false);
const externalRegistrationSuccess = ref(false);
const externalRegistrationError = ref(null);
const greetUser = ref(false);
const academicoEncontrado = ref(null);

const unidadesAcademicas = ref([]);
const academicos = ref([]);
const preguntasCuestionario = ref([]);

const formData = ref({
  respuestas: [],
});

const nombreEscuelaSeleccionada = computed(() => {
  if (!selectedUnidadId.value) return "";
  const unidad = unidadesAcademicas.value.find(
    (u) => u.id_unidad === selectedUnidadId.value
  );
  return unidad ? unidad.nombre : "";
});

async function cargarDatos() {
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
}

onMounted(cargarDatos);

const verificarAcceso = () => {
  if (isAcademico.value === true && selectedUnidadId.value) {
    isVerifyingEmail.value = true;
  } else if (isAcademico.value === false) {
    isExternalRegistration.value = true;
  }
};

const verificarEmail = () => {
  emailVerificationError.value = null;
  academicoEncontrado.value = academicos.value.find(
    (a) => a.email === email.value
  );

  if (academicoEncontrado.value) {
    showCuestionario.value = true;
    isVerifyingEmail.value = false;
    greetUser.value = true;
  } else {
    emailVerificationError.value =
      "Correo electrónico no encontrado. Por favor, inténtelo de nuevo o registre su información.";
    isVerifyingEmail.value = false;
    isNotInUA.value = true;
  }
};

const registrarAcademicoExterno = async () => {
  externalRegistrationError.value = null;
  if (!email.value || !externalName.value || !externalAPaterno.value) {
    externalRegistrationError.value =
      "Por favor, complete todos los campos obligatorios.";
    return;
  }

  const data = {
    nombre: externalName.value,
    email: email.value,
    a_paterno: externalAPaterno.value,
    a_materno: externalAMaterno.value,
  };

  try {
    const response = await fetch(urlacademico, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const result = await response.json();
      academicoEncontrado.value = result.data;
      externalRegistrationSuccess.value = true;
      isExternalRegistration.value = false;
      greetUser.value = true;
      showCuestionario.value = true;
    } else {
      throw new Error("Error al registrar académico externo");
    }
  } catch (error) {
    console.error("Error al registrar académico externo:", error);
    externalRegistrationError.value =
      "Error al registrar. Por favor, inténtelo de nuevo.";
  }
};

const generatePostData = () => {
  // Procesar las respuestas para convertir null/undefined a ""
  const respuestasProcesadas = formData.value.respuestas.map((respuesta) =>
    respuesta === null || respuesta === undefined ? "" : respuesta
  );

  return {
    nombre_investigador: academicoEncontrado.value
      ? academicoEncontrado.value.id_academico
      : null,
    escuela: selectedUnidadId.value,
    respuestas: respuestasProcesadas,
  };
};

const enviarCuestionario = async () => {
  // Set the submitting state to true
  isSubmitting.value = true;
  // Reset the submit error state to false
  submitError.value = false;

  try {
    // Generate the data to be sent in the POST request
    const postData = generatePostData();

    // Log the data that will be sent before the POST request
    console.log("Data to be sent:", postData);

    // Perform the POST request to the backend
    const response = await fetch(
      "https://kth2025backend-production.up.railway.app/respuestas-cuestionarios",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      }
    );

    // Check if the response was successful
    if (response.ok) {
      // Set the submit success state to true
      submitSuccess.value = true;
      // Clear the form data
      formData.value.respuestas = Array(
        preguntasCuestionario.value.length
      ).fill("");
      // Reset the selected unit ID
      selectedUnidadId.value = null;
      // Hide the JSON data display
      showJsonData.value = false;
    } else {
      // Throw an error if the response was not successful
      throw new Error("Error en el envío");
    }
  } catch (error) {
    // Handle errors during the process
    submitError.value = true;
    console.error("Error al enviar el cuestionario:", error);
  } finally {
    // Set the submitting state to false
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
      <button @click="cargarDatos" class="retry-btn">Reintentar</button>
    </div>

    <div v-if="!isLoading && !loadError">
      <div
        v-if="
          !showCuestionario &&
          !isVerifyingEmail &&
          !isExternalRegistration &&
          !externalRegistrationSuccess
        "
        class="verification-form card"
      >
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

        <div class="form-group" v-if="isAcademico">
          <label for="unidadAcademica">Unidad Académica:</label>
          <select
            id="unidadAcademica"
            v-model="selectedUnidadId"
            class="select-input"
          >
            <option value="" disabled>Seleccione una unidad</option>
            <option
              v-for="unidad in unidadesAcademicas"
              :key="unidad.id_unidad"
              :value="unidad.id_unidad"
            >
              {{ unidad.nombre }}
            </option>
          </select>
        </div>

        <transition name="fade">
          <div v-if="greetUser" class="success-message">
            <div class="success-icon">👋</div>
            <p v-if="academicoEncontrado">
              ¡Hola, {{ academicoEncontrado.nombre }}
              {{ academicoEncontrado.a_paterno }}! Bienvenid@ al cuestionario.
            </p>
            <p v-else-if="externalRegistrationSuccess">
              ¡Hola, {{ externalName }} {{ externalAPaterno }}! Bienvenid@ al
              cuestionario.
            </p>
          </div>
        </transition>

        <button
          @click="verificarAcceso"
          :disabled="
            isAcademico === null ||
            (isAcademico === true && !selectedUnidadId) ||
            isSubmitting
          "
          class="verify-btn primary-btn"
        >
          <span v-if="!isSubmitting">Continuar al Cuestionario</span>
          <span v-else class="spinner-btn"></span>
        </button>
      </div>

      <transition name="fade">
        <div v-if="isVerifyingEmail" class="email-verification-form card">
          <h3>Verificación de Email</h3>
          <p>
            Por favor, ingrese su correo electrónico para verificar su
            identidad.
          </p>
          <div class="form-group">
            <label for="email">Correo Electrónico:</label>
            <input
              type="email"
              id="email"
              v-model="email"
              required
              class="text-input"
            />
            <p v-if="emailVerificationError" class="error-message">
              {{ emailVerificationError }}
            </p>
          </div>
          <button
            @click="verificarEmail"
            :disabled="isSubmitting"
            class="verify-btn primary-btn"
          >
            <span v-if="!isSubmitting">Verificar Email</span>
            <span v-else class="spinner-btn"></span>
          </button>
        </div>
      </transition>

      <transition name="fade">
        <div v-if="isExternalRegistration" class="email-verification-form card">
          <h3>Registro de Académico Externo</h3>
          <p>Por favor, complete la siguiente información:</p>
          <div class="form-group">
            <label for="external-name">Nombre:</label>
            <input
              type="text"
              id="external-name"
              v-model="externalName"
              required
              class="text-input"
            />
          </div>
          <div class="form-group">
            <label for="external-apaterno">Apellido Paterno:</label>
            <input
              type="text"
              id="external-apaterno"
              v-model="externalAPaterno"
              required
              class="text-input"
            />
          </div>
          <div class="form-group">
            <label for="external-amaterno">Apellido Materno:</label>
            <input
              type="text"
              id="external-amaterno"
              v-model="externalAMaterno"
              class="text-input"
            />
          </div>
          <div class="form-group">
            <label for="email">Correo Electrónico:</label>
            <input
              type="email"
              id="email"
              v-model="email"
              required
              class="text-input"
            />
            <p v-if="externalRegistrationError" class="error-message">
              {{ externalRegistrationError }}
            </p>
          </div>
          <button
            @click="registrarAcademicoExterno"
            :disabled="isSubmitting"
            class="verify-btn primary-btn"
          >
            <span v-if="!isSubmitting">Registrar</span>
            <span v-else class="spinner-btn"></span>
          </button>
        </div>
      </transition>

      <transition name="fade">
        <div v-if="externalRegistrationSuccess" class="success-message">
          <div class="success-icon">✓</div>
          <p>¡Registro exitoso! Gracias.</p>
        </div>
      </transition>

      <div v-if="showCuestionario" class="cuestionario-container card">
        <div class="header-section">
          <h2>Cuestionario de Investigación</h2>

          <div class="info-badge">
            <span>Unidad: {{ nombreEscuelaSeleccionada }}</span>
            <span v-if="academicoEncontrado"
              >Investigador: {{ academicoEncontrado.nombre }}
              {{ academicoEncontrado.a_paterno }}</span
            >
            <span v-else-if="externalRegistrationSuccess"
              >Investigador: {{ externalName }} {{ externalAPaterno }}</span
            >
          </div>
        </div>

        <div class="divider"></div>
        <h3 style="font-style: italic">
          Favor contestar las siguientes preguntas, de forma muy breve (que el
          documento final no sea más de 3 planas). No es obligatorio contestar
          todas las preguntas.
        </h3>

        <div class="divider"></div>

        <div
          v-for="(pregunta, index) in preguntasCuestionario"
          :key="pregunta.id_cuestionario"
          class="pregunta-item"
        >
          <div class="pregunta-header">
            <span class="pregunta-number">Pregunta {{ index + 1 }}</span>
          </div>
          <p class="pregunta-text">{{ pregunta.pregunta }}</p>
          <textarea
            v-model="formData.respuestas[index]"
            @input="updateRespuesta(index, $event.target.value)"
            placeholder="Escriba su respuesta detallada aquí..."
            rows="5"
            class="textarea-input"
          ></textarea>
        </div>

        <div class="actions-section">
          <button
            @click="enviarCuestionario"
            :disabled="isSubmitting"
            class="primary-btn submit-btn"
          >
            <span v-if="!isSubmitting">Enviar Cuestionario</span>
            <span v-else class="spinner-btn"></span>
          </button>
        </div>

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
.radio-container {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  cursor: pointer;
}

.radio-container input[type="radio"] {
  display: none;
}

.radio-checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #ccc;
  border-radius: 50%;
  margin-right: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.radio-checkmark::after {
  content: "";
  width: 10px;
  height: 10px;
  background-color: #007bff;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.2s;
}

.radio-container input[type="radio"]:checked + .radio-checkmark::after {
  opacity: 1;
}

.info-badge {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 10px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 5px;
}

.info-badge span {
  font-size: 0.9rem;
  color: #555;
}
</style>
