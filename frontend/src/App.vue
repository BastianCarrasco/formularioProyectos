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
  email: "",
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
    // Asegurarse de que formData.respuestas se inicialice como un array en App.vue
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
    // CAMBIO CLAVE AQUÍ: No cambiar de paso, solo mostrar el error
    internalRegistrationError.value =
      "El correo electrónico ingresado no se encuentra registrado en nuestra base de datos académica. Por favor, vuelva al inicio para registrarse como colaborador externo.";
    currentStep.value = "verify-email"; // Mantener en el mismo paso
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
  // Handle validation error passed from child
  if (regData.validationError) {
    externalRegistrationError.value = regData.validationError;
    return;
  }

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
      // ******* CAMBIO CLAVE AQUÍ *******
      // En lugar de cargarDatos(), añadir el nuevo académico a la lista existente
      // Esto asume que `academicos.value` es un array que contiene todos los académicos
      academicos.value.push(academicoEncontrado.value);

      alert(
        "¡Registro como colaborador externo exitoso! Ahora puede continuar y acceder al cuestionario."
      );
      currentStep.value = "questionnaire";
      showCuestionario.value = true;
      isAcademico.value = false; // Confirmar que es un colaborador externo
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
// ... (código existente)

const handleAddNewUnidad = async (nombreNuevaUnidad) => {
  isAddingNewUnidad.value = true;
  externalRegistrationError.value = null; // Limpiar errores previos
  try {
    const response = await fetch(urlUA, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: nombreNuevaUnidad }),
    });

    if (response.ok) {
      const nuevaUnidad = await response.json();
      // ******* CAMBIO CLAVE AQUÍ *******
      // Añadir la nueva unidad directamente al array reactivo
      unidadesAcademicas.value.push(nuevaUnidad);

      // También puedes ordenar la lista si quieres que aparezca en un orden específico
      // unidadesAcademicas.value.sort((a, b) => a.nombre.localeCompare(b.nombre));

      // Si necesitas seleccionar la unidad recién añadida en el formulario hijo,
      // podrías emitir un evento de vuelta al hijo o asignarla aquí si el control
      // lo permite (ej. si `selectedUnidadId` controla el campo en el hijo).
      // Por ejemplo, si el id de la nueva unidad es necesario para la selección:
      // Si el campo de selección de unidad en ExternalCollaboratorRegistrationForm
      // está enlazado con v-model a `externalRegData.id_unidad`, podrías hacer:
      // externalRegData.value.id_unidad = nuevaUnidad.id_unidad; // Asegúrate de que el id sea correcto

      alert(
        `Unidad "${nuevaUnidad.nombre}" añadida exitosamente y seleccionada.`
      );
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
    // Aquí es importante usar el ID del académico/colaborador encontrado/registrado
    nombre_investigador: academicoEncontrado.value
      ? academicoEncontrado.value.id_academico // Si es académico, usa su ID
      : null, // Si es null, el backend deberá manejarlo como un colaborador sin ID directo o un error
    escuela: selectedUnidadId.value, // El ID de la unidad académica seleccionada
  };

  // Rellenar las respuestas dinámicamente
  formData.value.respuestas.forEach((respuesta, index) => {
    // Asegurarse de que las respuestas sean strings, incluso si están vacías
    postData[`respuesta_${index + 1}`] =
      respuesta === null || respuesta === undefined ? "" : String(respuesta);
  });

  // Asegurarse de que todas las 9 respuestas existan en el payload, aunque estén vacías
  // Esto es para cumplir con la estructura del backend si siempre espera 9 respuestas
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
    console.log("Data to be sent:", JSON.stringify(postData)); // Para depuración, ver el JSON

    const response = await fetch(urlRespuestas, { // urlRespuestas ya debería ser la URL correcta
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
    <header class="app-header">
      <!-- Moved header content into a new container for max-width centering -->
      <div class="header-inner-content">
        <img src="../src/assets/logo-fin.png" alt="Logo Universidad" class="logo" />
        <div class="header-text">
          <h1>Perfil de Proyecto Innovación Tecnológica</h1>

        </div>
      </div>
      <!-- Optional: <nav class="main-nav">...</nav> could also be inside header-inner-content -->
    </header>

    <!-- Main content area wrapper for consistent containment -->
    <main class="main-content-wrapper">
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
          :is-submitting="isSubmitting" @register-internal="handleRegisterInternalAcademic"
          @back="resetToInitialState" />

        <!-- Step 3b: External Collaborator Registration -->
        <ExternalCollaboratorRegistrationForm v-if="currentStep === 'external-registration'" :initial-email="email"
          :error-message="externalRegistrationError" :is-submitting="isSubmitting"
          :unidades-academicas="unidadesAcademicas" :is-adding-new-unidad="isAddingNewUnidad"
          @register-external="handleRegisterExternalCollaborator" @back="resetToInitialState"
          @add-new-unidad="handleAddNewUnidad" />

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
          v-model:initial-respuestas="formData.respuestas" :academico-info="academicoEncontrado" :external-info="!isAcademico
            ? {
              name: externalRegData.name,
              aPaterno: externalRegData.aPaterno,
            }
            : null
            " :unidades-academicas="unidadesAcademicas" v-model:selected-unidad-id="selectedUnidadId"
          :is-academico="isAcademico" :submit-error="internalRegistrationError" :is-submitting="isSubmitting"
          @submit-questionnaire="handleQuestionnaireSubmission" />

        <!-- Final Submission Success Message -->
        <SubmissionSuccessMessage v-if="currentStep === 'submission-success'" @reset-app="resetToInitialState" />
      </div>
    </main>

    <footer class="app-footer">
      <div class="footer-inner-content">
        <!-- Contenedor para los logos -->
        <div class="footer-logos">

          <img src="../src/assets/Escudo-PUCV.svg" alt="Logo PUCV" class="footer-logo" />
          <img src="../src/assets/AC.svg" alt="Logo AC" class="footer-logo" />
          <img src="../src/assets/CNA.svg" alt="Logo CNA" class="footer-logo" />
          <img src="../src/assets/LOGO_G9.svg" alt="Logo G9" class="footer-logo" />
        </div>

        <!-- Contenedor para la información de texto -->
        <div class="footer-text-info">
          <p>&copy; {{ new Date().getFullYear() }} Pontificia Universidad Católica de Valparaíso</p>
          <p>Dirección: Av. Brasil 2950, Valparaíso, Chile</p>
          <p>Contacto: <a href="mailto:decanato.ingenieria@pucv.cl">decanato.ingenieria@pucv.cl</a></p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* General Layout */
.welcome-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: 'Lato', sans-serif;
  /* Apply Lato to the entire app */
}

/* Header Styles */
.app-header {
  background-color: #2E5C8A;
  color: white;
  padding: 1.2rem 0;
  /* Aumentado el padding vertical para más altura */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
}

.header-inner-content {
  display: flex;
  align-items: center;
  gap: 2rem;
  /* Aumentado el gap para más espacio entre logo y texto */
  max-width: 1200px;
  /* <--- AUMENTADO: Un ancho máximo mayor para el header */
  margin: 0 auto;
  padding: 0 4rem;
  /* <--- AUMENTADO: Más padding lateral para el efecto de "más ancho" */
  flex-wrap: nowrap;
  /* Evita que el logo y texto se envuelvan */
  justify-content: flex-start;
  /* Alinea los elementos al inicio */
}

.app-header .logo {
  height: 90px;
  /* Aumentado la altura del logo */
  width: auto;
  /* <--- Mantiene el ancho automático para preservar la proporción */
  flex-shrink: 0;
  display: block;
  object-fit: contain;
}

.header-text {
  flex-grow: 1;
  min-width: 300px;
  /* Mínimo ancho para el texto para que no se comprima demasiado */
}

.header-text h1 {
  margin: 0;
  font-size: 2.2rem;
  /* <--- AUMENTADO: Más grande para que se vea más prominente */
  line-height: 1.2;
  color: white;
  font-weight: 700;
}

.header-text .subtitle {
  margin: 0.5rem 0 0;
  /* Ajustado el margen */
  font-size: 1.1rem;
  /* Más grande para que se lea mejor */
  opacity: 0.9;
  color: white;
  font-weight: 300;
}

/* Main Content Area Wrapper */
.main-content-wrapper {
  flex-grow: 1;
  padding: 2.5rem 0;
  /* <--- CAMBIO CLAVE: Aumenta padding vertical para espacio con header/footer */
  max-width: 100%;
  /* Ocupa todo el ancho disponible */
  margin: 0;
  /* Sin márgenes laterales */
  width: 100%;
  box-sizing: border-box;
  color: #333;
  display: flex;
  /* Añadir flex para centrar los componentes si App.vue no es quien los centra */
  justify-content: center;
  /* Centrar horizontalmente */
  align-items: flex-start;
  /* Alinea al inicio verticalmente (o center si quieres el componente en el medio de la pantalla) */
}

/* Existing styles for loading/error messages, spinners, buttons, success messages */
.loading,
.error {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #555;
  width: 100%;
  /* Asegura que estos mensajes también se centren si el main es flex */
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top: 4px solid #007bff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.retry-btn {
  background-color: #007bff;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
  font-family: 'Lato', sans-serif;
}

.retry-btn:hover {
  background-color: #0056b3;
}

.success-message {
  padding: 1.5rem;
  background-color: #e6ffed;
  border: 1px solid #a8e6b9;
  color: #1a5e2e;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 2rem;
}

.success-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

/* Footer Styles */
.app-footer {
  background-color: #2E5C8A;
  color: white;
  padding: 1.5rem 0;
  /* Aumentar un poco el padding vertical para más espacio */
  text-align: center;
  border-top: 1px solid #e0e0e0;
  font-size: 0.9rem;
  margin-top: auto;
  width: 100%;
}

.footer-inner-content {
  max-width: 1200px;
  /* Un poco más ancho para los logos */
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  flex-direction: column;
  /* Apila logos y texto verticalmente por defecto */
  align-items: center;
  /* Centra los bloques de contenido */
  gap: 1.5rem;
  /* Espacio entre el bloque de logos y el de texto */
}

.footer-logos {
  display: flex;
  justify-content: center;
  /* Centra los logos horizontalmente */
  align-items: center;
  flex-wrap: wrap;
  /* Permite que los logos se envuelvan en pantallas pequeñas */
  gap: 1rem;
  /* Espacio entre cada logo */
  margin-bottom: 1rem;
  /* Espacio entre los logos y el texto */
}

.footer-logo {
  /* Nueva clase para los logos del footer */
  height: 50px;
  /* Ajusta la altura de los logos para que no sean demasiado grandes */
  width: auto;
  object-fit: contain;
  flex-shrink: 0;
  /* Evita que los logos se encojan demasiado */
}

.footer-text-info {
  /* Nueva clase para la información de texto */
  display: flex;
  flex-wrap: wrap;
  /* Permite que el texto se envuelva */
  justify-content: center;
  gap: 0.8rem 1.5rem;
  /* Espacio vertical y horizontal entre los elementos de texto */
  text-align: center;
  /* Centra el texto */
}

.footer-text-info p {
  /* Estilo específico para los párrafos dentro de footer-text-info */
  margin: 0;
  color: white;
}

.footer-text-info a {
  /* Estilo específico para los enlaces dentro de footer-text-info */
  color: #c9e1f5;
  text-decoration: none;
}

.footer-text-info a:hover {
  text-decoration: underline;
}


/* Adjustments for responsiveness */
@media (max-width: 768px) {

  .header-inner-content {
    /* Header */
    padding: 0 1rem;
    gap: 0.5rem;
    flex-direction: column;
    text-align: center;
  }

  .app-header .logo {
    /* Header logo */
    height: 70px;
  }

  .header-text h1 {
    /* Header title */
    font-size: 1.6rem;
  }

  .header-text .subtitle {
    /* Header subtitle */
    font-size: 0.9rem;
  }

  .main-content-wrapper {
    /* Main content */
    padding: 1.5rem 0;
  }

  .footer-inner-content {
    /* Footer */
    padding: 0 1rem;
    gap: 1rem;
    /* Ajustado el gap principal para móviles */
  }

  .footer-logos {
    /* Footer logos container */
    gap: 0.8rem;
    /* Ajustado el gap entre logos */
  }

  .footer-logo {
    /* Footer logo images */
    height: 40px;
  }

  .footer-text-info {
    /* Footer text info container */
    flex-direction: column;
    /* Apila el texto en columnas */
    gap: 0.5rem;
    /* Ajustado el gap entre líneas de texto */
  }
}

@media (max-width: 480px) {

  /* Más ajustes para pantallas muy pequeñas */
  .app-header .logo {
    height: 60px;
  }

  .header-text h1 {
    font-size: 1.4rem;
  }

  .header-text .subtitle {
    font-size: 0.8rem;
  }

  .header-inner-content {
    padding: 0 0.8rem;
  }

  .footer-inner-content {
    padding: 0 0.8rem;
  }

  .footer-logo {
    height: 35px;
  }

  .footer-text-info p,
  .footer-text-info a {
    font-size: 0.8rem;
  }
}
</style>