import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import EmberObject, { computed, set } from '@ember/object';

import { assign } from '@ember/polyfills';
import { JsonDefault as Contact } from 'mdeditor/models/contact';
import Base from 'ember-local-storage/adapters/base';

import config from 'mdeditor/config/environment';

let {
  APP: { defaultProfileId }
} = config;

const addSelected = item => ({ ...item, _selected: true });
const generateIdForRecord = Base.create().generateIdForRecord;

const Template = EmberObject.extend({
  init () {
    this._super(...arguments);

    set(this, 'id', generateIdForRecord());
  },
  attributes: computed(function () {
    return {
      json: null
    };
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
};

export default Route.extend({
  store: service(),
  keyword: service(),
  profile: service('custom-profile'),

  url: null,

  model () {
    let queryParams = new URLSearchParams(window.location.search);

    // TODO: show some error if this isn't present
    const loadProfilesFrom = queryParams.get('loadProfilesFrom');

    return fetch('http://' + loadProfilesFrom)
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
        .filter(item => item._selected)
        .map(
        contact => {
          return Template.create({
            attributes: {
              json: JSON.stringify(assign(Contact.create(), contact))
            },
            type: 'contacts'
          });
        }
      );

      const importableProfiles = this.currentRouteModel().dataToImport.profiles
        .filter(item => item._selected)
        .map(profile => {

          return [
            {
              id: generateIdForRecord(),
              attributes: {
                uri: 'N/A',
                alias: profile.title,
                title: profile.title,
                description: profile.description,
                "profile-id": profile.identifier
              },
              type: 'custom-profiles'
            },
            {
              id: generateIdForRecord(),
              attributes: {
                uri: 'N/A',
                alias: profile.title,
                title: profile.title,
                "alt-description": profile.description,
                config: JSON.stringify({
                  ...profile
                })
              },
              type: 'profiles'


            }
          ]
        }).flat()

      this.store.importData(
        {
          data: [
            ...importableContacts,
            ...importableProfiles
          ]
        },
        { truncate: true, json: false }
      );

      const profileId = importableProfiles[0].id; // TODO: pick the first one, or should this be marked in some way from the api?

      this.profile.set('active', profileId);
      defaultProfileId = profileId;

      for (const thes of this.currentRouteModel().dataToImport.thesaurus) {
        if (!thes._selected) continue;

        // TODO make sure we don't create duplicates?
        this.keyword.get('thesaurus').pushObject(thes);
      }
    },

    getColumns (type) {
      return columns[type];
    }
  }
});
