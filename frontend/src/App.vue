<script setup>
// ... (tu script setup actual, sin cambios aquí)
import { ref, onMounted, computed } from "vue";
import "../src/assets/estilos.css";

// Your environment variables
const urlcuestionario = import.meta.env.VITE_API_URL_CUESTIONARIOS;
const urlacademico = import.meta.env.VITE_API_URL_ACADEMICOS;
const urlUA = import.meta.env.VITE_API_URL_UA;

// State variables
const isAcademico = ref(null); // true for academic, false for external
const selectedUnidadId = ref(null); // Selected unit for academics
const showCuestionario = ref(false);
const isSubmitting = ref(false);
const submitSuccess = ref(false); // Used for brief questionnaire submission alert
const submitError = ref(false);
const isLoading = ref(false);
const loadError = ref(null);

const isVerifyingEmail = ref(false); // Controls email verification step
const emailVerificationError = ref(null);
const email = ref("");

const isInternalAcademicRegistration = ref(false); // New state for internal registration form
const internalRegistrationError = ref(null);
const internalName = ref("");
const internalAPaterno = ref("");
const internalAMaterno = ref("");

const isExternalRegistration = ref(false); // Controls external registration form
const externalRegistrationSuccess = ref(false); // Used for brief alert after external registration
const externalRegistrationError = ref(null);
const externalName = ref("");
const externalAPaterno = ref("");
const externalAMaterno = ref("");

const greetUser = ref(false);
const academicoEncontrado = ref(null); // Stores the found/registered academic's data

const unidadesAcademicas = ref([]);
const academicos = ref([]);
const preguntasCuestionario = ref([]);

const formData = ref({
  respuestas: [],
});

// New state for the final submission success message
const showSubmissionSuccessMessage = ref(false);

const nombreEscuelaSeleccionada = computed(() => {
  if (!selectedUnidadId.value) return "";
  const unidad = unidadesAcademicas.value.find(
    (u) => u.id_unidad === selectedUnidadId.value
  );
  return unidad ? unidad.nombre : "";
});

// Function to load initial data (units, academics, questionnaire)
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

// Load data when the component is mounted
onMounted(cargarDatos);

// Function to reset all relevant states to show the initial verification form
const resetToInitialState = () => {
  isAcademico.value = null;
  selectedUnidadId.value = null;
  showCuestionario.value = false;
  isVerifyingEmail.value = false;
  emailVerificationError.value = null;
  email.value = "";
  isInternalAcademicRegistration.value = false;
  internalRegistrationError.value = null;
  internalName.value = "";
  internalAPaterno.value = "";
  internalAMaterno.value = "";
  isExternalRegistration.value = false;
  externalRegistrationSuccess.value = false; // Reset this flag too for brief message
  externalRegistrationError.value = null;
  externalName.value = "";
  externalAPaterno.value = "";
  externalAMaterno.value = "";
  greetUser.value = false;
  academicoEncontrado.value = null;
  submitSuccess.value = false; // Reset questionnaire submission success (internal alert)
  submitError.value = false; // Reset questionnaire submission error (internal alert)
  showSubmissionSuccessMessage.value = false; // Ensure final success message is hidden
};

// Function to determine the next step based on user's choice (academic or not)
const verificarAcceso = () => {
  greetUser.value = false; // Reset greeting on new access attempt
  if (isAcademico.value === true) {
    // If academic, proceed to email verification
    isVerifyingEmail.value = true;
    isExternalRegistration.value = false; // Ensure external registration is hidden
    isInternalAcademicRegistration.value = false; // Ensure internal registration is hidden
  } else if (isAcademico.value === false) {
    // If not academic, proceed directly to external registration
    isExternalRegistration.value = true;
    isVerifyingEmail.value = false; // Ensure email verification is hidden
    isInternalAcademicRegistration.value = false; // Ensure internal registration is hidden
    // Clear previous academic details if changing from academic path
    academicoEncontrado.value = null;
    email.value = "";
  }
};

