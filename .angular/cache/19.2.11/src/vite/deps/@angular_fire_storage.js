import {
  FbsBlob,
  Location,
  StorageError,
  StorageErrorCode,
  StringFormat,
  TaskEvent,
  TaskState,
  UploadTask,
  _getChild,
  connectStorageEmulator,
  dataFromString,
  deleteObject,
  getBlob,
  getBytes,
  getDownloadURL,
  getMetadata,
  getStorage,
  getStream,
  invalidArgument,
  invalidRootOperation,
  list,
  listAll,
  ref,
  updateMetadata,
  uploadBytes,
  uploadBytesResumable,
  uploadString
} from "./chunk-T4DDKBO7.js";
import {
  AppCheckInstances,
  AuthInstances
} from "./chunk-6MK5KR6Y.js";
import "./chunk-Y7AADFW3.js";
import {
  FirebaseApp,
  FirebaseApps,
  VERSION,
  ɵAngularFireSchedulers,
  ɵgetAllInstancesOf,
  ɵgetDefaultInstanceOf,
  ɵzoneWrap
} from "./chunk-AWYSLXS2.js";
import "./chunk-DPUGBDKA.js";
import {
  registerVersion
} from "./chunk-6PDPPLFC.js";
import "./chunk-BHW3WDNO.js";
import "./chunk-KWMJD36P.js";
import "./chunk-E2WX2ZZH.js";
import {
  InjectionToken,
  Injector,
  NgModule,
  NgZone,
  Optional,
  makeEnvironmentProviders,
  setClassMetadata,
  ɵɵdefineInjector,
  ɵɵdefineNgModule
} from "./chunk-ZTAONLEJ.js";
import {
  Observable,
  concatMap,
  distinct,
  from,
  map,
  timer
} from "./chunk-OPJDHPG3.js";
import "./chunk-IYEYSCYL.js";
import "./chunk-K4KU7J5H.js";

// node_modules/rxfire/storage/index.esm.js
function fromTask(task) {
  return new Observable(function(subscriber) {
    var lastSnapshot = null;
    var complete = false;
    var hasError = false;
    var error = null;
    var emit = function(snapshot) {
      lastSnapshot = snapshot;
      schedule();
    };
    var id = null;
    var schedule = function() {
      if (!id) {
        id = setTimeout(function() {
          id = null;
          if (lastSnapshot) subscriber.next(lastSnapshot);
          if (complete) subscriber.complete();
          if (hasError) subscriber.error(error);
        });
      }
    };
    subscriber.add(function() {
      if (id) clearTimeout(id);
    });
    emit(task.snapshot);
    subscriber.add(task.on("state_changed", emit));
    subscriber.add(from(task).subscribe({
      next: emit,
      error: function(err) {
        hasError = true;
        error = err;
        schedule();
      },
      complete: function() {
        complete = true;
        schedule();
      }
    }));
  });
}
function percentage(task) {
  return fromTask(task).pipe(map(function(snapshot) {
    return {
      progress: snapshot.bytesTransferred / snapshot.totalBytes * 100,
      snapshot
    };
  }));
}

