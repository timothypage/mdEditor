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
      const importableContacts = this.currentRouteModel().dataToImport.contacts.map(
        contact => {
          return Template.create({
            attributes: {
              json: JSON.stringify(assign(Contact.create(), contact))
            },
            type: 'contacts'
          });
        }
      );

      const customProfile = {
        uri: 'https://tzwolak.com/profile.json',
        alias: 'TimZ Custom Profile alias',
        title: 'TimZ Custom Profile title',
        description: 'A super cool custom profile for TimZ datasets',
        'profile-id': 'full'
      };
      const customSchema = {};

      const customProfiles = [
        {
          id: generateIdForRecord(),
          attributes: {
            ...customProfile
          },
          type: 'custom-profiles'
        },
        {
          id: generateIdForRecord(),
          attributes: {
            uri: 'https://tzwolak.com/profile.json',
            alias: 'TimZ Profile alias',
            title: 'TimZ Profile title',
            "alt-description": 'Alternative Description for TimZ Profile',
            config: JSON.stringify({
              id: 'timz',
              namespace: 'org.adiwg.profile',
              alternalteId: ['timz'],
              title: 'TimZ Profile config title',
              description: 'Timz Config Description',
              version: '0.0.1',
              components: {
                record: {},
                contact: {},
                dictionary: {}
              },
              nav: {
                record: [
                  {
                    title: 'Main',
                    target: 'record.show.edit.main',
                    tip: 'Basic information about the resource.'
                  },
                  {
                    title: 'Metadata',
                    target: 'record.show.edit.metadata',
                    tip: 'Information about the metadata for the resource.'
                  },
                  {
                    title: 'Keywords',
                    target: 'record.show.edit.keywords',
                    tip: 'Terms used to describe the resource.'
                  },
                  {
                    title: 'Extent',
                    target: 'record.show.edit.extent',
                    tip: 'Information describing the bounds of the resource.'
                  },
                  {
                    title: 'Spatial',
                    target: 'record.show.edit.spatial',
                    tip:
                      'Information concerning the spatial attributes of the resource.'
                  },
                  {
                    title: 'Lineage',
                    target: 'record.show.edit.lineage',
                    tip: 'Information on the history of the resource.'
                  },
                  {
                    title: 'Taxonomy',
                    target: 'record.show.edit.taxonomy',
                    tip: 'Information on the taxa associated with the resource.'
                  },
                  {
                    title: 'Distribution',
                    target: 'record.show.edit.distribution',
                    tip: 'Information about obtaining the resource.'
                  },
                  {
                    title: 'Constraints',
                    target: 'record.show.edit.constraint',
                    tip:
                      'Information about constraints applied to the resource.'
                  },
                  {
                    title: 'Associated',
                    target: 'record.show.edit.associated',
                    tip:
                      'Other resources with a defined relationship to the resource.'
                  },
                  {
                    title: 'Documents',
                    target: 'record.show.edit.documents',
                    tip:
                      'Other documents related to, but not defining, the resource.'
                  },
                  {
                    title: 'Funding',
                    target: 'record.show.edit.funding',
                    tip:
                      'Information about funding allocated to development of the resource.'
                  },
                  {
                    title: 'Dictionaries',
                    target: 'record.show.edit.dictionary',
                    tip: 'Data dictionaries associated with the resource.'
                  }
                ],
                dictionary: [
                  {
                    title: 'Main',
                    target: 'dictionary.show.edit.index',
                    tip: 'Basic information about the dictionary.'
                  },
                  {
                    title: 'Citation',
                    target: 'dictionary.show.edit.citation',
                    tip: 'The citation for the dictionary.'
                  },
                  {
                    title: 'Domains',
                    target: 'dictionary.show.edit.domain',
                    tip: 'Information about defined value lists.'
                  },
                  {
                    title: 'Entities',
                    target: 'dictionary.show.edit.entity',
                    tip:
                      'Information about entities(tables) and attributes(columns or fields).'
                  }
                ]
              }
            })
          },
          type: 'profiles'
        }
      ];

      // const importableProfiles = this.currentRouteModel().dataToImport.profiles
      //   .map(profile => {
      //     return Template.create({
      //       attributes: {
      //         json: JSON.stringify(profile)
      //       },
      //       type: 'custom-profiles'
      //     })
      //   })

      this.store.importData(
        {
          data: [
            ...importableContacts,
            ...customProfiles
            // ...importableProfiles
          ]
        },
        { truncate: true, json: false }
      );

      const profileId = customProfiles[0].id; // TODO: pick the first one, or should this be marked in some way from the api?

      this.profile.set('active', profileId);
      defaultProfileId = profileId;

      for (const thes of this.currentRouteModel().dataToImport.thesaurus) {
        console.log('importing thes', thes);
        // TODO make sure we don't create duplicates?
        this.keyword.get('thesaurus').pushObject(thes);
      }
    },

    getColumns (type) {
      return columns[type];
    }
  }
});
