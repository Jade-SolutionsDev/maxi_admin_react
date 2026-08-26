// Generated from: e2e/features/formularios.feature
import { test } from "playwright-bdd";

test.describe('Los formularios de la administración', () => {

  test.beforeEach('Antecedentes', async ({ Given }, testInfo) => { if (testInfo.error) return;
    await Given('que hay productos de prueba en el catálogo'); 
  });
  
  test('Un clic fuera no se lleva lo escrito', async ({ When, Then, And, page }) => { 
    await When('abre el formulario de nuevo producto', null, { page }); 
    await And('escribe "Producto a medio escribir" en el nombre', null, { page }); 
    await And('pulsa fuera del formulario', null, { page }); 
    await Then('el formulario sigue abierto con lo escrito', null, { page }); 
  });

  test('El destacado se puede marcar al crear', async ({ When, Then, page }) => { 
    await When('abre el formulario de nuevo producto', null, { page }); 
    await Then('puede marcar el producto como destacado', null, { page }); 
  });

  test('Un campo numérico se puede dejar vacío', async ({ When, Then, And, page }) => { 
    await When('abre el formulario de nuevo producto', null, { page }); 
    await And('escribe 25 en el descuento', null, { page }); 
    await And('borra el descuento', null, { page }); 
    await Then('el descuento queda vacío', null, { page }); 
  });

});

// == technical section ==

test.beforeEach('BeforeEach Hooks', ({ $runScenarioHooks, page }) => $runScenarioHooks('before', { page }));

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('e2e/features/formularios.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":10,"pickleLine":11,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":9,"keywordType":"Context","textWithKeyword":"Dado que hay productos de prueba en el catálogo","isBg":true,"stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":12,"keywordType":"Action","textWithKeyword":"Cuando abre el formulario de nuevo producto","stepMatchArguments":[]},{"pwStepLine":12,"gherkinStepLine":13,"keywordType":"Action","textWithKeyword":"Y escribe \"Producto a medio escribir\" en el nombre","stepMatchArguments":[{"group":{"start":8,"value":"\"Producto a medio escribir\"","children":[{"start":9,"value":"Producto a medio escribir","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":13,"gherkinStepLine":14,"keywordType":"Action","textWithKeyword":"Y pulsa fuera del formulario","stepMatchArguments":[]},{"pwStepLine":14,"gherkinStepLine":15,"keywordType":"Outcome","textWithKeyword":"Entonces el formulario sigue abierto con lo escrito","stepMatchArguments":[]}]},
  {"pwTestLine":17,"pickleLine":17,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":9,"keywordType":"Context","textWithKeyword":"Dado que hay productos de prueba en el catálogo","isBg":true,"stepMatchArguments":[]},{"pwStepLine":18,"gherkinStepLine":18,"keywordType":"Action","textWithKeyword":"Cuando abre el formulario de nuevo producto","stepMatchArguments":[]},{"pwStepLine":19,"gherkinStepLine":19,"keywordType":"Outcome","textWithKeyword":"Entonces puede marcar el producto como destacado","stepMatchArguments":[]}]},
  {"pwTestLine":22,"pickleLine":21,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":9,"keywordType":"Context","textWithKeyword":"Dado que hay productos de prueba en el catálogo","isBg":true,"stepMatchArguments":[]},{"pwStepLine":23,"gherkinStepLine":22,"keywordType":"Action","textWithKeyword":"Cuando abre el formulario de nuevo producto","stepMatchArguments":[]},{"pwStepLine":24,"gherkinStepLine":23,"keywordType":"Action","textWithKeyword":"Y escribe 25 en el descuento","stepMatchArguments":[{"group":{"start":8,"value":"25"},"parameterTypeName":"int"}]},{"pwStepLine":25,"gherkinStepLine":24,"keywordType":"Action","textWithKeyword":"Y borra el descuento","stepMatchArguments":[]},{"pwStepLine":26,"gherkinStepLine":25,"keywordType":"Outcome","textWithKeyword":"Entonces el descuento queda vacío","stepMatchArguments":[]}]},
]; // bdd-data-end