// Function to verify email for existing academics
const verificarEmail = () => {
  emailVerificationError.value = null;
  academicoEncontrado.value = academicos.value.find(
    (a) => a.email === email.value
  );

  if (academicoEncontrado.value) {
    // If email found, set selected unit if exists and show questionnaire
    if (academicoEncontrado.value.id_unidad) {
      selectedUnidadId.value = academicoEncontrado.value.id_unidad;
    } else {
      // If academic found but no unit, they must select one
      selectedUnidadId.value = null; // Ensure no pre-selection if unit is null
    }
    showCuestionario.value = true;
    isVerifyingEmail.value = false;
    greetUser.value = true;
  } else {
    // If email not found for academic, prompt for internal registration
    emailVerificationError.value =
      "Correo electrónico no encontrado en el cuerpo académico. Por favor, regístrese como académico interno.";
    isVerifyingEmail.value = false; // Hide email verification
    isInternalAcademicRegistration.value = true; // Show internal registration form
    // Pre-fill internal email for convenience, clear other fields
    internalName.value = "";
    internalAPaterno.value = "";
    internalAMaterno.value = "";
    selectedUnidadId.value = null; // Ensure unit is selected by user
  }
};

// Function to register a new INTERNAL academic
const registrarAcademicoInterno = async () => {
  internalRegistrationError.value = null;
  if (
    !email.value ||
    !internalName.value ||
    !internalAPaterno.value ||
    !selectedUnidadId.value
  ) {
    internalRegistrationError.value =
      "Por favor, complete todos los campos obligatorios (Nombre, Apellido Paterno, Email y Unidad Académica).";
    return;
  }

  const data = {
    nombre: internalName.value,
    email: email.value,
    a_paterno: internalAPaterno.value,
    a_materno: internalAMaterno.value,
    id_unidad: selectedUnidadId.value, // Must provide id_unidad for internal academic
  };

  try {
    isSubmitting.value = true;
    const response = await fetch(urlacademico, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      // Internal registration successful, now reload data and go back to initial screen
      await cargarDatos(); // Reload academic list including the new one
      alert("¡Registro como académico interno exitoso! Ahora puede continuar y acceder al cuestionario."); // User friendly message
      resetToInitialState(); // Go back to the very first step
    } else {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Error al registrar académico interno"
      );
    }
  } catch (error) {
    console.error("Error al registrar académico interno:", error);
    internalRegistrationError.value =
      error.message || "Error al registrar. Por favor, inténtelo de nuevo.";
  } finally {
    isSubmitting.value = false;
  }
};

// Function to register a new EXTERNAL academic
const registrarAcademicoExterno = async () => {
  externalRegistrationError.value = null;
  if (!email.value || !externalName.value || !externalAPaterno.value) {
    externalRegistrationError.value =
      "Por favor, complete todos los campos obligatorios (Nombre, Apellido Paterno, Email).";
    return;
  }

  const data = {
    nombre: externalName.value,
    email: email.value,
    a_paterno: externalAPaterno.value,
    a_materno: externalAMaterno.value,
    id_unidad: null, // External academics don't belong to a specific unit initially
  };

  try {
    isSubmitting.value = true;
    const response = await fetch(urlacademico, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      // External registration successful, now reload data and go back to initial screen
      await cargarDatos(); // Reload academic list (might not be strictly necessary for external, but safe)
      alert("¡Registro como colaborador externo exitoso! Ahora puede continuar y acceder al cuestionario."); // User friendly message
      resetToInitialState(); // Go back to the very first step
    } else {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Error al registrar académico externo"
      );
    }
  } catch (error) {
    console.error("Error al registrar académico externo:", error);
    externalRegistrationError.value =
      error.message || "Error al registrar. Por favor, inténtelo de nuevo.";
  } finally {
    isSubmitting.value = false;
  }
};

// Generates the data payload for the questionnaire submission
const generatePostData = () => {
  // Process answers to convert null/undefined to ""
  const respuestasProcesadas = formData.value.respuestas.map((respuesta) =>
    respuesta === null || respuesta === undefined ? "" : respuesta
  );

  return {
    nombre_investigador: academicoEncontrado.value
      ? academicoEncontrado.value.id_academico
      : null,
    // Use the selectedUnidadId, which is set for internal academics (existing or new)
    // and remains null for external ones.
    escuela: selectedUnidadId.value,
    respuestas: respuestasProcesadas,
  };
};

