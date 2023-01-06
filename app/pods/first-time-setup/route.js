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
  settings: service(),

  url: null,

  model () {
    let queryParams = new URLSearchParams(window.location.search);

    // TODO: show some error if this isn't present
    const loadProfilesFrom = queryParams.get('loadProfilesFrom');

    return fetch('//' + loadProfilesFrom)
      .then(response => response.json())
      .then(data => {
        return {
          dataToImport: {
            defaultProfileId: data.defaultProfileId,
            contacts: (data.contact || []).map(addSelected),
            profiles: (data.profile || []).map(addSelected),
            // Default Ember pluralization thinks plural of thesaurus is thesaurus -_- I'm not going to mess with it
            thesaurus: (data.thesaurus || []).map(addSelected)
          },
          importing: false
        };
      });
  },

  actions: {
    async import () {
      set(this.currentRouteModel(), 'importing', true);

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
        }).flat();

      const importableThesaurus = this.currentRouteModel().dataToImport.thesaurus
        .filter(item => item._selected)
        .map(
          t => ({
            id: generateIdForRecord(),
            attributes: {
              label: t.label,
              citation: t.citation,
              "keyword-type": t.keywordType,
              keywords: t.keywords
            },
            type: 'thesaurus'
          })
        )

      this.store.importData(
        {
          data: [
            ...importableContacts,
            ...importableProfiles,
            ...importableThesaurus
          ]
        },
        { truncate: true, json: false }
      );

      if (importableProfiles.length && this.currentRouteModel().dataToImport.defaultProfileId) {

        // TODO less magic here
        // find the current profile with the correct identifier
        // (which is now in JSON under the `config` attribute),
        // and bactrack by one to get the `custom-profile` instead of `profile`
        // which is what we need to select the appropriate profile on record creation
        const profileId = importableProfiles[
          importableProfiles.findIndex(p => (p.attributes.config ? JSON.parse(p.attributes.config).identifier : null) === this.currentRouteModel().dataToImport.defaultProfileId) - 1
        ].id
        this.profile.set('active', profileId);
        defaultProfileId = profileId; // eslint-disable-line no-unused-vars

        let settings = this.settings.data;

        settings.set('defaultProfileId', profileId);
        await settings.save();
      }

      set(this.currentRouteModel(), 'importing', false);
    },

    getColumns (type) {
      return columns[type];
    }
  }
});
