import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  profile: service('custom-profile'),

  redirect() {
    let rec = this.store.createRecord('record');

    console.log('record profile is ', rec.profile);

    console.log('setting record profile to', this.profile.get('active'));
    rec.set('profile', this.profile.get('active'));

    this.replaceWith('record.new.id', rec.id);
  }
});
