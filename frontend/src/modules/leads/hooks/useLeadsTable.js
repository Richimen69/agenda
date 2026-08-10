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
  useEffect(() => {
    if (leads) setData(leads);
  }, [leads]);
  const createInitialComments = async (leadId, comments) => {
    for (const comment of comments || []) {
      try {
        await addLeadCommentApi(leadId, {
          text: comment.text,
          author: "Importación",
        });
      } catch (err) {
        console.error(`No se pudo crear comentario para lead ${leadId}:`, err);
        // no truena el import completo por un comentario fallido
      }
    }
  };

  const bulkImportLeads = useCallback(async (rows) => {
    const results = { success: [], failed: [], reactivated: [] };
    setImportProgress({ done: 0, total: rows.length });

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        if (
          row.duplicateStatus === "recent" ||
          row.duplicateStatus === "returning"
        ) {
          const response = await reactivateLeadApi(row.duplicateMatch.id, {
            newInterest: row.interest || undefined,
            newSource: row.source || undefined,
            note: `Reingreso vía importación: ${row.interest || "sin especificar"}`,
          });
          if (!response?.success)
            throw new Error(response?.error || "Error al reactivar");
          await createInitialComments(row.duplicateMatch.id, row.comments);
          results.reactivated.push(response.data);
        } else {
          const response = await createLead(sanitizeForPrisma(row));
          if (!response?.success)
            throw new Error(response?.error || "Respuesta inválida");
          await createInitialComments(response.data.id, row.comments);
          results.success.push(response.data);
        }
      } catch (error) {
        const reason =
          error.response?.data?.error || error.message || "Error desconocido";
        results.failed.push({
          row,
          error: reason,
          status: error.response?.status,
        });
      }
      setImportProgress({ done: i + 1, total: rows.length });
    }

    if (results.success.length || results.reactivated.length) {
      setData((prev) => {
        const updated = prev.map((lead) => {
          const match = results.reactivated.find((r) => r.id === lead.id);
          return match ? { ...lead, ...match } : lead;
        });
        return [...results.success, ...updated];
      });
    }

    setImportProgress(null);
    return results;
  }, []);

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

  const updateMultipleCells = useCallback(
    async (rowIndex, updates) => {
      const leadId = data[rowIndex]?.id;
      if (!leadId) return;

      const previous = { ...data[rowIndex] };
      // Optimistic update de varios campos a la vez
      setData((old) =>
        old.map((row, i) => (i === rowIndex ? { ...row, ...updates } : row)),
      );
      setSavingRow(rowIndex);

      try {
        const response = await updateLead(leadId, updates);
        if (!response?.success && !response?.ok) {
          throw new Error("Respuesta inválida del servidor");
        }
      } catch (error) {
        console.error("Fallo al guardar en BD", error);
        setData((old) =>
          old.map((row, i) => (i === rowIndex ? previous : row)),
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
    updateMultipleCells,
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
