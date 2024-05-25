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

    sleep(1);

    // se hace click al paciente
    let len = page.$$("table tbody tr").length;

    const paciente = page.$$("table tbody tr")[len-1].$('td[name="nombre"]');

    await Promise.all([page.waitForNavigation(), paciente.click()]);

    sleep(1);

    // se hace click al boton de view
    const viewButton = page.locator('button[name="view"]');

    await Promise.all([page.waitForNavigation(), viewButton.click()]);

    sleep(1);

    // se hace click al boton de "+"
    const addButton = page.locator('button[name="add"]');

    await Promise.all([page.waitForNavigation(), addButton.click()]);

    sleep(1);

    // se hace click al boton de predecir
    const predecirButton = page.locator('button[class="predict-button mdc-button mdc-button--raised mat-mdc-raised-button mat-unthemed mat-mdc-button-base ng-star-inserted"]');

    // hago un page.waitForTimeout(1000) ya que el texto de la prediccion 
    // tarda unos milisegundos en aparecer
    await Promise.all([predecirButton.click(), page.waitForTimeout(1000)]);

    sleep(1);

    // se escribe en el textarea el informe
    const informeText = page.locator('textarea');
    informeText.type('El paciente no tiene cancer');

    sleep(1);

    // se hace click en el boton de guardar
    const guardarButton = page.locator('button[name="save"]');

    await Promise.all([page.waitForNavigation(), guardarButton.click()]);

    sleep(1);

    // se comrpueba que se ha creado el informe comprobando que esta el texto
    // 'El paciente no tiene cancer' que en html es span[name="content"]
    check(page, {	
      'InformeCreado': p => p.locator('span[name="content"]').textContent().includes('El paciente no tiene cancer'),
        
    });
    
    sleep(1);
  } finally {
    page.close();
  }
}