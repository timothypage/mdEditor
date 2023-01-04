import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

export default Route.extend({
  profile: service('custom-profile'),
  settings: service(),

  redirect() {
    let rec = this.store.createRecord('record');

    const serviceDefaultProfileId = this.profile.get('active');
    const settingsDefaultProfileId = get(this.settings.data, 'defaultProfileId');
    if (settingsDefaultProfileId) {
      rec.set('profile', settingsDefaultProfileId);
    } else if (serviceDefaultProfileId) {
      rec.set('profile', serviceDefaultProfileId);
    }

    this.replaceWith('record.new.id', rec.id);
  }
});
