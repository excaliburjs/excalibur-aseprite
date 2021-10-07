const { test, expectLoaded, expectPage } = require('@excaliburjs/testing')

test('A Aseprite parsed resource', async (page) => {
    await expectLoaded();
    await expectPage('Aseprite Loop Animation', './test/integration/images/actual.png').toBe('./test/integration/images/expected.png');
});