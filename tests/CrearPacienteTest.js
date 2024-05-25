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
    const loginMedicoButton = page.locator('button[name="login"]');

    await Promise.all([page.waitForNavigation(), loginMedicoButton.click()]);

    sleep(1);

    // se hace click en el boton de crear paciente
    const crearPacienteButton = page.locator('button[name="add"]');

    await Promise.all([page.waitForNavigation(), crearPacienteButton.click()]);

    sleep(1);

    // se mete los datos del paciente
    const dnPaciente = page.locator('input[name="dni"]');
    dnPaciente.type('12345678');

    const nombrePaciente = page.locator('input[name="nombre"]');
    nombrePaciente.type('Juan');

    const edadPaciente = page.locator('input[name="edad"]');
    edadPaciente.type('20');

    const citaPaciente = page.locator('input[name="cita"]');
    citaPaciente.type('2024-06-01');

    sleep(1);


    // se hace click en el boton de crear paciente
    const pacienteButton = page.locator('button[type="submit"]');

    await Promise.all([page.waitForNavigation(), pacienteButton.click()]);

    sleep(1);

    // se comprueba que el paciente se ha creado correctamente
    let len = page.$$("table tbody tr").length;

    check(page, {
      'Nombre': p => p.$$("table tbody tr")[len-1]
      .$('td[name="nombre"]').textContent().includes('Juan'),

      'DNI': p => parseInt(p.$$("table tbody tr")[len-1]
      .$('td[name="dni"]').textContent()) == 12345678,
  });
    
    sleep(1);

  } finally {
    page.close();
  }
}