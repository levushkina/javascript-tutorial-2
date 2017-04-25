import './assets/stylesheets/package.scss';
import './assets/javascripts/package.js';

app.modules.init.resolve().then(() => {
  setTimeout(() => {
    for (let module in app.modules) {
      app.modules[module].load && app.modules[module].load();
    }
  }, 10);
});
