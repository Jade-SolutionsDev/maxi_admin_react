// Generated from: e2e/features/listados.feature
import { test } from "playwright-bdd";

test.describe('Los listados de la administración', () => {

  test.beforeEach('Antecedentes', async ({ Given }, testInfo) => { if (testInfo.error) return;
    await Given('que hay productos de prueba en el catálogo'); 
  });
  
  test('Buscar sin tildes encuentra lo que las lleva', async ({ When, Then, And, page }) => { 
    await When('abre el listado de "productos"', null, { page }); 
    await And('busca "melocoton"', null, { page }); 
    await Then('ve el producto "Melocotón en Almíbar"', null, { page }); 
  });

  test('Buscar con tildes también encuentra', async ({ When, Then, And, page }) => { 
    await When('abre el listado de "productos"', null, { page }); 
    await And('busca "Almíbar"', null, { page }); 
    await Then('ve el producto "Melocotón en Almíbar"', null, { page }); 
  });

  test('Una búsqueda sin resultados lo explica y ofrece salida', async ({ When, Then, And, page }) => { 
    await When('abre el listado de "productos"', null, { page }); 
    await And('busca "zzzznoexiste"', null, { page }); 
    await Then('se le dice que no hay resultados', null, { page }); 
    await And('puede limpiar los filtros', null, { page }); 
  });

  test('El listado dice a qué departamento pertenece cada producto', async ({ When, Then, page }) => { 
    await When('abre el listado de "productos"', null, { page }); 
    await Then('la fila del producto muestra su departamento y su categoría', null, { page }); 
  });

  test('Los nombres de las columnas tienen todos el mismo tamaño', async ({ When, Then, page }) => { 
    await When('abre el listado de "productos"', null, { page }); 
    await Then('todas las cabeceras tienen el mismo tamaño de letra', null, { page }); 
  });

  test('La equis de limpiar responde donde se ve', async ({ When, Then, And, page }) => { 
    await When('abre el listado de "productos"', null, { page }); 
    await And('busca "melocoton"', null, { page }); 
    await And('pulsa la equis de limpiar', null, { page }); 
    await Then('la búsqueda queda vacía', null, { page }); 
  });

  test('El filtro de categorías sigue al departamento', async ({ When, Then, And, page }) => { 
    await When('abre el listado de "productos"', null, { page }); 
    await And('filtra por el departamento "Alimentación"', null, { page }); 
    await Then('solo puede elegir categorías de ese departamento', null, { page }); 
  });

  test('El estado se filtra con un interruptor, no con un desplegable', async ({ When, Then, page }) => { 
    await When('abre el listado de "almacenes"', null, { page }); 
    await Then('hay un interruptor para ver solo los habilitados', null, { page }); 
  });

  test('La interfaz está en español', async ({ When, Then, And, page }) => { 
    await When('abre el listado de "productos"', null, { page }); 
    await Then('no se ven claves de traducción sin traducir', null, { page }); 
    await And('ve la acción "Crear"', null, { page }); 
  });

});

// == technical section ==

