import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import EmberObject, { get, set } from '@ember/object';

const addSelected = item => ({ ...item, _selected: true });

export default Route.extend({
  model () {
    return fetch('http://localhost:8000/mdjson-export-kbs.json')
      .then(response => response.json())
      .then(data => {
        return {
          dataToImport: {
            contacts: data.contact.map(addSelected),
            profiles: data.profile.map(addSelected),
            thesaurus: data.thesaurus.map(addSelected)
          }
        };
      });
  },

  columnsForContact: [
    {
      propertyName: 'name',
      title: 'Name'
    },
    {
      propertyName: 'positionName',
      title: 'Position Name'
    }
  ],

  columnsForProfile: [
    {
      propertyName: 'identifier',
      title: 'Identifier'
    },
    {
      propertyName: 'namespace',
      title: 'Namespace'
    },
    {
      propertyName: 'description',
      title: 'Description'
    }
  ],

  columnsForThesaurus: [
    {
      propertyName: 'label',
      title: 'Label'
    },
    {
      propertyName: 'edition',
      title: 'Edition'
    },
    {
      propertyName: 'keywordType',
      title: 'Keyword Type'
    }
  ],

  actions: {
    fetchData () {
      fetch('http://localhost:8000/mdjson-export-kbs.json')
        .then(response => response.json())
        .then(data => {
          console.log(this.currentRouteModel());
          console.log(data);
          this.currentRouteModel().set('dataToImport.contacts', data.contact);
          this.currentRouteModel().set('dataToImport.profiles', data.profile);
          this.currentRouteModel().set(
            'dataToImport.thesaurus',
            data.thesaurus
          );
        });
    },

    import () {


    },

    getColumns (type) {
      return get(this, type);
    }
  }
});