// Function to submit the questionnaire
const enviarCuestionario = async () => {
  isSubmitting.value = true;
  submitError.value = false; // Reset error message before new attempt

  try {
    // If selectedUnidadId is null for an academic, prompt them to select
    if (isAcademico.value === true && !selectedUnidadId.value) {
      throw new Error(
        "Por favor, seleccione su Unidad Académica antes de enviar el cuestionario."
      );
    }

    const postData = generatePostData();
    console.log("Data to be sent:", postData);

    const response = await fetch(
      "https://kth2025backend-production.up.railway.app/respuestas-cuestionarios",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      }
    );

    if (response.ok) {
      submitSuccess.value = true; // Still use this for brief internal message
      showSubmissionSuccessMessage.value = true; // NEW: Show final success message
      showCuestionario.value = false; // Hide questionnaire
      // Optionally clear form data or reset to initial state if desired after final message
      // For now, only hiding questionnaire and showing success message.
      // If you want to reset everything back to initial choice after this message,
      // you'd call resetToInitialState() here after a short delay for user to read.
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error en el envío");
    }
  } catch (error) {
    submitError.value = error.message; // Set the actual error message
    console.error("Error al enviar el cuestionario:", error);
  } finally {
    isSubmitting.value = false;
  }
};

// Helper to update specific response in formData
const updateRespuesta = (index, value) => {
  formData.value.respuestas[index] = value;
};
</script>

