// Generated from: e2e/features/menu.feature
import { test } from "playwright-bdd";

test.describe('El menú de la administración', () => {

  test('Los módulos están agrupados por dominio', async ({ When, Then, page }) => { 
    await When('abre el listado de "productos"', null, { page }); 
    await Then('el menú muestra los grupos "Ventas", "Catálogo" e "Inventario"', null, { page }); 
  });

  test('Se llega a cada módulo desde su grupo', async ({ When, Then, page }) => { 
    await When('abre el listado de "productos"', null, { page }); 
    await Then('puede llegar a "Pedidos", "Clientes" y "Almacenes" desde el menú', null, { page }); 
  });

});

// == technical section ==

test.beforeEach('BeforeEach Hooks', ({ $runScenarioHooks, page }) => $runScenarioHooks('before', { page }));

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('e2e/features/menu.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":7,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":8,"keywordType":"Action","textWithKeyword":"Cuando abre el listado de \"productos\"","stepMatchArguments":[{"group":{"start":19,"value":"\"productos\"","children":[{"start":20,"value":"productos","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":8,"gherkinStepLine":9,"keywordType":"Outcome","textWithKeyword":"Entonces el menú muestra los grupos \"Ventas\", \"Catálogo\" e \"Inventario\"","stepMatchArguments":[{"group":{"start":27,"value":"\"Ventas\"","children":[{"start":28,"value":"Ventas","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":37,"value":"\"Catálogo\"","children":[{"start":38,"value":"Catálogo","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":50,"value":"\"Inventario\"","children":[{"start":51,"value":"Inventario","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":11,"pickleLine":11,"tags":[],"steps":[{"pwStepLine":12,"gherkinStepLine":12,"keywordType":"Action","textWithKeyword":"Cuando abre el listado de \"productos\"","stepMatchArguments":[{"group":{"start":19,"value":"\"productos\"","children":[{"start":20,"value":"productos","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":13,"gherkinStepLine":13,"keywordType":"Outcome","textWithKeyword":"Entonces puede llegar a \"Pedidos\", \"Clientes\" y \"Almacenes\" desde el menú","stepMatchArguments":[{"group":{"start":15,"value":"\"Pedidos\"","children":[{"start":16,"value":"Pedidos","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":26,"value":"\"Clientes\"","children":[{"start":27,"value":"Clientes","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":39,"value":"\"Almacenes\"","children":[{"start":40,"value":"Almacenes","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
]; // bdd-data-end