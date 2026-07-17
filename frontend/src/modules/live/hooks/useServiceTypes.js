import { useState, useEffect, useCallback } from 'react';
import { getServiceTypes, createServiceType } from '../services/live.api';

/**
 * Encapsula el catálogo de tipos de servicio (con sus etapas) usado
 * tanto en el formulario de creación de sesión como en la pestaña
 * de parametrización.
 */
export function useServiceTypes() {
  const [serviceTypes, setServiceTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchServiceTypes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getServiceTypes();
      setServiceTypes(data);
    } catch (error) {
      console.error('Error fetching service types:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServiceTypes();
  }, [fetchServiceTypes]);

  const createNewServiceType = useCallback(async ({ name, description, stages }) => {
    setLoading(true);
    try {
      await createServiceType({
        name,
        description: description || null,
        stages
      });
      await fetchServiceTypes();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [fetchServiceTypes]);

  return { serviceTypes, loading, fetchServiceTypes, createNewServiceType };
}