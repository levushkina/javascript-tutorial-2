app.modules.traits = (function(self) {

  var
    _traits = {},
    _$assignProductsPopup = $('.js-popup-wrapper'),
    _oldAssignedProducts = [],
    _newAssignedProducts = [];

  function _init() {
    _renderTraits();
  }

  function _showAssignPopup() {
    var traitId = Number($(this).siblings('.js-row-id').val());
    const traitsPopupTemplate = require('../templates/traits_popup.hbs');

    _$assignProductsPopup
      .html(traitsPopupTemplate({
        product: _prepareProducts(traitId),
        trait: traitId
      }))
      .dialog({
        modal: true,
        dialogClass: 'products-assignment-popup'
      });
  }

  function _renderTraits() {
    const traitsTraitsTemplate = require('../templates/traits_form.hbs');
    $('.js-traits-wrapper').html( traitsTraitsTemplate(app.config.traits.data));
  }
  function _renderTraitsValue() {
    const traitsTraitsValueTemplate = require('../templates/traits_value.hbs');
    $(this).before(traitsTraitsValueTemplate);
  }
  function _renderTraitsRow() {
    const traitsTraitsRowTemplate = require('../templates/traits_row.hbs');
    $(this).before(traitsTraitsRowTemplate);
  }

  function _deleteTraits() {
    $(this).parent().remove();
  }

  function _safeTraits() {
    _api({
      url: '/api/traits',
      data: JSON.stringify(_traits.data)
    }).then(function(response) {
    });
  }

  function _api(data) {
    return $.ajax({
      url: data.url,
      data: data.data,
      contentType: 'application/json',
      dataType: 'json',
      method: data.method || 'POST',
      beforeSend: data.beforeSend
    });
  }

  function _getTraits() {
    _traits.data = [];
    $('.js-trait-row').each(function(){
      var
        $this = $(this),
        traitRow = {},
        value,
        valuesItem;

      traitRow = {
        id: parseInt($this.find('.js-row-id').val()),
        name: $this.find('.js-row-name').val(),
        slug: $this.find('.js-row-slug').val(),
        values: []
      };
      $this.find('.js-trait-value').each(function(){
        value = $(this);
        traitRow.values.push(valuesItem = {
          id: parseInt(value.find('.js-value-id').val()),
          value: value.find('.js-value-name').val()
        });
      });
      _traits.data.push(traitRow);
    });
    _compareTraits();
    _safeTraits();
  }

  function _compareTraits() {
    _traits.data.forEach(function(newTrait, i) {
      var newId = newTrait.id;
      app.config.traits.data.forEach(function(oldTrait) {
        if (newId === oldTrait.id) {
          _traits.data.splice(i, 1, $.extend(true, oldTrait, newTrait));

        }
      });
    });
  }

  function _getAllowedProducts(product, traitId) {
    var trait;

    trait = app.config.traits.data.find(function(trait) {
      return traitId === trait.id;
    });
    return trait.allowed_products.some(function(item) {
      return item === product;
    });
  }

  function _prepareProducts(traitId) {
    var products = [];

    app.config.products.data.forEach(function(product){
      products.push({
        name: product.name,
        id: product.id,
        checked: _getAllowedProducts(product.id, traitId)
      });
    });
    return products;
  }

  Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
  };

  function _getProductsAssignation() {
    var $checkbox = $('.js-assign-products').serializeArray();

    $.each($checkbox, function(i, field){
      _newAssignedProducts.push(Number(field.value))
    });
    _saveProductsAssignation(Number($('.js-trait-id').val()));
  }

  function _saveProductsAssignation(traitId) {
    var assignments, trait;

    trait = app.config.traits.data.find(function(trait) { return trait.id === traitId; });
    _oldAssignedProducts = trait.allowed_products;

    assignments = {
      markedForPost: _newAssignedProducts.diff(_oldAssignedProducts),
      markedForDelete: _oldAssignedProducts.diff(_newAssignedProducts)
    };
    assignments.markedForDelete.forEach(function(id) {
      _api({url: '/api/traits/' + traitId + '/products/' + id, method: 'DELETE'}).then(function(response) { trait = response; });
    });
    assignments.markedForPost.forEach(function(id) {
      _api({url: '/api/traits/' + traitId + '/products/' + id, method: 'POST'}).then(function(response) { trait = response; });
    });
    _$assignProductsPopup.dialog('close');
  }

  function _listener() {
    $(document)
      .on('click', '.js-add-value', _renderTraitsValue)
      .on('click', '.js-add-row', _renderTraitsRow)
      .on('click', '.delete-button', _deleteTraits)
      .on('click', '.assign-products', _showAssignPopup)
      .on('click', '.js-assigned-safe', _getProductsAssignation)
      .on('click', '.js-safe-traits', function(e){
        e.preventDefault();
        _getTraits();
      });
  }

  self.load = function() {
    _init();
    _listener();
  };

  return self;
})(app.modules.traits || {});
