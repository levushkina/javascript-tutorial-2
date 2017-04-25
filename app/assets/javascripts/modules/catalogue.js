app.modules.catalogue = (function(self) {

  var
    _filter = {};

  function _init() {
    _renderProducts();
    _renderTraits();
  }

  function _renderProducts() {
    const productsTemplate = require('../templates/products.hbs');
    $('.js-catalogue-products-wrapper').html(productsTemplate(app.config.products));
  }

  function _renderTraits() {
    const traitsTemplate = require('../templates/traits.hbs');
    $('.js-catalogue-filter-wrapper').html(traitsTemplate({traits: app.config.traits.data}));
  }

  function _api(data) {
    return $.ajax({
      url: data.url,
      data: data.data,
      contentType: 'application/json',
      dataType: 'json',
      method: data.method || 'GET',
      beforeSend: data.beforeSend
    });
  }

  function _updateFilter($checkbox) {
    var
      name = $checkbox.attr('name'), // Название фильтра
      value = parseInt($checkbox.val()), // Значение фильтра
      checked = $checkbox.is(':checked'); // Флаг, по которому мы поймем добавить или удалить

    if (checked) {
      if (_filter.hasOwnProperty(name)) {
        !_filter[name].includes(value) && _filter[name].push(value);
      } else {
        _filter[name] = [value];
      }
    } else {
      _filter[name] && _filter[name].forEach(function(filterValue, index) {
        (filterValue === value) && _filter[name].splice(index, 1);
      });
    }
    _refreshProducts();
  }

  function _refreshProducts() {
    _api({
      url: '/api/products',
      data: _filter
    }).then(function(response) {
      app.config.products = response;
      _renderProducts();
    });
  }

  function _showProductsPopoup() {
    var productId = parseInt($(this).data('id'));
    const productPopupTemplate = require('../templates/products_popup.hbs');

    _prepareTraits(productId);
    $('.js-popup-wrapper')
      .html(productPopupTemplate({
        product: productId,
        traits: _prepareTraits(productId)
      }))
      .dialog({
        modal: true,
        dialogClass: 'products-assignment-popup'
      });
  }

  function _prepareTraits(productId) {
    var product, traits = [];

    product = app.config.products.data.find(function(product_item){
      return product_item.id === productId;
    });
    app.config.traits.data.forEach(function(trait) {
      var productTrait;
      if (_getPermittedTrait(trait, productId)) {
        productTrait = product.traits.find(function(productTraitItem) {
          return trait.id === productTraitItem.id;
        });
        trait.values.forEach(function(permitted_value) {
          permitted_value.checked = productTrait.values.some(function(productTraitValue) {return productTraitValue.id === permitted_value.id})
        });
        traits.push(trait);
      }
    });
    return traits;
  }

  function _getPermittedTrait(trait, productId) {
    return trait.allowed_products.some(function(id) {
      return id === productId;
    });
  }

  function _saveProductTraits() {
    var
      productTraits = [],
      productId = parseInt($('.js-product-id').val()),
      product = app.config.products.data.find(function(product_item) {
        return product_item.id === productId;
      });

    $('.js-product-trait').each(function() {
      var
        $this = $(this),
        data = $this.data(),
        trait;

      trait = {
        id: parseInt(data.id),
        slug: data.slug,
        name: data.name,
        values: $this.find('.js-trait-checkbox').serializeArray()
      };
      productTraits.push(trait);
    });
    product.traits.values = productTraits;
    _sendProduct(product, productId);
    $('.js-popup-wrapper').dialog('close');
  }

  function _sendProduct(product, productId) {
    _api({
      url: '/api/products/' + productId,
      method: 'PUT',
      data: JSON.stringify(product)}).then(function(response) {
        app.config.products.data.splice(_getProductIndex(productId), 1, response);
    });
  }

  function _getProductIndex(productId) {
    return app.config.products.data.findIndex(function(product) { product.id === productId});
  }

  function _listener() {
    $(document)
      .on('change', '.js-filter-checkbox', function() {
        _updateFilter($(this));
      })
      .on('click', '.assign-traits-link', _showProductsPopoup)
      .on('click', '.js-product-safe', _saveProductTraits);
  }

  self.load = function() {
    _init();
    _listener();
  };

  return self;
})(app.modules.catalogue || {});
