import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import EmberObject, { set } from '@ember/object';

export default Route.extend({
  model() {
    return EmberObject.create({
      dataToImport: {
        contacts: [],
        profiles: [],
        thesaurus: []
      }
    });
  },

  actions: {
    fetchData() {
      console.log('fetchData');

      fetch('http://localhost:8000/mdjson-export-kbs.json')
        .then(response => response.json())
        .then(data => {

          console.log(this.currentRouteModel())
          console.log(data);
          this.currentRouteModel().set('dataToImport.contacts', data.contact);
          this.currentRouteModel().set('dataToImport.profiles', data.profile);
          this.currentRouteModel().set('dataToImport.thesaurus', data.thesaurus);
        })
    }
  }

})