test.beforeEach('BeforeEach Hooks', ({ $runScenarioHooks, page }) => $runScenarioHooks('before', { page }));

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('e2e/features/listados.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":10,"pickleLine":11,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":9,"keywordType":"Context","textWithKeyword":"Dado que hay productos de prueba en el catálogo","isBg":true,"stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":12,"keywordType":"Action","textWithKeyword":"Cuando abre el listado de \"productos\"","stepMatchArguments":[{"group":{"start":19,"value":"\"productos\"","children":[{"start":20,"value":"productos","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":12,"gherkinStepLine":13,"keywordType":"Action","textWithKeyword":"Y busca \"melocoton\"","stepMatchArguments":[{"group":{"start":6,"value":"\"melocoton\"","children":[{"start":7,"value":"melocoton","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":13,"gherkinStepLine":14,"keywordType":"Outcome","textWithKeyword":"Entonces ve el producto \"Melocotón en Almíbar\"","stepMatchArguments":[{"group":{"start":15,"value":"\"Melocotón en Almíbar\"","children":[{"start":16,"value":"Melocotón en Almíbar","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":16,"pickleLine":16,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":9,"keywordType":"Context","textWithKeyword":"Dado que hay productos de prueba en el catálogo","isBg":true,"stepMatchArguments":[]},{"pwStepLine":17,"gherkinStepLine":17,"keywordType":"Action","textWithKeyword":"Cuando abre el listado de \"productos\"","stepMatchArguments":[{"group":{"start":19,"value":"\"productos\"","children":[{"start":20,"value":"productos","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":18,"gherkinStepLine":18,"keywordType":"Action","textWithKeyword":"Y busca \"Almíbar\"","stepMatchArguments":[{"group":{"start":6,"value":"\"Almíbar\"","children":[{"start":7,"value":"Almíbar","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":19,"gherkinStepLine":19,"keywordType":"Outcome","textWithKeyword":"Entonces ve el producto \"Melocotón en Almíbar\"","stepMatchArguments":[{"group":{"start":15,"value":"\"Melocotón en Almíbar\"","children":[{"start":16,"value":"Melocotón en Almíbar","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":22,"pickleLine":21,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":9,"keywordType":"Context","textWithKeyword":"Dado que hay productos de prueba en el catálogo","isBg":true,"stepMatchArguments":[]},{"pwStepLine":23,"gherkinStepLine":22,"keywordType":"Action","textWithKeyword":"Cuando abre el listado de \"productos\"","stepMatchArguments":[{"group":{"start":19,"value":"\"productos\"","children":[{"start":20,"value":"productos","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":24,"gherkinStepLine":23,"keywordType":"Action","textWithKeyword":"Y busca \"zzzznoexiste\"","stepMatchArguments":[{"group":{"start":6,"value":"\"zzzznoexiste\"","children":[{"start":7,"value":"zzzznoexiste","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":25,"gherkinStepLine":24,"keywordType":"Outcome","textWithKeyword":"Entonces se le dice que no hay resultados","stepMatchArguments":[]},{"pwStepLine":26,"gherkinStepLine":25,"keywordType":"Outcome","textWithKeyword":"Y puede limpiar los filtros","stepMatchArguments":[]}]},
  {"pwTestLine":29,"pickleLine":27,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":9,"keywordType":"Context","textWithKeyword":"Dado que hay productos de prueba en el catálogo","isBg":true,"stepMatchArguments":[]},{"pwStepLine":30,"gherkinStepLine":28,"keywordType":"Action","textWithKeyword":"Cuando abre el listado de \"productos\"","stepMatchArguments":[{"group":{"start":19,"value":"\"productos\"","children":[{"start":20,"value":"productos","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":31,"gherkinStepLine":29,"keywordType":"Outcome","textWithKeyword":"Entonces la fila del producto muestra su departamento y su categoría","stepMatchArguments":[]}]},
  {"pwTestLine":34,"pickleLine":31,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":9,"keywordType":"Context","textWithKeyword":"Dado que hay productos de prueba en el catálogo","isBg":true,"stepMatchArguments":[]},{"pwStepLine":35,"gherkinStepLine":32,"keywordType":"Action","textWithKeyword":"Cuando abre el listado de \"productos\"","stepMatchArguments":[{"group":{"start":19,"value":"\"productos\"","children":[{"start":20,"value":"productos","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":36,"gherkinStepLine":33,"keywordType":"Outcome","textWithKeyword":"Entonces todas las cabeceras tienen el mismo tamaño de letra","stepMatchArguments":[]}]},
  {"pwTestLine":39,"pickleLine":35,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":9,"keywordType":"Context","textWithKeyword":"Dado que hay productos de prueba en el catálogo","isBg":true,"stepMatchArguments":[]},{"pwStepLine":40,"gherkinStepLine":36,"keywordType":"Action","textWithKeyword":"Cuando abre el listado de \"productos\"","stepMatchArguments":[{"group":{"start":19,"value":"\"productos\"","children":[{"start":20,"value":"productos","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":41,"gherkinStepLine":37,"keywordType":"Action","textWithKeyword":"Y busca \"melocoton\"","stepMatchArguments":[{"group":{"start":6,"value":"\"melocoton\"","children":[{"start":7,"value":"melocoton","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":42,"gherkinStepLine":38,"keywordType":"Action","textWithKeyword":"Y pulsa la equis de limpiar","stepMatchArguments":[]},{"pwStepLine":43,"gherkinStepLine":39,"keywordType":"Outcome","textWithKeyword":"Entonces la búsqueda queda vacía","stepMatchArguments":[]}]},
  {"pwTestLine":46,"pickleLine":41,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":9,"keywordType":"Context","textWithKeyword":"Dado que hay productos de prueba en el catálogo","isBg":true,"stepMatchArguments":[]},{"pwStepLine":47,"gherkinStepLine":42,"keywordType":"Action","textWithKeyword":"Cuando abre el listado de \"productos\"","stepMatchArguments":[{"group":{"start":19,"value":"\"productos\"","children":[{"start":20,"value":"productos","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":48,"gherkinStepLine":43,"keywordType":"Action","textWithKeyword":"Y filtra por el departamento \"Alimentación\"","stepMatchArguments":[{"group":{"start":27,"value":"\"Alimentación\"","children":[{"start":28,"value":"Alimentación","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":49,"gherkinStepLine":44,"keywordType":"Outcome","textWithKeyword":"Entonces solo puede elegir categorías de ese departamento","stepMatchArguments":[]}]},
  {"pwTestLine":52,"pickleLine":46,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":9,"keywordType":"Context","textWithKeyword":"Dado que hay productos de prueba en el catálogo","isBg":true,"stepMatchArguments":[]},{"pwStepLine":53,"gherkinStepLine":47,"keywordType":"Action","textWithKeyword":"Cuando abre el listado de \"almacenes\"","stepMatchArguments":[{"group":{"start":19,"value":"\"almacenes\"","children":[{"start":20,"value":"almacenes","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":54,"gherkinStepLine":48,"keywordType":"Outcome","textWithKeyword":"Entonces hay un interruptor para ver solo los habilitados","stepMatchArguments":[]}]},
  {"pwTestLine":57,"pickleLine":50,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":9,"keywordType":"Context","textWithKeyword":"Dado que hay productos de prueba en el catálogo","isBg":true,"stepMatchArguments":[]},{"pwStepLine":58,"gherkinStepLine":51,"keywordType":"Action","textWithKeyword":"Cuando abre el listado de \"productos\"","stepMatchArguments":[{"group":{"start":19,"value":"\"productos\"","children":[{"start":20,"value":"productos","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":59,"gherkinStepLine":52,"keywordType":"Outcome","textWithKeyword":"Entonces no se ven claves de traducción sin traducir","stepMatchArguments":[]},{"pwStepLine":60,"gherkinStepLine":53,"keywordType":"Outcome","textWithKeyword":"Y ve la acción \"Crear\"","stepMatchArguments":[{"group":{"start":13,"value":"\"Crear\"","children":[{"start":14,"value":"Crear","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
]; // bdd-data-end