import * as React from "react";
import {
  createStore,
  Store,
  applyMiddleware,
  StoreEnhancer,
  AnyAction,
  Middleware
} from "redux";
import { getFunctionHash } from "./util";
import { Provider } from "react-redux";

interface Action {
  type: string;
  payload?: any;
}

const rerer = store => next => action => {
  console.log("dispatching", action);
  let result = next(action);
  console.log("next state", store.getState());
  return result;
};

enum RibhduxStateMachine {
  IDLE,
  PROCESSING
}

class Ribhdux {
  // private feature: any;
  // private actions: Action[] = [];
  // private actionHash: any = {};
  private temp: any = {};
  private middleware: Middleware<any, any, any>[] = [];
  private store: Store | undefined = undefined;
  private currentAction: string = "";
  private internalState: RibhduxStateMachine = RibhduxStateMachine.IDLE;
  private initialState: any;
  private ribhduxKeys: string[] = [];
  public prevState: any = {};
  public nextState: any = {};

  protected payloadDraft: any = {};
  constructor(initialState: any) {
    this.initialState = initialState;
    this.ribhduxKeys = Object.keys(this);
    this.temp = initialState;
  }

  private recordMiddleware(store) {
    this.prevState = store.getState();
    return next => action => next(action);
  }

  get state(): any {
    if (this.store) return this.store.getState();
    return {};
  }

  public startDispatch(name: string) {
    this.internalState = RibhduxStateMachine.PROCESSING;
    this.currentAction = name;
  }

  public commitDispatch() {
    const anyPayloadDraft = Object.keys(this.payloadDraft).length > 0;
    const isCurrentActionNotEmpty = this.currentAction !== "";
    const capableToDispatch = isCurrentActionNotEmpty && anyPayloadDraft;

    if (capableToDispatch) this.doDispatch();
  }

  private doDispatch() {
    if (this.store) {
      const action = this.createActionFromCurrent();

      this.store.dispatch(action);
      this.resetActionAndPayload();
      this.initialState = RibhduxStateMachine.IDLE;
    }
  }

  private createActionFromCurrent() {
    const type = this.currentAction;
    return { type, ...this.payloadDraft };
  }

  private resetActionAndPayload() {
    this.payloadDraft = {};
    this.currentAction = "";
  }

  private filterByRibhduxKeys(keyName: string) {
    return !this.ribhduxKeys.includes(keyName);
  }

  private resetPayloadDraft() {
    if (Object.keys(this.payloadDraft).length <= 0) {
      this.payloadDraft = {};
    }
  }

  private redefineProperty(keyName: string) {
    const getter = keyName => () => {
      // console.log("temp", this.temp);

      // return this.state[keyName];
      return this.internalState === RibhduxStateMachine.PROCESSING
        ? this.temp[keyName]
        : this.state[keyName];
    };

    const setter = keyName => val => {
      // if (this.currentAction !== "") {
      //   this.temp[keyName] = val;
      // }
      this.resetPayloadDraft();
      this.temp[keyName] = val;
      this.payloadDraft[keyName] = val;
    };

    const definePropertyProps = {
      get: getter(keyName),
      set: setter(keyName)
    };

    Object.defineProperty(this, keyName, definePropertyProps);
  }

  protected createActionsFrom(store: any) {
    Object.keys(store)
      .filter(this.filterByRibhduxKeys.bind(this))
      .forEach(keyName => this.redefineProperty(keyName));

    this.use(this.recordMiddleware.bind(this));
    this.store = createStore(
      this.reducer,
      this.initialState,
      applyMiddleware(...this.middleware)
    );
  }

  private reducer(state: any, action: any): any {
    if (typeof state === "undefined") {
      return this.initialState;
    }

    delete action.type;
    return { ...state, ...action };
  }

  // Reselect Extension

  // redux extensions goes here
  use(...middleware: Middleware<any, any, any>[]) {
    this.middleware.push(...middleware);
  }

  // Time travelling features goes here
  undo() {
    console.log(this.prevState);
  }
  redo() {}

  // React things goes here
  static Manage(app: React.Component) {
    // return <Provider store={store}>{app}</Provider>;
  }
}

export default Ribhdux;
