// src/lib/jsx-utils.ts
// Utilitários para evitar erros de renderização em produção

/**
 * Função para garantir que um valor seja renderizável em JSX
 * Evita o erro React #31 quando objetos são passados como children
 */
export function ensureRenderable(value: any): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  // Se for um objeto, tentar extrair uma propriedade displayable
  if (typeof value === "object") {
    // Para objetos Filial
    if (value.nome) {
      return String(value.nome);
    }

    // Para objetos Cliente
    if (value.pessoaFisica?.nome) {
      return String(value.pessoaFisica.nome);
    }

    if (value.pessoaJuridica?.razaoSocial) {
      return String(value.pessoaJuridica.razaoSocial);
    }

    // Para objetos Consultor
    if (value.pessoaFisica?.nome) {
      return String(value.pessoaFisica.nome);
    }

    // Fallback para objetos genéricos
    if (value.nome) return String(value.nome);
    if (value.title) return String(value.title);
    if (value.label) return String(value.label);
    if (value.id) return `#${value.id}`;

    // Se não conseguir extrair nada, retornar string vazia
    console.warn(
      "🔧 ensureRenderable: Objeto não renderizável detectado:",
      value
    );
    return "";
  }

  // Para arrays
  if (Array.isArray(value)) {
    return value.map(ensureRenderable).join(", ");
  }

  // Fallback
  return String(value);
}

/**
 * Função para debug de objetos que podem causar erro de renderização
 */
export function debugRenderableValue(value: any, context?: string): void {
  if (typeof value === "object" && value !== null) {
    console.warn(
      `🔧 debugRenderableValue: Objeto detectado em contexto JSX${
        context ? ` (${context})` : ""
      }:`,
      {
        type: typeof value,
        isArray: Array.isArray(value),
        keys: Object.keys(value),
        value: value,
      }
    );
  }
}

/**
 * Hook para garantir que valores sejam renderizáveis
 */
export function useSafeRender<T>(value: T): string {
  return ensureRenderable(value);
}
