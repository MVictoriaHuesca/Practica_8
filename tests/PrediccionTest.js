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

    // se hace click al icono del ojo
    const ojoIcon = page.locator('button[name="view"]');

    await Promise.all([page.waitForNavigation(), ojoIcon.click()]);

    sleep(1);

    // se hace click al boton de "+"
    const addButton = page.locator('button[name="add"]');

    await Promise.all([page.waitForNavigation(), addButton.click()]);

    sleep(1);

    // se hace click al boton de predecir

    // no encuentra button[name="predict"] ni button[class="predict-button"]
    // que es como supuestamente se llama el boton de predecir en el html de angular  
              //const predecirButton = page.locator('button[name="predict"]');
              //const predecirButton = page.locator('button[class="predict-button"]');

    const predecirButton = page.locator('button[class="predict-button mdc-button mdc-button--raised mat-mdc-raised-button mat-unthemed mat-mdc-button-base ng-star-inserted"]');
    

    // hago un page.waitForTimeout(500) (500 = 500ms) ya que el texto de la prediccion 
    // tarda unos milisegundos en aparecer
    await Promise.all([predecirButton.click(), page.waitForTimeout(500)]);

    // se comrpueba que se ha creado la prediccion comprobando que existe el texto
    // "Probabilidad de cáncer:" que en html es span[name="predict"]
    check(page, {	
      'PrediccionCreada': p => p.locator('span[name="predict"]'),
        
    });
    
    sleep(1);
  } finally {
    page.close();
  }
}