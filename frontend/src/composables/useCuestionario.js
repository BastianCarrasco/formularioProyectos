// composables/useCuestionario.js
import { ref, computed, onMounted } from 'vue';

export function useCuestionario() {
  const urlcuestionario = import.meta.env.VITE_API_URL_CUESTIONARIOS;
  const urlacademico = import.meta.env.VITE_API_URL_ACADEMICOS;
  const urlUA = import.meta.env.VITE_API_URL_UA;

  const isAcademico = ref(false);
  const selectedUnidadId = ref(null);
  const showCuestionario = ref(false);
  const isSubmitting = ref(false);
  const submitSuccess = ref(false);
  const submitError = ref(false);
  const isLoading = ref(false);
  const loadError = ref(null);
  const showJsonData = ref(false);

  const unidadesAcademicas = ref([]);
  const academicos = ref([]);
  const preguntasCuestionario = ref([]);

  const formData = ref({
    id_investigador: null,
    respuestas: [],
  });

  const nombreInvestigadorSeleccionado = computed(() => {
    const found = academicos.value.find(a => a.id_academico === formData.value.id_investigador);
    return found ? found.nombre : '';
  });

  const nombreEscuelaSeleccionada = computed(() => {
    const found = unidadesAcademicas.value.find(u => u.id_unidad === selectedUnidadId.value);
    return found ? found.nombre : '';
  });

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
        formData.value.respuestas = Array(preguntasCuestionario.value.length).fill('');
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

  const generatePostData = () => ({
    nombre_investigador: formData.value.id_investigador,
    escuela: selectedUnidadId.value,
    respuestas: formData.value.respuestas,
  });

  const enviarCuestionario = async () => {
    isSubmitting.value = true;
    submitError.value = false;

    try {
      const postData = generatePostData();
      const response = await fetch("https://kth2025backend-production.up.railway.app/respuestas-cuestionarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      if (!response.ok) throw new Error("Error en el envío");

      submitSuccess.value = true;
      formData.value = {
        id_investigador: null,
        respuestas: Array(preguntasCuestionario.value.length).fill(""),
      };
      selectedUnidadId.value = null;
      showJsonData.value = false;
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

  return {
    // states
    isAcademico, selectedUnidadId, showCuestionario, isSubmitting, submitSuccess, submitError,
    isLoading, loadError, showJsonData, unidadesAcademicas, academicos, preguntasCuestionario,
    formData,

    // computed
    nombreInvestigadorSeleccionado, nombreEscuelaSeleccionada,

    // methods
    verificarAcceso, generatePostData, enviarCuestionario, updateRespuesta,
  };
}
