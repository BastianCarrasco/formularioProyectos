<script setup>
import { ref, onMounted, computed } from "vue";
import "../src/assets/estilos.css"; // Mantén tus estilos globales

// Importar los nuevos componentes
import InitialAccessForm from "./components/InitialAccessForm.vue";
import EmailVerificationForm from "./components/EmailVerificationForm.vue";
import InternalAcademicRegistrationForm from "./components/InternalAcademicRegistrationForm.vue";
import ExternalCollaboratorRegistrationForm from "./components/ExternalCollaboratorRegistrationForm.vue";
import QuestionnaireForm from "./components/QuestionnaireForm.vue";
import SubmissionSuccessMessage from "./components/SubmissionSuccessMessage.vue";

// Your environment variables
const urlcuestionario = import.meta.env.VITE_API_URL_CUESTIONARIOS;
const urlacademico = import.meta.env.VITE_API_URL_ACADEMICOS;
const urlUA = import.meta.env.VITE_API_URL_UA;
// Nueva URL para el envío de respuestas
const urlRespuestas = import.meta.env.VITE_API_URL_RESPUESTAS;

// State variables (mostly unchanged, managed in App.vue)
const isAcademico = ref(null); // true for academic, false for external
const selectedUnidadId = ref(null); // Selected unit for academics
const showCuestionario = ref(false);
const isSubmitting = ref(false); // Used for all form submissions
const isLoading = ref(false); // For initial data load
const loadError = ref(null); // For initial data load error

// CAMBIO CLAVE: Los pasos ahora incluirán 'submission-success'
const currentStep = ref("initial"); // New state to control which component is shown

const email = ref(""); // Email input across various forms
const academicoEncontrado = ref(null); // Stores the found/registered academic's data

// Internal Registration states (data to be sent)
const internalRegData = ref({
  name: "",
  aPaterno: "",
  aMaterno: "",
  email: "",
  id_unidad: null,
});
const internalRegistrationError = ref(null);

// External Registration states (data to be sent)
const externalRegData = ref({
  name: "",
  aPaterno: "",
  aMaterno: "",
});
const externalRegistrationError = ref(null);

// NUEVO ESTADO: Para controlar si estamos añadiendo una nueva unidad académica
const isAddingNewUnidad = ref(false);

const unidadesAcademicas = ref([]);
const academicos = ref([]); // Full list of academics from API
const preguntasCuestionario = ref([]);

const formData = ref({
  respuestas: [], // Array to hold answers
});

const showSubmissionSuccessMessage = ref(false);

