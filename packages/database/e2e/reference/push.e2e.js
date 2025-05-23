/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

const { PATH } = require('../helpers');

const TEST_PATH = `${PATH}/push`;

describe('database().ref().push()', function () {
  describe('v8 compatibility', function () {
    beforeEach(async function beforeEachTest() {
      // @ts-ignore
      globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
    });

    afterEach(async function afterEachTest() {
      // @ts-ignore
      globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = false;
    });

    it('throws if on complete callback is not a function', function () {
      try {
        firebase.database().ref(TEST_PATH).push('foo', 'bar');
        return Promise.reject(new Error('Did not throw Error'));
      } catch (error) {
        error.message.should.containEql("'onComplete' must be a function if provided");
        return Promise.resolve();
      }
    });

    it('returns a promise when no value is passed', function () {
      const ref = firebase.database().ref(`${TEST_PATH}/boop`);
      const pushed = ref.push();
      return pushed
        .then(childRef => {
          pushed.ref.parent.toString().should.eql(ref.toString());
          pushed.toString().should.eql(childRef.toString());
          return pushed.once('value');
        })
        .then(snap => {
          should.equal(snap.val(), null);
          snap.ref.toString().should.eql(pushed.toString());
        });
    });

    it('returns a promise and sets the provided value', function () {
      const ref = firebase.database().ref(`${TEST_PATH}/value`);
      const pushed = ref.push(6);
      return pushed
        .then(childRef => {
          pushed.ref.parent.toString().should.eql(ref.toString());
          pushed.toString().should.eql(childRef.toString());
          return pushed.once('value');
        })
        .then(snap => {
          snap.val().should.equal(6);
          snap.ref.toString().should.eql(pushed.toString());
        });
    });

    it('returns a to the callback if provided once set', async function () {
      const callback = sinon.spy();
      const ref = firebase.database().ref(`${TEST_PATH}/callback`);
      const value = Date.now();
      ref.push(value, () => {
        callback();
      });
      await Utils.spyToBeCalledOnceAsync(callback);
    });

    it('throws if push errors', async function () {
      const ref = firebase.database().ref('nope');
      return ref
        .push('foo')
        .then(() => {
          throw new Error('Did not error');
        })
        .catch(error => {
          error.code.should.equal('database/permission-denied');
          return Promise.resolve();
        });
    });

    it('returns an error to the callback', async function () {
      const callback = sinon.spy();
      const ref = firebase.database().ref('nope');
      ref.push('foo', error => {
        error.code.should.equal('database/permission-denied');
        callback();
      });
      await Utils.spyToBeCalledOnceAsync(callback);
      callback.should.be.calledOnce();
    });
  });

  describe('modular', function () {
    it('returns a promise when no value is passed', function () {
      const { getDatabase, ref, push } = databaseModular;

      const dbRef = ref(getDatabase(), `${TEST_PATH}/boop`);
      const pushed = push(dbRef);
      return pushed
        .then(childRef => {
          pushed.ref.parent.toString().should.eql(dbRef.toString());
          pushed.toString().should.eql(childRef.toString());
          return pushed.once('value');
        })
        .then(snap => {
          should.equal(snap.val(), null);
          snap.ref.toString().should.eql(pushed.toString());
        });
    });

    it('returns a promise and sets the provided value', function () {
      const { getDatabase, ref, push } = databaseModular;

      const dbRef = ref(getDatabase(), `${TEST_PATH}/value`);
      const pushed = push(dbRef, 6);
      return pushed
        .then(childRef => {
          pushed.ref.parent.toString().should.eql(dbRef.toString());
          pushed.toString().should.eql(childRef.toString());
          return pushed.once('value');
        })
        .then(snap => {
          snap.val().should.equal(6);
          snap.ref.toString().should.eql(pushed.toString());
        });
    });

    it('throws if push errors', async function () {
      const { getDatabase, ref, push } = databaseModular;

      const dbRef = ref(getDatabase(), 'nope');
      try {
        await push(dbRef, 'foo');
        return Promise.reject(new Error('Did not throw Error'));
      } catch (error) {
        error.code.should.equal('database/permission-denied');
        return Promise.resolve();
      }
    });
  });
});
