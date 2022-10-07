import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  keyword: service(),

  async beforeModel() {
    console.log('firing beforeModel on edit/keywords route');
    await this.keyword.fetchSciencebaseVocab();
  },
  actions: {
    addKeyword(model, obj) {
      let k = obj ? obj : {};

      model.pushObject(k);
    },
    deleteKeyword(model, obj) {
      if(typeof obj === 'number') {
        model.removeAt(obj);
      } else {
        model.removeObject(obj);
      }
    },
  }
});
