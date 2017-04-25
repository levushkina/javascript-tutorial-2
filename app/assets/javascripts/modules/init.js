app.modules.init = ((self) => {

  function _api(data) {
    return $.ajax({
      url: data.url,
      data: JSON.stringify(data.data),
      contentType: 'application/json',
      dataType: 'json',
      method: data.method || 'GET',
      beforeSend: data.beforeSend
    });
  }

  function _handlebarsExampleOfUsage() {
    const titleTemplate = require('../templates/title_example.hbs');
    $('.js-title-example').html(titleTemplate({title: 'Javascript tutorial part 2'}));
  }


  function _init() {
    _handlebarsExampleOfUsage(); // Метод, показываеющий как работать с handlebars-loader
  }
  function _resolveData() {
    return $.when(
      _api({url: '/api/products'}),
      _api({url: '/api/traits'})
    ).done((products, traits) => {
      app.config.products = products[0],
      app.config.traits = traits[0];
    });
  }


  self.ready = () => {
    _init();
  };

  self.resolve = _resolveData;

  return self;
})(app.modules.init || {});
