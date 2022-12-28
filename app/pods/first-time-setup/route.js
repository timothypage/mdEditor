import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import EmberObject, { computed, set } from '@ember/object';

import { assign } from '@ember/polyfills';
import { JsonDefault as Contact } from 'mdeditor/models/contact';
import Base from 'ember-local-storage/adapters/base';


const addSelected = item => ({ ...item, _selected: true });
const generateIdForRecord = Base.create()
  .generateIdForRecord;

const Template = EmberObject.extend({
  init() {
    this._super(...arguments);

    set(this, 'id', generateIdForRecord());
  },
  attributes: computed(function () {
    return {
      json: null
    }
  }),
  type: null
});

const columns = {
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
  ]
}


export default Route.extend({
  store: service(),
  keyword: service(),

  model () {
    window.localStorage.clear();

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


  actions: {

    import () {
      const importableContacts = this.currentRouteModel().dataToImport.contacts
        .map(contact => {
        return Template.create({
          attributes: {
            json: JSON.stringify(assign(Contact.create(), contact))
          },
          type: 'contacts'
        })
      });

      const importableProfiles = this.currentRouteModel().dataToImport.profiles
        .map(profile => {
          return Template.create({
            attributes: {
              json: JSON.stringify(profile)
            },
            type: 'custom-profiles'
          })
        })

      this.store.importData({data: [...importableContacts, ...importableProfiles]}, {truncate: true, json: false})


      for (const thes of this.currentRouteModel().dataToImport.thesaurus) {
        console.log('importing thes', thes);
        this.keyword.get('thesaurus').pushObject(thes);
      }

    },

    getColumns (type) {
      return columns[type];
    }
  }
});