// Function to load initial data (units, academics, questionnaire)
async function cargarDatos() {
  try {
    isLoading.value = true;
    loadError.value = null; // Clear previous errors

    const [uaResponse, acResponse, cuResponse] = await Promise.all([
      fetch(urlUA).then((res) => {
        if (!res.ok) throw new Error("Error al cargar Unidades Académicas");
        return res.json();
      }),
      fetch(urlacademico).then((res) => {
        if (!res.ok) throw new Error("Error al cargar Académicos");
        return res.json();
      }),
      fetch(urlcuestionario).then((res) => {
        if (!res.ok) throw new Error("Error al cargar Cuestionario");
        return res.json();
      }),
    ]);

    unidadesAcademicas.value = uaResponse;
    academicos.value = acResponse;
    preguntasCuestionario.value = cuResponse;
    formData.value.respuestas = Array(
      preguntasCuestionario.value.length
    ).fill("");
  } catch (error) {
    console.error("Error al cargar datos:", error);
    loadError.value =
      error.message ||
      "Error al cargar los datos. Por favor intente más tarde.";
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
  currentStep.value = "initial"; // Reset to the very first step
  email.value = "";
  academicoEncontrado.value = null;

  internalRegData.value = {
    name: "",
    aPaterno: "",
    aMaterno: "",
    email: "",
    id_unidad: null,
  };
  internalRegistrationError.value = null;

  externalRegData.value = {
    name: "",
    aPaterno: "",
    aMaterno: "",
    email: "",
  };
  externalRegistrationError.value = null;

  isAddingNewUnidad.value = false; // Reset the new unidad state

  showSubmissionSuccessMessage.value = false; // Ensure final success message is hidden
  formData.value.respuestas = Array(
    preguntasCuestionario.value.length
  ).fill("");
};

// --- Handlers for emitted events from child components ---

const handleContinueAccess = (isAcademicChoice) => {
  isAcademico.value = isAcademicChoice;
  if (isAcademico.value === true) {
    currentStep.value = "verify-email";
  } else {
    currentStep.value = "external-registration";
    email.value = ""; // Clear email for external path
  }
};

const handleVerifyEmail = (enteredEmail) => {
  email.value = enteredEmail; // Update parent's email state
  internalRegistrationError.value = null; // Clear previous errors

  academicoEncontrado.value = academicos.value.find(
    (a) => a.email === email.value
  );

  if (academicoEncontrado.value) {
    selectedUnidadId.value = null; // Reset project unit for new questionnaire
    showCuestionario.value = true;
    currentStep.value = "questionnaire";
  } else {
    internalRegistrationError.value =
      "Correo electrónico no encontrado en el cuerpo académico. Por favor, regístrese como académico interno.";
    currentStep.value = "internal-registration";
    internalRegData.value.email = email.value; // Pre-fill internal form
  }
};

const handleRegisterInternalAcademic = async (regData) => {
  internalRegistrationError.value = null;
  if (
    !regData.email ||
    !regData.name ||
    !regData.aPaterno ||
    !regData.id_unidad
  ) {
    internalRegistrationError.value =
      "Por favor, complete todos los campos obligatorios (Nombre, Apellido Paterno, Email y Unidad Académica).";
    return;
  }

  const dataToSend = {
    nombre: regData.name,
    email: regData.email,
    a_paterno: regData.aPaterno,
    a_materno: regData.aMaterno,
    id_unidad: regData.id_unidad,
  };

  try {
    isSubmitting.value = true;
    const response = await fetch(urlacademico, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSend),
    });

    if (response.ok) {
      academicoEncontrado.value = await response.json();
      await cargarDatos(); // Recargar datos para que la nueva unidad esté en la lista
      alert(
        "¡Registro como académico interno exitoso! Ahora puede continuar y acceder al cuestionario."
      );
      currentStep.value = "questionnaire";
      showCuestionario.value = true;
      selectedUnidadId.value = null; // Reset project unit for new questionnaire
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

const handleRegisterExternalCollaborator = async (regData) => {
  externalRegistrationError.value = null;
  if (!regData.email || !regData.name || !regData.aPaterno) {
    externalRegistrationError.value =
      "Por favor, complete todos los campos obligatorios (Nombre, Apellido Paterno, Email).";
    return;
  }

  const dataToSend = {
    nombre: regData.name,
    email: regData.email,
    a_paterno: regData.aPaterno,
    a_materno: regData.aMaterno,
    id_unidad: regData.id_unidad, // Utilizar la unidad seleccionada por el externo (puede ser null)
  };

  try {
    isSubmitting.value = true;
    const response = await fetch(urlacademico, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSend),
    });

    if (response.ok) {
      academicoEncontrado.value = await response.json();
      await cargarDatos(); // Recargar datos para que la nueva unidad esté en la lista
      alert(
        "¡Registro como colaborador externo exitoso! Ahora puede continuar y acceder al cuestionario."
      );
      currentStep.value = "questionnaire";
      showCuestionario.value = true;
      isAcademico.value = false;
      selectedUnidadId.value = null; // Reset project unit for new questionnaire
    } else {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Error al registrar colaborador externo"
      );
    }
  } catch (error) {
    console.error("Error al registrar colaborador externo:", error);
    externalRegistrationError.value =
      error.message || "Error al registrar. Por favor, inténtelo de nuevo.";
  } finally {
    isSubmitting.value = false;
  }
};

// NUEVA FUNCIÓN: Maneja la adición de una nueva unidad académica
// NUEVA FUNCIÓN: Maneja la adición de una nueva unidad académica
const handleAddNewUnidad = async (nombreNuevaUnidad) => {
  isAddingNewUnidad.value = true;
  externalRegistrationError.value = null; // Limpiar errores previos
  try {
    const response = await fetch(urlUA, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: nombreNuevaUnidad }), // <--- AQUÍ ESTÁ LA CLAVE
    });

    if (response.ok) {
      const nuevaUnidad = await response.json();
      await cargarDatos(); // Recargar todas las unidades para asegurar que la lista esté actualizada

      alert(`Unidad "${nuevaUnidad.nombre}" añadida exitosamente.`);
    } else {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Error al añadir la nueva unidad académica"
      );
    }
  } catch (error) {
    console.error("Error al añadir nueva unidad:", error);
    externalRegistrationError.value =
      error.message || "No se pudo añadir la unidad. Inténtelo de nuevo.";
  } finally {
    isAddingNewUnidad.value = false;
  }
};

