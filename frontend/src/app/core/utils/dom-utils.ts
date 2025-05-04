/**
 * Utilidades para manipulación del DOM
 */
export class DomUtils {
    /**
     * Elimina elementos del DOM basados en selectores
     * @param selectors Array de selectores CSS para eliminar
     */
    static removeElements(selectors: string[]) {
      setTimeout(() => {
        selectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            el.remove();
          });
        });
      }, 100);
    }
  }