// node_modules/@angular/fire/fesm2022/angular-fire-storage.mjs
var Storage = class {
  constructor(auth) {
    return auth;
  }
};
var STORAGE_PROVIDER_NAME = "storage";
var StorageInstances = class {
  constructor() {
    return ɵgetAllInstancesOf(STORAGE_PROVIDER_NAME);
  }
};
var storageInstance$ = timer(0, 300).pipe(concatMap(() => from(ɵgetAllInstancesOf(STORAGE_PROVIDER_NAME))), distinct());
var PROVIDED_STORAGE_INSTANCES = new InjectionToken("angularfire2.storage-instances");
function defaultStorageInstanceFactory(provided, defaultApp) {
  const defaultStorage = ɵgetDefaultInstanceOf(STORAGE_PROVIDER_NAME, provided, defaultApp);
  return defaultStorage && new Storage(defaultStorage);
}
function storageInstanceFactory(fn) {
  return (zone, injector) => {
    const storage = zone.runOutsideAngular(() => fn(injector));
    return new Storage(storage);
  };
}
var STORAGE_INSTANCES_PROVIDER = {
  provide: StorageInstances,
  deps: [[new Optional(), PROVIDED_STORAGE_INSTANCES]]
};
var DEFAULT_STORAGE_INSTANCE_PROVIDER = {
  provide: Storage,
  useFactory: defaultStorageInstanceFactory,
  deps: [[new Optional(), PROVIDED_STORAGE_INSTANCES], FirebaseApp]
};
var StorageModule = class _StorageModule {
  constructor() {
    registerVersion("angularfire", VERSION.full, "gcs");
  }
  static ɵfac = function StorageModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _StorageModule)();
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _StorageModule
  });
  static ɵinj = ɵɵdefineInjector({
    providers: [DEFAULT_STORAGE_INSTANCE_PROVIDER, STORAGE_INSTANCES_PROVIDER]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(StorageModule, [{
    type: NgModule,
    args: [{
      providers: [DEFAULT_STORAGE_INSTANCE_PROVIDER, STORAGE_INSTANCES_PROVIDER]
    }]
  }], () => [], null);
})();
function provideStorage(fn, ...deps) {
  registerVersion("angularfire", VERSION.full, "gcs");
  return makeEnvironmentProviders([DEFAULT_STORAGE_INSTANCE_PROVIDER, STORAGE_INSTANCES_PROVIDER, {
    provide: PROVIDED_STORAGE_INSTANCES,
    useFactory: storageInstanceFactory(fn),
    multi: true,
    deps: [
      NgZone,
      Injector,
      ɵAngularFireSchedulers,
      FirebaseApps,
      // Defensively load Auth first, if provided
      [new Optional(), AuthInstances],
      [new Optional(), AppCheckInstances],
      ...deps
    ]
  }]);
}
var fromTask2 = ɵzoneWrap(fromTask, true);
var percentage2 = ɵzoneWrap(percentage, true);
var connectStorageEmulator2 = ɵzoneWrap(connectStorageEmulator, true);
var deleteObject2 = ɵzoneWrap(deleteObject, true, 2);
var getBlob2 = ɵzoneWrap(getBlob, true);
var getBytes2 = ɵzoneWrap(getBytes, true);
var getDownloadURL2 = ɵzoneWrap(getDownloadURL, true);
var getMetadata2 = ɵzoneWrap(getMetadata, true);
var getStorage2 = ɵzoneWrap(getStorage, true);
var getStream2 = ɵzoneWrap(getStream, true);
var list2 = ɵzoneWrap(list, true);
var listAll2 = ɵzoneWrap(listAll, true);
var ref2 = ɵzoneWrap(ref, true, 2);
var updateMetadata2 = ɵzoneWrap(updateMetadata, true, 2);
var uploadBytes2 = ɵzoneWrap(uploadBytes, true);
var uploadBytesResumable2 = ɵzoneWrap(uploadBytesResumable, true);
var uploadString2 = ɵzoneWrap(uploadString, true);
export {
  Storage,
  StorageError,
  StorageErrorCode,
  StorageInstances,
  StorageModule,
  StringFormat,
  FbsBlob as _FbsBlob,
  Location as _Location,
  TaskEvent as _TaskEvent,
  TaskState as _TaskState,
  UploadTask as _UploadTask,
  dataFromString as _dataFromString,
  _getChild,
  invalidArgument as _invalidArgument,
  invalidRootOperation as _invalidRootOperation,
  connectStorageEmulator2 as connectStorageEmulator,
  deleteObject2 as deleteObject,
  fromTask2 as fromTask,
  getBlob2 as getBlob,
  getBytes2 as getBytes,
  getDownloadURL2 as getDownloadURL,
  getMetadata2 as getMetadata,
  getStorage2 as getStorage,
  getStream2 as getStream,
  list2 as list,
  listAll2 as listAll,
  percentage2 as percentage,
  provideStorage,
  ref2 as ref,
  storageInstance$,
  updateMetadata2 as updateMetadata,
  uploadBytes2 as uploadBytes,
  uploadBytesResumable2 as uploadBytesResumable,
  uploadString2 as uploadString
};
//# sourceMappingURL=@angular_fire_storage.js.map
