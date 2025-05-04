// src/app/core/utils/accessibility-fixes.ts

export class AccessibilityFixes {
    /**
     * Corrige problemas relacionados con aria-hidden en la aplicación
     */
    static fixAriaHiddenIssues() {
      setTimeout(() => {
        // Remover aria-hidden de elementos que podrían afectar el scroll
        const elementsWithAriaHidden = document.querySelectorAll('[aria-hidden="true"]');
        elementsWithAriaHidden.forEach(el => {
          // Solo remover aria-hidden de los contenedores principales que podrían afectar el scroll
          if (el.classList.contains('catalogo-productos') || 
              el.classList.contains('detalle-items') || 
              el.classList.contains('ion-content') || 
              el.parentElement?.classList.contains('ion-content')) {
            el.removeAttribute('aria-hidden');
            console.log('Aria-hidden removido de:', el);
          }
        });
      }, 500);
    }
  }