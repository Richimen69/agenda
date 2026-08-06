import { useState, useEffect, useCallback } from "react";
import {
  deleteLead,
  updateLead,
  createLead,
  reactivateLead as reactivateLeadApi,
} from "../services/leads.api";
import { sanitizeForPrisma } from "../utils/importHelpers";
import { addLeadComment as addLeadCommentApi } from "../services/leads.api";

export function useLeadsTable(leads, onLeadsChange) {
  const [data, setData] = useState([]);
  const [savingRow, setSavingRow] = useState(null); // rowIndex que se está guardando
  const [creating, setCreating] = useState(false);

  const [importProgress, setImportProgress] = useState(null); // { done, total }

  const bulkImportLeads = useCallback(async (rows) => {
    const results = { success: [], failed: [] };
    setImportProgress({ done: 0, total: rows.length });

    for (let i = 0; i < rows.length; i++) {
      const sanitized = sanitizeForPrisma(rows[i]);
      console.log("Enviando a createLead:", sanitized);
      try {
        const response = await createLead(sanitizeForPrisma(rows[i]));
        if (!response?.success)
          throw new Error(response?.error || "Respuesta inválida");
        results.success.push(response.data);
      } catch (error) {
        // Antes: solo error.message genérico. Ahora capturamos el status real también.
        const reason =
          error.response?.data?.error || error.message || "Error desconocido";
        results.failed.push({
          row: rows[i],
          error: reason,
          status: error.response?.status,
        });
      }
      setImportProgress({ done: i + 1, total: rows.length });
    }

    if (results.success.length) {
      setData((prev) => [...results.success, ...prev]);
    }
    setImportProgress(null);
    return results;
  }, []);

  useEffect(() => {
    if (leads) setData(leads);
  }, [leads]);

  const updateCell = useCallback(
    async (rowIndex, columnId, value) => {
      const leadId = data[rowIndex]?.id;
      if (!leadId) return;

      const previousValue = data[rowIndex][columnId];
      // Optimistic update
      setData((old) =>
        old.map((row, i) =>
          i === rowIndex ? { ...row, [columnId]: value } : row,
        ),
      );
      setSavingRow(rowIndex);

      try {
        const response = await updateLead(leadId, { [columnId]: value });
        if (!response?.success && !response?.ok) {
          throw new Error("Respuesta inválida del servidor");
        }
      } catch (error) {
        console.error("Fallo al guardar en BD", error);
        // Revertimos el optimistic update si falla
        setData((old) =>
          old.map((row, i) =>
            i === rowIndex ? { ...row, [columnId]: previousValue } : row,
          ),
        );
        alert("Hubo un error al guardar el cambio. Se revirtió localmente.");
      } finally {
        setSavingRow(null);
      }
    },
    [data],
  );

  const addLead = useCallback(async (formData) => {
    setCreating(true);
    try {
      const response = await createLead(formData);
      if (!response?.success) throw new Error("Error al crear el registro");
      setData((prev) => [response.data, ...prev]);
      return true; // para que el modal se cierre solo si tuvo éxito
    } catch (error) {
      console.error("Fallo al crear lead", error);
      alert("Hubo un error al crear el lead. Revisa la conexión.");
      return false;
    } finally {
      setCreating(false);
    }
  }, []);

  const removeLead = useCallback(
    async (leadId) => {
      if (!window.confirm("¿Estás seguro de borrar este lead?")) return;
      // Optimistic removal
      const backup = data;
      setData((old) => old.filter((row) => row.id !== leadId));
      try {
        await deleteLead(leadId);
        onLeadsChange?.();
      } catch (error) {
        console.error("Error al borrar lead", error);
        setData(backup); // revertimos si falla
        alert("Error al borrar el lead. Se restauró la fila.");
      }
    },
    [data, onLeadsChange],
  );

  const reactivateLead = useCallback(async (leadId, payload) => {
    setCreating(true);
    try {
      const response = await reactivateLeadApi(leadId, payload);
      if (!response?.success) throw new Error("Error al reactivar el lead");

      // Actualiza el lead existente en la tabla local en vez de agregar una fila nueva
      setData((prev) =>
        prev.map((row) =>
          row.id === leadId ? { ...row, ...response.data } : row,
        ),
      );
      return true;
    } catch (error) {
      console.error("Fallo al reactivar lead", error);
      alert("Hubo un error al reactivar el lead. Revisa la conexión.");
      return false;
    } finally {
      setCreating(false);
    }
  }, []);

  const addComment = useCallback(async (leadId, text, author) => {
    try {
      const newComment = await addLeadCommentApi(leadId, { text, author });
      setData((prev) =>
        prev.map((row) =>
          row.id === leadId
            ? { ...row, comments: [...(row.comments || []), newComment] }
            : row,
        ),
      );
      return true;
    } catch (error) {
      console.error("Fallo al agregar comentario", error);
      alert("No se pudo guardar el comentario.");
      return false;
    }
  }, []);

  return {
    data,
    updateCell,
    addLead,
    removeLead,
    savingRow,
    creating,
    reactivateLead,
    bulkImportLeads,
    importProgress,
    addComment,
  };
}
