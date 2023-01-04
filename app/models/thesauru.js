import DS from 'ember-data';

export default DS.Model.extend({
  label: DS.attr('string'),
  keywordType: DS.attr('string'),
  citation: DS.attr(),
  keywords: DS.attr()
})