// Generates the data payload for the questionnaire submission
const generatePostData = () => {
  const postData = {
    nombre_investigador: academicoEncontrado.value
      ? academicoEncontrado.value.id_academico
      : null,
    escuela: selectedUnidadId.value,
  };

  formData.value.respuestas.forEach((respuesta, index) => {
    postData[`respuesta_${index + 1}`] =
      respuesta === null || respuesta === undefined ? "" : respuesta;
  });

  for (let i = 1; i <= 9; i++) {
    if (!postData[`respuesta_${i}`]) {
      postData[`respuesta_${i}`] = "";
    }
  }

  return postData;
};

// Modificado para recibir un mensaje de error de validación desde el hijo
const handleQuestionnaireSubmission = async (validationErrorMessage = null) => {
  isSubmitting.value = true;
  internalRegistrationError.value = null; // Limpiar errores antes de un nuevo intento

  if (validationErrorMessage) {
    // Si el componente QuestionnaireForm envía un error de validación (ej. unidad no seleccionada)
    internalRegistrationError.value = validationErrorMessage;
    isSubmitting.value = false;
    return; // Detener el proceso de envío
  }

  try {
    const postData = generatePostData();
    console.log("Data to be sent:", postData);

    const response = await fetch(urlRespuestas, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postData),
    });

    if (response.ok) {
      // ÉXITO: Cambiar el paso para mostrar solo el mensaje de éxito
      currentStep.value = "submission-success"; // <-- CAMBIO CLAVE
      showSubmissionSuccessMessage.value = true; // Asegurarse de que el componente de éxito sepa que es su turno
      showCuestionario.value = false; // Esto ahora es redundante pero no hace daño
    } else {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Error en el envío del cuestionario"
      );
    }
  } catch (error) {
    internalRegistrationError.value = error.message;
    console.error("Error al enviar el cuestionario:", error);
  } finally {
    isSubmitting.value = false;
  }
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
      <!-- Step 1: Initial Access Choice -->
      <InitialAccessForm v-if="currentStep === 'initial'" @continue-access="handleContinueAccess" />

      <!-- Step 2: Email Verification for Academics -->
      <EmailVerificationForm v-if="currentStep === 'verify-email'" :initial-email="email"
        :error-message="internalRegistrationError" :is-submitting="isSubmitting" @verify-email="handleVerifyEmail"
        @back="resetToInitialState" />

      <!-- Step 3a: Internal Academic Registration (if email not found) -->
      <InternalAcademicRegistrationForm v-if="currentStep === 'internal-registration'" :initial-email="email"
        :unidades-academicas="unidadesAcademicas" :error-message="internalRegistrationError"
        :is-submitting="isSubmitting" @register-internal="handleRegisterInternalAcademic" @back="resetToInitialState" />

      <!-- Step 3b: External Collaborator Registration -->
      <ExternalCollaboratorRegistrationForm v-if="currentStep === 'external-registration'" :initial-email="email"
        :error-message="externalRegistrationError" :is-submitting="isSubmitting"
        :unidades-academicas="unidadesAcademicas" :is-adding-new-unidad="isAddingNewUnidad"
        @register-external="handleRegisterExternalCollaborator" @back="resetToInitialState"
        @add-new-unidad="handleAddNewUnidad" />
      <!-- ^^^ NUEVA PROP Y NUEVO EMIT HANDLER AÑADIDOS AQUÍ ^^^ -->

      <!-- User Greeting (shown before questionnaire if relevant) -->
      <transition name="fade">
        <div v-if="currentStep === 'questionnaire' && academicoEncontrado" class="success-message initial-greeting">
          <div class="success-icon">👋</div>
          <p>
            ¡Hola, {{ academicoEncontrado.nombre }}
            {{ academicoEncontrado.a_paterno }}! Bienvenid@ al cuestionario.
          </p>
        </div>
      </transition>

      <!-- Step 4: Questionnaire -->
      <QuestionnaireForm v-if="currentStep === 'questionnaire'" :preguntas="preguntasCuestionario"
        :initial-respuestas="formData.respuestas" @update:respuestas="(newVal) => (formData.respuestas = newVal)"
        :academico-info="academicoEncontrado" :external-info="!isAcademico
          ? { name: externalRegData.name, aPaterno: externalRegData.aPaterno }
          : null
          " :unidades-academicas="unidadesAcademicas" :selected-unidad-id="selectedUnidadId"
        @update:selected-unidad-id="(id) => (selectedUnidadId = id)" :is-academico="isAcademico"
        :submit-error="internalRegistrationError" :is-submitting="isSubmitting"
        @submit-questionnaire="handleQuestionnaireSubmission" />

      <!-- Final Submission Success Message -->
      <SubmissionSuccessMessage v-if="currentStep === 'submission-success'" @reset-app="resetToInitialState" />
    </div>
  </div>
</template>

<style scoped></style>