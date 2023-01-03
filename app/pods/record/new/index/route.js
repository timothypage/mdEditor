import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  profile: service('custom-profile'),

  redirect() {
    let rec = this.store.createRecord('record');

    if (this.profile.get('active')) {
      rec.set('profile', this.profile.get('active'));
    }

    this.replaceWith('record.new.id', rec.id);
  }
});
