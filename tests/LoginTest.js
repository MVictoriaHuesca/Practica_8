import { browser } from 'k6/experimental/browser';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    ui: {
      executor: 'shared-iterations', // para realizar iteraciones sin indicar el tiempo
      options: {
        browser: {
          type: 'chromium',
        },
      },
    } 
  },
  thresholds: {
    checks: ["rate==1.0"]
  }
}

export default async function () {
  const page = browser.newPage();
  try {
    await page.goto('http://localhost:4200');

    // se mete los datos del medico
    const nombreMedico = page.locator('input[name="nombre"]');
    nombreMedico.type('Jose');

    const dniMedico = page.locator('input[name="DNI"]');
    dniMedico.type('924924D');
    
    sleep(1);

    // se hace click en el boton de login
    const submitButton = page.locator('button[name="login"]');

    await Promise.all([page.waitForNavigation(), submitButton.click()]);

    // se comprueba que se ha logueado
    check(page, {
        'CuentaCreada': p => p.locator('button[name="add"]'),
    });
    
    sleep(1);
  } finally {
    page.close();
  }
}