<template>
  <div class="welcome-container">
    <header>
      <img src="https://pucv.cl/uuaa/site/artic/20180620/imag/foto_0000000120180620105732.png" alt="Logo Universidad"
        class="logo" />
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
      <!-- Initial Verification Form (Choose Academic/External) -->
      <div v-if="
        !showCuestionario &&
        !isVerifyingEmail &&
        !isExternalRegistration &&
        !isInternalAcademicRegistration &&
        !submitSuccess &&
        !externalRegistrationSuccess &&
        !showSubmissionSuccessMessage
      " class="verification-form card">
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

        <!-- Botón "Continuar" para el formulario inicial -->
        <div class="form-actions-center">
          <!-- Clase para centrar el botón si solo hay uno -->
          <button @click="verificarAcceso" :disabled="isAcademico === null || isSubmitting"
            class="verify-btn primary-btn">
            <span v-if="!isSubmitting">Continuar</span>
            <span v-else class="spinner-btn"></span>
          </button>
        </div>
      </div>

      <!-- Email Verification Form for Academics -->
      <transition name="fade">
        <div v-if="isVerifyingEmail" class="email-verification-form card">
          <h3>Verificación de Email (Académico)</h3>
          <p>
            Por favor, ingrese su correo electrónico institucional para
            verificar su identidad como académico.
          </p>
          <div class="form-group">
            <label for="email">Correo Electrónico:</label>
            <input type="email" id="email" v-model="email" required class="text-input" />
            <p v-if="emailVerificationError" class="error-message">
              {{ emailVerificationError }}
            </p>
          </div>
          <!-- Nuevo contenedor para los botones -->
          <div class="form-actions">
            <button @click="resetToInitialState()" class="secondary-btn back-btn">
              Volver
            </button>
            <button @click="verificarEmail" :disabled="isSubmitting" class="verify-btn primary-btn">
              <span v-if="!isSubmitting">Verificar Email</span>
              <span v-else class="spinner-btn"></span>
            </button>
          </div>
        </div>
      </transition>

      <!-- Internal Academic Registration Form (if academic email not found) -->
      <transition name="fade">
        <div v-if="isInternalAcademicRegistration" class="email-registration-form card">
          <h3>Registro de Académico Interno</h3>
          <p>
            Su email no fue encontrado. Por favor, complete sus datos como académico.
          </p>
          <div class="form-group">
            <label for="internal-name">Nombre:</label>
            <input type="text" id="internal-name" v-model="internalName" required class="text-input" />
          </div>
          <div class="form-group">
            <label for="internal-apaterno">Apellido Paterno:</label>
            <input type="text" id="internal-apaterno" v-model="internalAPaterno" required class="text-input" />
          </div>
          <div class="form-group">
            <label for="internal-amaterno">Apellido Materno:</label>
            <input type="text" id="internal-amaterno" v-model="internalAMaterno" class="text-input" />
          </div>
          <div class="form-group">
            <label for="email-internal-reg">Correo Electrónico:</label>
            <input type="email" id="email-internal-reg" v-model="email" required class="text-input" />
          </div>
          <div class="form-group">
            <label for="unidadAcademicaReg">Unidad Académica:</label>
            <select id="unidadAcademicaReg" v-model="selectedUnidadId" class="select-input" required>
              <option value="" disabled>Seleccione su unidad</option>
              <option v-for="unidad in unidadesAcademicas" :key="unidad.id_unidad" :value="unidad.id_unidad">
                {{ unidad.nombre }}
              </option>
            </select>
          </div>
          <p v-if="internalRegistrationError" class="error-message">
            {{ internalRegistrationError }}
          </p>
          <!-- Nuevo contenedor para los botones -->
          <div class="form-actions">
            <button @click="resetToInitialState()" class="secondary-btn back-btn">
              Volver
            </button>
            <button @click="registrarAcademicoInterno" :disabled="isSubmitting" class="verify-btn primary-btn">
              <span v-if="!isSubmitting">Registrar y Volver al Inicio</span>
              <span v-else class="spinner-btn"></span>
            </button>
          </div>
        </div>
      </transition>

      <!-- External Academic Registration Form -->
      <transition name="fade">
        <div v-if="isExternalRegistration" class="email-registration-form card">
          <h3>Registro de Colaborador Externo</h3>
          <p>
            Por favor, complete la siguiente información para registrarse como
            colaborador externo y acceder al cuestionario.
          </p>
          <div class="form-group">
            <label for="external-name">Nombre:</label>
            <input type="text" id="external-name" v-model="externalName" required class="text-input" />
          </div>
          <div class="form-group">
            <label for="external-apaterno">Apellido Paterno:</label>
            <input type="text" id="external-apaterno" v-model="externalAPaterno" required class="text-input" />
          </div>
          <div class="form-group">
            <label for="external-amaterno">Apellido Materno:</label>
            <input type="text" id="external-amaterno" v-model="externalAMaterno" class="text-input" />
          </div>
          <div class="form-group">
            <label for="email-external">Correo Electrónico:</label>
            <input type="email" id="email-external" v-model="email" required class="text-input" />
            <p v-if="externalRegistrationError" class="error-message">
              {{ externalRegistrationError }}
            </p>
          </div>
          <!-- Nuevo contenedor para los botones -->
          <div class="form-actions">
            <button @click="resetToInitialState()" class="secondary-btn back-btn">
              Volver
            </button>
            <button @click="registrarAcademicoExterno" :disabled="isSubmitting" class="verify-btn primary-btn">
              <span v-if="!isSubmitting">Registrar y Volver al Inicio</span>
              <span v-else class="spinner-btn"></span>
            </button>
          </div>
        </div>
      </transition>

      <!-- User Greeting (for both existing and newly registered) -->
      <transition name="fade">
        <div v-if="greetUser" class="success-message initial-greeting">
          <div class="success-icon">👋</div>
          <p v-if="academicoEncontrado">
            ¡Hola, {{ academicoEncontrado.nombre }}
            {{ academicoEncontrado.a_paterno }}! Bienvenid@ al cuestionario.
          </p>
        </div>
      </transition>

      <!-- Questionnaire Section -->
      <div v-if="showCuestionario" class="cuestionario-container card">
        <div class="header-section">
          <h2>Cuestionario de Investigación</h2>

          <div class="info-badge">
            <!-- Show unit only if an internal academic is identified and has a unit -->
            <span v-if="isAcademico === true && selectedUnidadId">Unidad: {{ nombreEscuelaSeleccionada }}</span>
            <span v-if="academicoEncontrado">Investigador: {{ academicoEncontrado.nombre }}
              {{ academicoEncontrado.a_paterno }}</span>
            <span v-else-if="externalName">Colaborador: {{ externalName }} {{ externalAPaterno }}</span>
          </div>
        </div>

        <div class="divider"></div>
        <h3 style="font-style: italic">
          Favor contestar las siguientes preguntas, de forma muy breve (que el
          documento final no sea más de 3 planas). No es obligatorio contestar
          todas las preguntas.
        </h3>

        <div class="divider"></div>

        <!-- Dynamic selection of Unidad Académica AFTER email verification if needed -->
        <div class="form-group" v-if="
          isAcademico === true && !selectedUnidadId && academicoEncontrado
        ">
          <label for="unidadAcademicaFinal">Por favor, seleccione su Unidad Académica:</label>
          <select id="unidadAcademicaFinal" v-model="selectedUnidadId" class="select-input" required>
            <option value="" disabled>Seleccione una unidad</option>
            <option v-for="unidad in unidadesAcademicas" :key="unidad.id_unidad" :value="unidad.id_unidad">
              {{ unidad.nombre }}
            </option>
          </select>
          <p v-if="submitError && !selectedUnidadId" class="error-message">
            Debe seleccionar una unidad académica.
          </p>
        </div>

        <div v-for="(pregunta, index) in preguntasCuestionario" :key="pregunta.id_cuestionario" class="pregunta-item">
          <div class="pregunta-header">
            <span class="pregunta-number">Pregunta {{ index + 1 }}</span>
          </div>
          <p class="pregunta-text">{{ pregunta.pregunta }}</p>
          <textarea v-model="formData.respuestas[index]" @input="updateRespuesta(index, $event.target.value)"
            placeholder="Escriba su respuesta detallada aquí..." rows="5" class="textarea-input"></textarea>
        </div>

        <div class="actions-section">
          <button @click="enviarCuestionario" :disabled="isSubmitting" class="primary-btn submit-btn">
            <span v-if="!isSubmitting">Enviar Cuestionario</span>
            <span v-else class="spinner-btn"></span>
          </button>
        </div>

        <!-- Submission Error Message for Questionnaire (within questionnaire view) -->
        <div v-if="submitError" class="error-message">
          <div class="error-icon">⚠️</div>
          <p>{{ submitError }}</p>
        </div>
      </div>

      <!-- Final Questionnaire Submission Success Message (replaces the questionnaire) -->
      <transition name="fade">
        <div v-if="showSubmissionSuccessMessage" class="final-success-message card">
          <div class="success-icon big-icon">✓</div>
          <h2>¡Respuestas Enviadas con Éxito!</h2>
          <p>Nuestros evaluadores estudiarán su proyecto próximamente.</p>
          <p>¡Gracias por contribuir!</p>
          <button @click="resetToInitialState()" class="primary-btn reset-app-btn">
            Volver al Inicio
          </button>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
