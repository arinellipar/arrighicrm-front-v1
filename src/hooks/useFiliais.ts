import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";

interface FilialBasica {
  id: number;
  nome: string;
  dataInclusao: string;
  usuarioImportacao?: string;
}

interface UseFilialOptions {
  options: { value: string; label: string; id: number }[];
  loading: boolean;
  error: string | null;
}

export function useFilialOptions(): UseFilialOptions {
  const [options, setOptions] = useState<
    { value: string; label: string; id: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFiliais = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get<FilialBasica[]>("/Filial");

        if (response.data && !response.error) {
          const filialOptions = response.data.map((filial) => ({
            value: filial.id.toString(),
            label: filial.nome,
            id: filial.id,
          }));

          setOptions(filialOptions);
        } else {
          throw new Error(response.error || "Erro ao carregar filiais");
        }
      } catch (err) {
        console.error("Erro ao carregar filiais:", err);
        setError(err instanceof Error ? err.message : "Erro desconhecido");
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFiliais();
  }, []);

  return { options, loading, error };
}

interface UseFiliaisReturn {
  filiais: FilialBasica[];
  loading: boolean;
  error: string | null;
  fetchFiliais: () => Promise<void>;
}

export function useFiliais(): UseFiliaisReturn {
  const [filiais, setFiliais] = useState<FilialBasica[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFiliais = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get<FilialBasica[]>("/Filial");

      if (response.data && !response.error) {
        setFiliais(response.data);
      } else {
        throw new Error(response.error || "Erro ao carregar filiais");
      }
    } catch (err) {
      console.error("Erro ao carregar filiais:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      setFiliais([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiliais();
  }, []);

  return { filiais, loading, error, fetchFiliais };
}