/* Add the initial-greeting class */
.initial-greeting {
  animation: fadeIn 0.5s ease-out;
  margin-top: 20px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to

/* .fade-leave-active in <2.1.8 */
  {
  opacity: 0;
}

/* Ensure the spinner for buttons is visible */
.spinner-btn {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
  -webkit-animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    -webkit-transform: rotate(360deg);
  }
}

@-webkit-keyframes spin {
  to {
    -webkit-transform: rotate(360deg);
  }
}

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

.radio-container input[type="radio"]:checked+.radio-checkmark::after {
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

.back-btn {
  margin-top: 15px;
  background-color: #6c757d;
  /* Gray color for secondary action */
}

.back-btn:hover {
  background-color: #5a6268;
}

/* New styles for the final success message */
.final-success-message {
  text-align: center;
  padding: 40px 20px;
  margin-top: 50px;
  background-color: #e6ffe6;
  /* Light green background */
  border: 1px solid #a3e6a3;
  /* Green border */
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.8s ease-out;
}

.final-success-message .big-icon {
  font-size: 60px;
  color: #28a745;
  /* Green checkmark */
  margin-bottom: 20px;
}

.final-success-message h2 {
  color: #28a745;
  margin-bottom: 15px;
}

.final-success-message p {
  font-size: 1.1rem;
  color: #333;
  line-height: 1.6;
  margin-bottom: 10px;
}

.final-success-message .reset-app-btn {
  margin-top: 30px;
  padding: 12px 25px;
  font-size: 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.final-success-message .reset-app-btn:hover {
  background-color: #0056b3;
}

/* Estilo para agrupar y separar los botones en los formularios de registro */
.form-actions {
  display: flex;
  justify-content: space-between;
  /* Esto empuja un botón a cada extremo */
  align-items: center;
  /* Opcional: alinea verticalmente si los botones tienen diferente altura */
  margin-top: 20px;
  /* Espacio superior para separarlo de los campos */
}

/* Puedes ajustar el padding del botón volver si lo necesitas */
.back-btn {
  /* Si ya tienes estilos específicos para .back-btn, mantenlos aquí. */
  /* Por ejemplo, para que tenga el mismo padding que el primary-btn si no lo tiene. */
  padding: 0.8rem 1.8rem;
}

/* Asegúrate de que el botón de verificar email también tenga el botón "Volver" con flexbox */
.email-verification-form .form-group+button {
  /* Este selector actualmente aplica al primer botón después de form-group */
  /* Si quieres el mismo comportamiento para 'Verificar Email' y 'Volver', */
  /* también necesitarías envolverlos en un div.form-actions. */
  /* Para tu caso actual: */
  margin-right: 10px;
  /* Agrega un pequeño margen entre "Verificar Email" y "Volver" */
}

/* Modificación para el formulario de verificación de email también */
.email-verification-form {
  /* Asegura que el formulario completo maneje el espacio si los botones no están en .form-actions */
  /* O, mejor aún, aplica .form-actions aquí también para consistencia */
}
</style>